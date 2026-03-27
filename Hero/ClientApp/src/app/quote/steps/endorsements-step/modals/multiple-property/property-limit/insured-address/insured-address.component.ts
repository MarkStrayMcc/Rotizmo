import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, OnDestroy, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { ClientLocation, DropDownItem } from "@app/models";
import { DropdownService } from "@app/services/dropdown.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { combineLatest, Observable, of, ReplaySubject } from "rxjs";
import { distinctUntilChanged, first, map, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { InsuredAddressService } from "./insured-address.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "insured-address",
    styleUrls: ["insured-address.component.scss"],
    templateUrl: "insured-address.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => InsuredAddressComponent)
        }
    ]
})
export class InsuredAddressComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Output() readonly countrySelected = new EventEmitter<string>();

    public readonly formGroup: FormGroup;
    public readonly countryControl = new FormControl(null, [Validators.required, AutocompleteSelectedValidator]);
    public readonly stateControl = new FormControl(null, [AutocompleteSelectedValidator]);

    public countries$: Observable<DropDownItem[]>;
    public insuredAddresses$: Observable<ClientLocation[]>;
    public isReadonly$: Observable<boolean>;
    public isStateVisible$: Observable<boolean>;
    public states$: Observable<DropDownItem[]>;

    private readonly _destroyed$ = new ReplaySubject(1);

    private get clientLocationIdControl() { return this.formGroup.controls.clientLocationId; }
    private get countryIdControl() { return this.formGroup.controls.countryId; }
    private get stateProvinceCodeControl() { return this.formGroup.controls.stateProvinceCode; }

    constructor(
        private readonly dropdownService: DropdownService,
        private readonly insuredAddressService: InsuredAddressService
    ) {
        this.formGroup = this.buildFormGroup();
    }

    ngOnInit(): void {
        const clientLocationId$ = this.clientLocationIdControl.valueChanges.pipe(distinctUntilChanged(), shareReplay(1));

        this.insuredAddresses$ = this.getInsuredAddressesObservable(clientLocationId$);
        this.isReadonly$ = clientLocationId$.pipe(map(clientLocationId => !!clientLocationId));
        this.countries$ = this.dropdownService.getCountries().pipe(shareReplay(1));

        const country$ = this.getCountryObservable();

        this.states$ = country$.pipe(switchMap(this.getStates), shareReplay(1));
        this.isStateVisible$ = this.states$.pipe(map(states => states.length > 0));

        this.subscribeToClientLocationIdChange(clientLocationId$);
        this.subscribeToCountryChange(country$);
        this.subscribeToIsStateVisibleChange();
        this.subscribeToStateProvinceCodeChange();
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    onTouched: () => void = () => { };

    writeValue = (insuredAddress: ClientLocation): void => {
        this.formGroup.patchValue(insuredAddress || { clientLocationId: 0, countryId: null, stateProvinceCode: null });
    }

    registerOnChange(fn: (_: ClientLocation) => void) {
        this.formGroup.valueChanges.pipe(takeUntil(this._destroyed$)).subscribe(fn);
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    setDisabledState(disabled: boolean) {
        disabled ? this.formGroup.disable() : this.formGroup.enable();
    }

    public onCountrySelected = (country: DropDownItem): void => {
        const countryId = country?.value;

        if (this.countryIdControl.value !== countryId) {
            this.countryIdControl.setValue(countryId);
            this.stateProvinceCodeControl.setValue(null);
        }
    }

    public onStateSelected = (state: DropDownItem): void => {
        const stateProvinceCode = state?.value;

        if (this.stateProvinceCodeControl.value !== stateProvinceCode) {
            this.stateProvinceCodeControl.setValue(stateProvinceCode);
        }
    }

    public reset = (): void => {
        this.formGroup.reset({ clientLocationId: 0 });
    }

    private buildFormGroup = (): FormGroup => {
        return new FormGroup({
            address1: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
            address2: new FormControl(null, [Validators.maxLength(100)]),
            address3: new FormControl(null, [Validators.maxLength(100)]),
            city: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
            clientLocationId: new FormControl(0),
            countryId: new FormControl(null, [Validators.required]),
            county: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
            postcode: new FormControl(null, [Validators.required]),
            stateProvinceCode: new FormControl()
        });
    }

    private getInsuredAddressesObservable = (clientLocationId$: Observable<number>): Observable<ClientLocation[]> => {
        const initialClientLocationId$ = clientLocationId$.pipe(first());
        const selectedClientLocationIds$ = this.insuredAddressService.selectedClientLocationIds$;
        const insuredAddresses$ = combineLatest([selectedClientLocationIds$, initialClientLocationId$]).pipe(
            withLatestFrom(this.insuredAddressService.insuredAddresses$),
            map(this.findInsuredAddresses)
        );

        return insuredAddresses$;
    }

    private getCountryObservable = (): Observable<DropDownItem> => {
        const countryId$ = this.countryIdControl.valueChanges.pipe(distinctUntilChanged(), shareReplay(1));
        const country$ = combineLatest([countryId$, this.countries$]).pipe(map(this.findDropDownItem));

        return country$;
    }

    private subscribeToClientLocationIdChange = (clientLocationId$: Observable<number>): void => {
        clientLocationId$
            .pipe(
                takeUntil(this._destroyed$),
                withLatestFrom(this.insuredAddresses$),
                map(this.findInsuredAddress),
                tap(insuredAddress => this.writeValue(insuredAddress))
            )
            .subscribe();
    }

    private subscribeToCountryChange = (country$: Observable<DropDownItem>): void => {
        country$
            .pipe(
                takeUntil(this._destroyed$),
                tap(country => this.countryControl.setValue(country)),
                tap(country => this.countrySelected.emit(country?.hidden))
            )
            .subscribe();
    }

    private subscribeToIsStateVisibleChange = (): void => {
        this.isStateVisible$
            .pipe(
                takeUntil(this._destroyed$),
                tap(isStateVisible => isStateVisible ?
                    this.formGroup.controls.stateProvinceCode.enable() :
                    this.formGroup.controls.stateProvinceCode.disable()
                )
            )
            .subscribe();
    }

    private subscribeToStateProvinceCodeChange = (): void => {
        const stateProvinceCode$ = this.stateProvinceCodeControl.valueChanges.pipe(distinctUntilChanged(), shareReplay(1));

        combineLatest([stateProvinceCode$, this.states$])
            .pipe(
                takeUntil(this._destroyed$),
                map(this.findDropDownItem),
                tap((state) => this.stateControl.setValue(state))
            )
            .subscribe();
    }

    private getStates = (country: DropDownItem): Observable<DropDownItem[]> => {
        return !!country ? this.dropdownService.getCountryStates(country.hidden) : of([]);
    }
    
    private findInsuredAddress = ([clientLocationId, insuredAddresses]): ClientLocation => {
        return insuredAddresses.find((insuredAddress: ClientLocation) => insuredAddress.clientLocationId == clientLocationId);
    }

    private findInsuredAddresses = ([[selectedClientLocationIds, clientLocationId], insuredAddresses]): ClientLocation[] => {
        return insuredAddresses.filter((insuredAddress: ClientLocation) => 
            insuredAddress.clientLocationId === clientLocationId ||
            !selectedClientLocationIds.some((id: number) => id === insuredAddress.clientLocationId)
        );
    }

    private findDropDownItem = ([value, items]): DropDownItem => {
        return items.find((item: DropDownItem) => item.value === value);
    }
}
