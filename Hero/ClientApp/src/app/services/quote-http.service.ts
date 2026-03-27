import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { BaseService } from "@app/services/base.service";
import {
    PricingGroup,
    Quote,
    QuoteData,
    QuoteBindRequest,
    QuoteBindResponse,
    QuotePublishRequest,
    SaveQuoteResponse
} from "@app/models";
import { catchError, switchMap } from "rxjs/operators";
import { UserService } from "@app/services/user.service";

@Injectable()
export class QuoteHttpService extends BaseService {

    constructor(
        http: HttpClient,
        private userService: UserService
    ) {
        super(http);
    }

    public getMainData(enquiryId: number): Observable<Quote | any> {
        const url = `/QuoteData?enquiryId=${enquiryId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getRenewalQuoteData(enquiryId: number): Observable<QuoteData | any> {
        const url = `/QuoteDataV2?enquiryId=${enquiryId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public LoadFromQuoteRef(quoteRef: number): Observable<Quote | any> {
        const url = `/LoadFromQuoteRef?quoteRef=${quoteRef}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public saveDraft(quote: Quote): Observable<Quote | any> {
        const url = `/Quote/SaveDraft`;
        return this.postQuote(url, quote);
    }

    public sendQuote(quote: Quote): Observable<Quote | any> {
        const url = `/Quote/Send`;
        return this.postQuote(url, quote);
    }

    public insertQuote(quote: Quote): Observable<SaveQuoteResponse | any> {
        const url = `/Quote/SaveQuote`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, quote, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public bindQuote(bindRequest: QuoteBindRequest): Observable<QuoteBindResponse | any> {
        const url = `/Quote/Bind`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, bindRequest, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public confirmQuoteSent(quoteId: number, underwriter: string): Observable<boolean | any> {
        const url = `/ConfirmQuoteSent?quoteId=${quoteId}&underwriter=${underwriter}`;
        return this.http.post(url, null)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public publishQuote(quotePublishRequest: QuotePublishRequest): Observable<boolean | any> {
        const url = `/Quote/PublishQuote`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, quotePublishRequest, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public isPublishableQuote(quoteReference: number): Observable<boolean | any> {
        const url = `/Quote/${quoteReference}/is-publishable`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getPricingGroups(quoteId: number): Observable<PricingGroup[] | any> {
        const url = `/quote/pricinggroups?quoteId=${quoteId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    private postQuote(url: string, quote: Quote): Observable<Quote | any> {
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, quote, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

}
