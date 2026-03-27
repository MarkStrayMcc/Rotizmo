import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import {
    OutstandingFundsResponse,
    OutstandingFundContributionsResponse,
    OutstandingFundsTransferRequest,
    OutstandingFundsTransferResponse,
    MultipleOperationsResultProblemDetails
} from "@app/models";

@Injectable({
    providedIn: "root"
})
export class OutstandingFundsHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private readonly outstandingFundsBaseUrl = "finance/outstandingfunds";
    private readonly outstandingFundContributionsBaseUrl = "finance/outstandingfundcontributions/{id}";

    getOutstandingFunds(bankAccount: string, currencyIsoCode: string, ledgerReference: string): Observable<OutstandingFundsResponse | any> {
        let urlParams = new HttpParams();
        // https://www.tektutorialshub.com/angular/angular-pass-url-parameters-query-strings/
        if (!this.isUndefinedOrNullOrEmptyOrSpaces(bankAccount)) {
            urlParams = urlParams.set("bankAccount", bankAccount);
        }

        if (!this.isUndefinedOrNullOrEmptyOrSpaces(currencyIsoCode)) {
            urlParams = urlParams.set("currencyIsoCode", currencyIsoCode);
        }

        if (!this.isUndefinedOrNullOrEmptyOrSpaces(ledgerReference)) {
            urlParams = urlParams.set("ledgerReference", ledgerReference);
        }

        return this.http.get(this.outstandingFundsBaseUrl, { params: urlParams })
            .pipe(catchError(this.handleErrorObservable));
    }

    getOutstandingFundCarrierContributions(outstandingFundId: number): Observable<OutstandingFundContributionsResponse | any> {
        const url = this.outstandingFundContributionsBaseUrl.replace("{id}", outstandingFundId.toString());
        return this.http.get(url).pipe(catchError(this.handleErrorObservable));
    }

    private isUndefinedOrNullOrEmptyOrSpaces(inputString: string) {
        // https://expertcodeblog.wordpress.com/2018/05/21/typescript-regexp/
        const whiteSpaceRegex = new RegExp("^ *$");
        return (inputString === "undefined" || inputString === null || whiteSpaceRegex.test(inputString));
    }

    transferToOffice(outstandingFundsTransferRequest: OutstandingFundsTransferRequest)
        : Observable<MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse | any> {
        const url = "finance/transfertooffice";
        return this.http.post(url, outstandingFundsTransferRequest).pipe(catchError(this.handleErrorObservable));
    }

    /**
     * Makes a delete request to CoreApi via Hero MVC controller
     *
     * @param: {number} outstandingFundId  The id of the fund you want to delete
     * @param: {number} deletedByContactId - The cfc contact id of the user who initiated the delete
     *
     */
    public delete(outstandingFundId: number, deletedByContactId: number) {
        // HttpHeaders are immutable.
        // https://angular.io/guide/http#adding-and-updating-headers
        // either initialise it in the constructor or use the set method to clone and add a new
        // key value pair
        const headers = new HttpHeaders({
            "cfc-contact-id": deletedByContactId.toString()
        });
        const url = `${this.outstandingFundsBaseUrl}/${outstandingFundId}`;
        return this.http.delete(url, { headers }).pipe(catchError(this.handleErrorObservable));
    }
}
