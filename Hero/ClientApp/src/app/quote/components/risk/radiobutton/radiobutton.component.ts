import { Component, forwardRef } from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";

import { BaseRiskQuestionValueAccessor } from "./../base-risk-question/base-risk-question-value-accessor.component";

@Component({
    selector: "radiobutton",
    templateUrl: "./radiobutton.component.html",
    styleUrls: ["./radiobutton.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioButtonComponent),
            multi: true
        }
    ]
})

export class RadioButtonComponent extends BaseRiskQuestionValueAccessor<number> {
    protected initControl() {
        this.formControl = new FormControl({ value: null });
        this.valueChangesSubscription = this.formControl.valueChanges.subscribe(value => this.onChangeEvent(value));
    }
}
