import { Injectable } from "@angular/core";
import {Observable} from "rxjs";
import {CurrencyHttpService} from "@app/services/currency-http.service";
import {Currency} from "@app/models";
import { map } from 'rxjs/operators';

@Injectable()
export class CurrencyService {
    private currencyHttpService: CurrencyHttpService;

    constructor(currencyHttpService: CurrencyHttpService) {
        this.currencyHttpService = currencyHttpService;
    }

    public getCurrencyRateByIsoCode(isoCode: string): Observable<string | any> {
        return this.currencyHttpService.getCurrencyRateByIsoCode(isoCode);
    }

    public getCurrencyByIsoCode(isoCode: string): Observable<Currency> {
        return this.currencyHttpService.getCurrencies().pipe(map(currencies =>  currencies.find(c => c.isoCode === isoCode)));
    }
}
