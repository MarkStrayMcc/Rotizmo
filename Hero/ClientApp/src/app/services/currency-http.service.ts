import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "./base.service";
import { Currency } from "@app/models";
import { HttpClient } from "@angular/common/http";
import { catchError, shareReplay } from "rxjs/operators";
import { Memoize } from "@app/shared/decorators/memoize.decorator";

@Injectable()
export class CurrencyHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    @Memoize()
    public getCurrencies(): Observable<Currency[]> {
        const url = `/currency/currencies`;
        return this.http.get<Currency[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    public getCurrencyRateByIsoCode(isoCode: string): Observable<number> {
        const url = `/currency/CurrencyRate?isocode=${isoCode}`;
        return this.http.get<number>(url).pipe(catchError(this.handleErrorObservable));
    }
}
