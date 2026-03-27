import { Component, EventEmitter, forwardRef, Input, OnDestroy, Output } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DropDownItem, DropDownTypes } from "@app/models";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { filter, map, startWith, switchMap, takeUntil, tap } from "rxjs/operators";

@Component({
    selector: "autocomplete-dropdown",
    templateUrl: "autocomplete-dropdown.html",
    styleUrls: ["autocomplete-dropdown.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutocompleteDropdown),
            multi: true
        }
    ]
})
export class AutocompleteDropdown implements ControlValueAccessor, OnDestroy {

    @Input() public myControl: FormControl;
    @Input("dataSource") public dataSource: Observable<any>;
    @Input("placeholder") public placeholderText: string = "";
    @Input("isValid") public valid: boolean;
    @Input("selectedValue") public selectedValue: any;
    @Input() public serverFiltering: boolean = false;
    @Input() public customDisplayMethod: (item: any) => string = this.displayFn;

    @Output() public change = new EventEmitter<DropDownItem>();
    @Output() public selected = new EventEmitter<DropDownItem>();
    @Output() public onFocusEvent = new EventEmitter();
    @Output() public onFocusOutEvent = new EventEmitter();
    @Output() public onShowingDropdown = new EventEmitter<boolean>();

    public disabled: boolean = false;

    public filteredOptions: Observable<any>;
    public showingDropdown: boolean = false;
    public inFocus: boolean = false;

    public allOptions: DropDownItem[];
    public type = DropDownTypes.static;

    public isLoadingData: boolean = false;

    private regExpSpecialCharacters: RegExp = /[-[\]{}()*+?.\\^$|#\s]/g;
    private readonly destroyed$ = new ReplaySubject(1);

    constructor() {
        this.allOptions = [];
    }

    public writeValue(obj: any): void {
        this.selectedValue = obj;
    }

    public registerOnChange(fn: any): void { }

    public registerOnTouched(fn: any): void { }

    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public setServerData(option): Observable<any> {
        if (this.type === DropDownTypes.dynamic) {
            return this.dataSource;
        }
        return new BehaviorSubject(option).asObservable();
    }

    public setOption(options: any) {
        this.allOptions = options;
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public ngOnInit() {
        if (!this.serverFiltering) {
            this.filteredOptions = this.myControl.valueChanges
                .pipe(
                    startWith(null),
                    switchMap((option) => this.setServerData(option)),
                    map((option) => {
                        if (this.type === DropDownTypes.dynamic) {
                            this.setOption(option);
                        }
                        return option;
                    }),
                    map((option) => {
                        if (option && typeof option === "object") {
                            this.optionSelected();
                            if (this.type === DropDownTypes.static) {
                                return option.text;
                            }

                            return option;
                        } else {
                            return option;
                        }
                    }),
                    map((name) => name ? this.filter(name) : this.allOptions ? this.allOptions.slice() : null));
        } else {
            this.myControl.valueChanges.subscribe((value) => {
                if (value && value.length > 2) {
                    this.isLoadingData = true;
                }
            });
            this.dataSource.subscribe((results) => {
                if (this.filteredOptions !== this.dataSource) {
                    this.filteredOptions = this.dataSource;
                    this.allOptions = results;
                }
                this.isLoadingData = false;
            });
        }

        this.subscribeToEmptyValue();
    }

    public filter(name: string): DropDownItem[] {
        let options = null;
        if (this.type === DropDownTypes.dynamic) {
            options = this.allOptions.filter((option) => option.text);
            return options;
        }

        if (this.allOptions && this.allOptions.length !== 0) {
            if (name && name.length > 0) {
                name = name.replace(this.regExpSpecialCharacters, "\\$&");
                options = this.allOptions.filter((option) => new RegExp(`^.*${name}.*`, "gi").test(this.customDisplayMethod(option))).slice(0, 100);
            } else {
                options = this.allOptions.slice(0, 100);
            }
            return options;
        }
        return null;
    }

    public optionSelected() {
        if (this.selectedValue) {
            this.selectedValue = this.myControl.value;
        }

        if (this.change) {
            this.change.emit(this.myControl.value);
            this.selected.emit(this.myControl.value);
        }
    }

    public onMouseDown() {
        this.showingDropdown = true;
        this.onShowingDropdown.emit(true);
    }

    public onMouseUp() {
        this.showingDropdown = false;
        this.onShowingDropdown.emit(false);
    }

    public displayFn(item: any): string {
        if (typeof (item) === "string") {
            return item.toString();
        } else {
            return item ? item.text : "";
        }
    }

    public onFocus() {
        this.populateDropDown(false);
        this.inFocus = true;
        this.onFocusEvent.emit();
    }

    public onFocusOut() {
        this.onFocusOutEvent.emit();
        this.inFocus = false;
    }

    public onClick() {
        this.populateDropDown(true);
    }

    public populateDropDown(showList: boolean) {
        if (this.allOptions === null || this.allOptions.length === 0) {
            if (this.type === DropDownTypes.static && this.dataSource) {
                this.dataSource.subscribe((results) => {
                    this.allOptions = results;
                    if (showList && !this.myControl.value) {
                        this.myControl.patchValue("");
                    }
                },
                    (error) => {
                        this.allOptions = null;
                    });
            }
        } else {
            if (showList && !this.myControl.value) {
                this.myControl.patchValue("");
            }
        }
    }

    public setDataSource(dataSource: Observable<any>) {
        this.allOptions = null;
        this.dataSource = dataSource;
    }

    public clearSearch() {
        this.myControl.patchValue("");
    }

    private subscribeToEmptyValue = (): void => {
        this.myControl.valueChanges
            .pipe(
                takeUntil(this.destroyed$),
                filter((value => !value)),
                tap(() => this.selected.emit(this.myControl.value))
            )
            .subscribe();
    }
}
