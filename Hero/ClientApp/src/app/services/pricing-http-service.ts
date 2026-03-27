import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BinderRatingEngineOutput, CommissionRate, Quote } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from 'rxjs/operators';

@Injectable()
export class PricingHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getDefaultPricingInformation(draftQuoteId: string): Observable<BinderRatingEngineOutput[] | any> {
        let url: string = `/pricing/getdefaultpricinginformation?draftQuoteId=${draftQuoteId}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getDefaultPricingInformationForSavedQuote(quote: Quote, hasAgreedPremium: boolean): Observable<BinderRatingEngineOutput[] | any> {
        const url: string = `/pricing/getdefaultpricinginformationforsavedquote?hasAgreedPremium=${hasAgreedPremium}`;
        return this.http.post(url, quote)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getCommissionRate(brokerTeamId: number, productId: number): Observable<CommissionRate | any> {
        const url: string = `/pricing/getdefaultcommissionrate?brokerTeamId=${brokerTeamId}&productId=${productId}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
