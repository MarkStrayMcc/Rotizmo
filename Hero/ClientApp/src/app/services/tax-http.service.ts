import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";

import { BaseService } from "./base.service";
import { catchError } from "rxjs/operators";
import { GoodsAndServicesTaxResponse } from "@app/quote/models/pricing/GoodsAndServicesTaxResponse";

@Injectable()
export class TaxHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getTotalPremiumTax(draftQuoteId: string): Observable<number | any> {
        const url = `/Tax/GetTotalTaxRate?draftQuoteId=${draftQuoteId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getGSTRate(inceptionDate: Date): Observable<number | any> {
        const inceptionDateString = typeof inceptionDate === "string" ? inceptionDate : inceptionDate.toISOString();

        const url = `/Tax/GetGSTRate?inceptionDate=${inceptionDateString}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getGoodsAndServicesTax(effectiveDate: Date, countryIsoCode: string, isRegistered: boolean): Observable<GoodsAndServicesTaxResponse | any> {
        const effectiveDateString = typeof effectiveDate === "string" ? effectiveDate : effectiveDate.toISOString();

        const url = `/Tax/GetGoodsAndServicesTax?effectiveDate=${effectiveDateString}&countryIsoCode=${countryIsoCode}&isRegistered=${isRegistered}`;

        return this.http.get(url);
    }
}
