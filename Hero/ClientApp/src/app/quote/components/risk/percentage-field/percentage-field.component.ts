import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, Validators } from "@angular/forms";

import { BaseRiskQuestionValueAccessor } from "@app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component";

@Component({
    selector: "percentage-field",
    templateUrl: "./percentage-field.component.html",
    styleUrls: ["./percentage-field.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PercentageFieldComponent),
            multi: true
        }
    ]
})
export class PercentageFieldComponent extends BaseRiskQuestionValueAccessor<number> {
}
