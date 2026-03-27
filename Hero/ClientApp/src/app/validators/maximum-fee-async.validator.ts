import { Directive, Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NG_ASYNC_VALIDATORS, AsyncValidator, AbstractControl, ValidationErrors } from "@angular/forms";
import { FeeHttpService } from "@app/services/fee-http.service";
import { ModelMappingsHelper } from "@app/models/Mappings/ModelMappingsHelper";
import { QuoteService } from "@app/quote/services/quote.service";
import { of } from "rxjs";
import { timer } from "rxjs";

@Directive({
    selector: "[maximumFeeAsyncValidator][formControlName],[maximumFeeAsyncValidator][formControl],[maximumFeeAsyncValidator][ngModel]",
    providers: [{
        provide: NG_ASYNC_VALIDATORS,
        useExisting: MaximumFeeAsyncValidator,
        multi: true
    }]
})
@Injectable()
export class MaximumFeeAsyncValidator implements AsyncValidator {

    constructor(
        private feeHttpService: FeeHttpService,
        private quoteService: QuoteService
    ) { }

    validate(control: AbstractControl): Observable<ValidationErrors> {
        var quote = this.quoteService.getQuote();
        if (quote.pricingInformation && quote.pricingInformation.length > 0) {
            const debounceTimer = timer(500);
            return debounceTimer.pipe(
                switchMap(() => this.feeHttpService.getFee(ModelMappingsHelper.getFeeRequest(quote, control.value))),
                map(feeResponse => {
                    if (feeResponse.errorMessage === "Max fee has been applied") {
                        return { "max": true };
                    }
                    return null;
                })
            );
        }
        return of(null);
    }
}
