import { Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { Currency } from "@app/models";
import { BaseRiskQuestionValueAccessor } from "@app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component";

@Component({
    selector: "risk-currency",
    templateUrl: "./risk-currency.component.html",
    styleUrls: ["./risk-currency.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RiskCurrencyComponent),
            multi: true
        }
    ]
})
export class RiskCurrencyComponent extends BaseRiskQuestionValueAccessor<number> {
    @Input() public currency: Currency = {
        id: 1,
        symbol: "£",
        isoCode: "GBP",
        name: "pound",
        rate: 1.0
    };
}
