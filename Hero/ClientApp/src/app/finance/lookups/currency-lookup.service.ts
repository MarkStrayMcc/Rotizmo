import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { Currency } from "@app/models";

@Injectable()
export class CurrencyLookupService extends CachedLookupBaseService<Array<Currency>> {
    constructor(private readonly currencyService: CurrencyHttpService) {
        super();
    }

    public getData(): Observable<Array<Currency>> {
        return this.data$;
    }

    protected requestData(): Observable<Array<Currency>> {
        return this.currencyService.getCurrencies();
    }
}
