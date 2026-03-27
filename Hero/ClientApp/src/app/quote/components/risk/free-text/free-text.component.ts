import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { BaseRiskQuestionValueAccessor } from "@app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component";

@Component({
    selector: "free-text",
    templateUrl: "./free-text.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FreeTextComponent),
            multi: true
        }
    ]
})
export class FreeTextComponent extends BaseRiskQuestionValueAccessor<string> {
}
