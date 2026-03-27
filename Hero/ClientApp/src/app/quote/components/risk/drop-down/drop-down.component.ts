import { Component, forwardRef } from "@angular/core";

import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { BaseRiskQuestionValueAccessor } from "../base-risk-question/base-risk-question-value-accessor.component";

@Component({
    selector: "drop-down",
    templateUrl: "drop-down.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropDownComponent),
            multi: true
        }
    ]
})

export class DropDownComponent extends BaseRiskQuestionValueAccessor<number> {
}
