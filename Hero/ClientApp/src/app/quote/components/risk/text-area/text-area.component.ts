import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { BaseRiskQuestionValueAccessor } from "@app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component";

@Component({
    selector: "text-area",
    templateUrl: "./text-area.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextAreaComponent),
            multi: true
        }
    ]
})
export class TextAreaComponent extends BaseRiskQuestionValueAccessor<string> {
}
