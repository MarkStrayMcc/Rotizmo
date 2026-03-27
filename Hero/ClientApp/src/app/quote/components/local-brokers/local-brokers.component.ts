import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Host, Input, OnDestroy, OnInit, Optional, SkipSelf } from "@angular/core";
import { ControlContainer, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from "@angular/forms";
import { isCanada } from "@app/helpers";
import { BrokerTeam, ClientLocation, FeatureAccess, Quote } from "@app/models";
import { BrokerTeamHttpService } from "@app/quote/services/broker-team.http-service";
import { CountryService } from "@app/quote/services/country.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { FeaturesHttpService } from '@app/services/features-http.service';
import { RequestEnrichmentHttpService } from '@app/services/request-enrichment-http.service';
import { AutocompleteValidator } from "@app/validators/autocomplete-selected.validator";
import { isEqual } from "lodash";
import { Observable, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, pairwise, shareReplay, switchMap, takeUntil, tap } from "rxjs/operators";

@Component({
    selector: "local-brokers",
    templateUrl: "./local-brokers.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => LocalBrokersComponent)
        },
        {
            provide: NG_VALIDATORS,
            multi: true,
            useExisting: forwardRef(() => LocalBrokersComponent)
        }
    ]
})

export class LocalBrokersComponent implements AfterContentInit, ControlValueAccessor, OnDestroy, OnInit, Validator {
    @Input() formControlName: string;
    @Input() set required(value: boolean) {
        !!value ? this.formControl.addValidators(Validators.required) : this.formControl.removeValidators(Validators.required);
    }

    public formControl = new FormControl(null, [AutocompleteValidator<BrokerTeam>(team => team.id)]);
    public localBrokers$: Observable<BrokerTeam[]>;
    public quote: Quote = this.quoteService.getQuote();

    private readonly _destroyed$ = new Subject<void>();
    private readonly _defaultCanadianBrokerTeamId = 11824;
    private readonly _isDefaultCanadianBrokerFeatureActive$ = this.featureService.isFeatureActive('setDefaultCanadianBroker');
    private _isDefaultCanadianBrokerFeatureActive: FeatureAccess = null;

    constructor(
        @Optional() @Host() @SkipSelf() private readonly controlContainer: ControlContainer,
        private readonly brokerTeamHttpService: BrokerTeamHttpService,
        private readonly countryService: CountryService,
        private readonly quoteService: QuoteService,
        private readonly cd: ChangeDetectorRef,
        private readonly requestEnrichmentHttpService: RequestEnrichmentHttpService,
        private readonly featureService: FeaturesHttpService
    ) {
    }

    ngOnInit(): void {
        const insuredLocation$: Observable<ClientLocation> = this.quoteService.quote.pipe(map(quote => quote.insuredLocation), distinctUntilChanged(isEqual));
        this.localBrokers$ = this.getLocalBrokersObservable(insuredLocation$);
        this.subscribeToInsuredLocationChange(insuredLocation$);
        this._isDefaultCanadianBrokerFeatureActive$.pipe(takeUntil(this._destroyed$), tap((feature: FeatureAccess | any) => this._isDefaultCanadianBrokerFeatureActive = feature)).subscribe();
        insuredLocation$
            .pipe(
                takeUntil(this._destroyed$),
                filter(location => isCanada(location)),
                switchMap(location =>
                    this.requestEnrichmentHttpService
                        .getApprovedStatesByCountryId(location.country.countryId)
                        .pipe(
                            filter(approvedStates =>
                                approvedStates?.includes(location.stateProvinceCode)
                            ),
                            switchMap(() => this.localBrokers$),
                            filter(brokers => !!brokers?.length),
                            map(brokers => brokers.find(b => b.id === this._defaultCanadianBrokerTeamId)),
                            filter(defaultBroker => defaultBroker?.id > 0 && this.isEligibleForDefaultBroker() === true),
                        )
                )
            )
            .subscribe(defaultBroker => {
                if (!defaultBroker || !this._isDefaultCanadianBrokerFeatureActive?.hasAccess) {
                    return;
                }
                this.writeValue(defaultBroker);
                this.cd.markForCheck();
            });

    }

    ngAfterContentInit(): void {
        if (!!this.controlContainer) {
            this.controlContainer.control.get(this.formControlName).markAsTouched = () => {
                this.formControl.markAsTouched();
                this.cd.markForCheck();
            }
        }
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    onTouched: () => void = () => { };

    writeValue = (localBroker: BrokerTeam): void => {
        this.formControl.setValue(localBroker);
    }

    registerOnChange(fn: (_: BrokerTeam) => void) {
        this.formControl.valueChanges.pipe(takeUntil(this._destroyed$)).subscribe(fn);
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    setDisabledState(disabled: boolean) {
        disabled ? this.formControl.disable() : this.formControl.enable();
    }

    validate(): ValidationErrors {
        return this.formControl.errors;
    }

    public getName(brokerTeam: BrokerTeam): string {
        return brokerTeam ? `${brokerTeam.broker.companyName} (${brokerTeam.broker.city}, ${brokerTeam.name})` : "";
    }

    private getLocalBrokersObservable = (insuredLocation$: Observable<ClientLocation>): Observable<BrokerTeam[]> => {
        return insuredLocation$.pipe(
            filter(insuredLocation => isCanada(insuredLocation) || this.countryService.isEeaCountry(insuredLocation.country.isoCode)),
            map(insuredLocation => isCanada(insuredLocation) ? ["CA"] : CountryService.eeaCountryIsoCodes),
            switchMap(countryIsoCodes => this.brokerTeamHttpService.get(countryIsoCodes)),
            shareReplay(1)
        );
    }

    private isEligibleForDefaultBroker(): boolean {
        const today = new Date();
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);

        if (this.formControl.value?.id > 0 && this.quote?.quoteReference > 0 &&  this.quote.quoteDate.toDateString() > oneMonthAgo.toDateString()) {
            return false;
        }

        return true;
    }

    private subscribeToInsuredLocationChange = (insuredLocation$: Observable<ClientLocation>): void => {
        insuredLocation$
            .pipe(
                takeUntil(this._destroyed$),
                pairwise(),
                filter(([previous, current]) => (!isCanada(current) && !this.countryService.isEeaCountry(current.country.isoCode))
                    || (isCanada(previous) && this.countryService.isEeaCountry(current.country.isoCode))
                    || (isCanada(current) && this.countryService.isEeaCountry(previous.country.isoCode))),
                tap(() => this.formControl.setValue(null))
            )
            .subscribe();
    }
}
