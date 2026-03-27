import { Component, forwardRef, OnInit, OnDestroy, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR, FormControl, ControlValueAccessor } from "@angular/forms";
import { BaseRiskQuestionValueAccessor } from "../base-risk-question/base-risk-question-value-accessor.component";
import { RiskQuestionOption, RiskQuestion } from "@app/models";
import { Observable } from 'rxjs';

@Component({
    selector: "drop-down-with-validation",
    templateUrl: "drop-down-with-validation.component.html",
    styleUrls: ["./drop-down-with-validation.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropDownWithValidationComponent),
            multi: true
        }
    ]
})

export class DropDownWithValidationComponent extends BaseRiskQuestionValueAccessor<string> implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public riskQuestion: RiskQuestion;

    public onChangeEvent: (value: any) => void = (_: any) => { };
    public onTouchEvent: () => void = () => { };

    public filteredOptions: Observable<RiskQuestionOption[]>;
    public disabled: boolean = false;
    public selectedOption: string;
    public isOptionsListVisible: boolean;

    public ngOnInit(): void {
        this.formControl = new FormControl({ value: null });
        this.valueChangesSubscription = this.formControl.valueChanges.subscribe(value => this.valueChangehandler(value));
        this.isOptionsListVisible = false;
    }
    public ngOnDestroy(): void {
        this.valueChangesSubscription.unsubscribe();
    }

    public writeValue(value: string): void {
        const riskQuestionOption = this.riskQuestion.options.find(x => x.uid === value);

        this.formControl.setValue(riskQuestionOption);
        this.selectedOption = !riskQuestionOption ? "" : riskQuestionOption.text;
    }

    public setSelectedOption(optionSelected: RiskQuestionOption) {
        this.formControl.setValue(optionSelected);
        this.onChangeEvent(optionSelected.uid);
        this.selectedOption = optionSelected.text;
        this.toggleOptionsVisibility();
        this.onTouchEvent();
    }

    public toggleOptionsVisibility() {
        if(this.formControl.enabled){
            this.isOptionsListVisible = !this.isOptionsListVisible;
        }
    }

    public registerOnChange(onChangeFunction: (value: any) => void): void {
        this.onChangeEvent = onChangeFunction;
    }

    public registerOnTouched(onTouchedFunction: () => void): void {
        this.onTouchEvent = onTouchedFunction;
    }

    public valueChangehandler(value: RiskQuestionOption) {
        const riskSelectOptionId = value ? value.uid : null;
        this.onChangeEvent(riskSelectOptionId);
        this.onTouchEvent();
    }

}
