import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, Output, EventEmitter, forwardRef } from "@angular/core";
import { FormGroup, FormControl, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { isEqual } from "lodash";
import { Subscription } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

@Component({
    selector: "percentage-input",
    templateUrl: "./percentage-input.component.html",
    styleUrls: ["./percentage-input.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PercentageInputComponent),
            multi: true
        }
    ]
})
export class PercentageInputComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
    @Input() public defaultValue: number = 100;
    @Input() public isRequired: boolean = false;
    @Input() public hasWarning: boolean = false;
    @Input() public warningText: string;
    @Input() public allowNegative: boolean = false;
    @Input() public allowDecimal: boolean = false;
    @Input() public minValue: number = 0;
    @Input() public maxValue: number = 100;
    @Input() public decimalPlaces: number = 2;
    @Input() public readonly: boolean = false;

    @Output() public valueChange = new EventEmitter<number>();
    @Output() public percentageFormCreated = new EventEmitter<FormGroup>();
    @Output() public focus: EventEmitter<boolean> = new EventEmitter<boolean>();

    public readonly percentageForm: FormGroup;
    public percentageFormErrors = new Array<string>();
    public isDisabled: boolean = false;

    private readonly validNumberFormatRegExp = new RegExp(/^-?\d*(\.\d+)?$/);
    private readonly duplicateDecimalPointsRegExp = new RegExp(/(\.)(?=.*\.*\1)/g);
    private readonly duplicateMinusSignRegExp = new RegExp(/(?!^)-/g);

    private decimalPlacesFilterRegExp: RegExp;
    private valueChangesSubscription: Subscription;

    private changeEvent: any;
    private touchEvent: any;
    
    constructor() {
        this.percentageForm = new FormGroup({
            percentage: new FormControl()
        });
    }

    public ngOnInit() {
        this.percentageFormCreated.emit(this.percentageForm);

        this.updateDecimalPlacesFilterRegExp();
        this.updateValidators();

        this.valueChangesSubscription = this.percentageForm.valueChanges
            .pipe(distinctUntilChanged(isEqual))
            .subscribe(data => this.onValueChanged(data));

        this.percentageControl.setValue(this.defaultValue);

        if (this.readonly) {
            this.percentageForm.disable();
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {

        if (changes["defaultValue"] &&
            !changes["defaultValue"].isFirstChange() &&
            this.defaultValue !== this.getOutputNumber(this.percentageControl.value)) {
            this.percentageControl.setValue(this.defaultValue);
        }

        if (changes["decimalPlaces"] && !changes["decimalPlaces"].isFirstChange()) {
            this.updateDecimalPlacesFilterRegExp();
        }

        if (changes["isRequired"] && !changes["isRequired"].isFirstChange() ||
            changes["minValue"] && !changes["minValue"].isFirstChange() ||
            changes["maxValue"] && !changes["maxValue"].isFirstChange()) {
            this.updateValidators();
        }
    }

    public ngOnDestroy(): void {
        if (this.valueChangesSubscription) {
            this.valueChangesSubscription.unsubscribe();
        }
    }

    public hasError(): boolean {
        return this.percentageForm.invalid && (this.percentageForm.touched || this.percentageForm.dirty);
    }

    // blur event handling
    public blurred() {
        this.focus.emit(false);

        if (this.touchEvent) {
            this.touchEvent();
        }
    }

    public focussed() {
        this.focus.emit(true);
    }

    // implement control value accessor
    public writeValue(obj: any): void {
        this.percentageControl.setValue(obj);
    }
    public registerOnChange(fn: any): void {
        this.changeEvent = fn;
    }
    public registerOnTouched(fn: any): void {
        this.touchEvent = fn;
    }
    public setDisabledState(isDisabled: boolean) {
        this.isDisabled = isDisabled;
        if (isDisabled) {
            this.percentageForm.disable();
        } else {
            this.percentageForm.enable();
        }
    }

    private get percentageControl() {
        return this.percentageForm.get("percentage") || undefined;
    }

    private validationMessages = {
        required: () => "Required",
        min: () => `Percentage must be greater than or equal to ${this.minValue}`,
        max: () => `Percentage must be less than or equal to ${this.maxValue}`,
        pattern: () => "Invalid number format"
    };


    private updateValidators() {
        const validators = [Validators.max(this.maxValue)];

        if (this.minValue !== null) {
            validators.push(Validators.min(this.minValue));
        }

        if (this.isRequired) {
            validators.push(Validators.required);
        }

        this.percentageControl.setValidators(validators);
    }

    private updateDecimalPlacesFilterRegExp() {
        this.decimalPlacesFilterRegExp = new RegExp(`^-?\\d*\\.\\d{1,${this.decimalPlaces}}`);
    }

    private onValueChanged(data?: any) {
        if (!this.percentageControl) {
            return;
        }

        if (data && data.hasOwnProperty("percentage")) {
            this.emitPercentageChange(data.percentage);
        }

        this.percentageFormErrors = [];
        if (!this.percentageControl.valid) {
            this.addFormErrors();
        }
    }

    private emitPercentageChange(percentage: string) {
        if (percentage === null || percentage === "" || percentage === undefined) {
            let value = this.getOutputNumber(percentage);
            this.valueChange.emit(value);
            if (this.changeEvent) {
                this.changeEvent(value);
            }
        } else {
            const filteredValue = this.filterValue(percentage.toString());
            this.percentageControl.setValue(filteredValue, { emitEvent: false });

            if (this.validNumberFormatRegExp.test(filteredValue)) {
                let value = this.getOutputNumber(filteredValue);
                this.valueChange.emit(value);
                if (this.changeEvent) {
                    this.changeEvent(value);
                }
            }
        }
    }

    private filterValue(percentage: string): string {
        percentage = percentage.replace(this.duplicateMinusSignRegExp, "");

        let reversedPercentage = this.getReversedText(percentage);
        reversedPercentage = reversedPercentage.replace(this.duplicateDecimalPointsRegExp, "");
        percentage = this.getReversedText(reversedPercentage);

        const match = this.decimalPlacesFilterRegExp.exec(percentage);

        if (match && match[0]) {
            percentage = match[0];
        }

        return percentage;
    }

    private getReversedText(textValue: string): string {
        return textValue.split("").reverse().join("");
    }

    private getOutputNumber(value: string): number {
        const output = Number.parseFloat(value);

        if (Number.isNaN(output)) {
            return null;
        }

        return output;
    }

    private addFormErrors() {
        const controlErrors = this.percentageControl.errors;
        for (const key in controlErrors) {
            if (controlErrors.hasOwnProperty(key)) {
                this.percentageFormErrors.push(this.validationMessages[key]());
            }
        }
    }
}
