import { Subscription } from "rxjs";

import { Component, forwardRef, Input, OnDestroy, OnInit } from "@angular/core";
import { ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
    selector: "quote-selector",
    templateUrl: "./quote-selector.component.html",
    styleUrls: ["./quote-selector.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => QuoteSelectorComponent),
            multi: true
        }
    ]
})
export class QuoteSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public quoteIds: number[];
    @Input() public primaryQuoteId: number;

    public form: FormGroup;
    
    protected onChangeHandler: (value: number[]) => void = (_: any) => { };
    protected onTouchedHandler: () => void = () => {};

    private valueChangeSubscription: Subscription;

    constructor(private formBuilder: FormBuilder) {}

    public writeValue(value: number[]): void {}

    public registerOnChange(onChangeHandler: (value: number[]) => void): void {
        this.onChangeHandler = onChangeHandler;
    }

    public registerOnTouched(onTouchedHandler: () => void): void {
        this.onTouchedHandler = onTouchedHandler;
    }

    public setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.form.disable();
        } else {
            this.form.enable();
        }
    }

    public ngOnInit(): void {
        const formValues = this.getOrderedQuoteIds()
            .map(quoteId => this.formBuilder.group({
                quoteId,
                selected: this.primaryQuoteId === quoteId
            }));

        this.form = new FormGroup({ values: this.formBuilder.array(formValues) });

        const primaryControl = (this.form.controls.values as FormArray).controls
            .find(control => control.value.quoteId === this.primaryQuoteId);

        if (primaryControl) {
            primaryControl.disable();
        }

        this.valueChangeSubscription = this.form.valueChanges.subscribe(() => this.valueChangeHandler());
    }

    public ngOnDestroy(): void {
        this.valueChangeSubscription.unsubscribe();
    }

    private getOrderedQuoteIds() {
        const quoteIds = [];

        quoteIds.push(this.primaryQuoteId);

        this.quoteIds
            .filter(quoteId => quoteId !== this.primaryQuoteId)
            .forEach(quoteId => quoteIds.push(quoteId));

        return quoteIds;
    }

    private valueChangeHandler() {
        this.onTouchedHandler();

        const quoteIds = [this.primaryQuoteId];

        this.form.get("values").value
            .filter(x => x.selected)
            .map(x => x.quoteId)
            .forEach(quoteId => quoteIds.push(quoteId));

        this.onChangeHandler(quoteIds);
    }
}
