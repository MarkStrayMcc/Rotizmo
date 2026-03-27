import { Component, forwardRef, Input, OnDestroy, OnInit } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { BaseRiskQuestionValueAccessor } from "@app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component";

@Component({
    selector: "integer-field",
    templateUrl: "./integer.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IntegerComponent),
            multi: true
        }
    ]
})
export class IntegerComponent extends BaseRiskQuestionValueAccessor<number> {
}
