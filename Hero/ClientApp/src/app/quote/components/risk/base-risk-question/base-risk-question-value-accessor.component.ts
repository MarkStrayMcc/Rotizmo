import { Input, OnDestroy, OnInit, Directive } from "@angular/core";
import { ControlValueAccessor, FormControl } from "@angular/forms";

import { Subscription } from "rxjs";

import { RiskQuestion } from "@app/models";

@Directive()
export class BaseRiskQuestionValueAccessor<T> implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public riskQuestion: RiskQuestion;

    public formControl: FormControl;
    public onChangeEvent: (value: T) => void = (_: any) => { };
    public onTouchEvent: () => void = () => { };
    
    protected valueChangesSubscription: Subscription;

    public writeValue(value: T): void {
        this.formControl.setValue(value);
    }

    public registerOnChange(onChangeFunction: (value: T) => void): void {
        this.onChangeEvent = onChangeFunction;
    }

    public registerOnTouched(onTouchedFunction: () => void): void {
        this.onTouchEvent = onTouchedFunction;
    }

    public setDisabledState?(isDisabled: boolean): void {
        isDisabled ? this.formControl.disable() : this.formControl.enable();
    }

    public hasError(): boolean {
        return this.formControl && this.formControl.invalid && (this.formControl.touched || this.formControl.dirty);
    }

    public ngOnInit(): void {
        this.initControl();
    }

    public ngOnDestroy(): void {
        this.handleDestroy();
    }

    protected initControl() {
        this.formControl = new FormControl({ value: null });
        this.valueChangesSubscription = this.formControl.valueChanges.subscribe(value => this.onChangeEvent(value));
    }

    protected handleDestroy() {
        this.valueChangesSubscription.unsubscribe();
    }
}
