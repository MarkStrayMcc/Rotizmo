import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PAYMENT_REQUESTS_COLUMNS, PAYMENT_REQUESTS_DEFAULT_COLUMN } from "@app/finance/payment-requests/payment-requests.columns";
import {
    ClaimFinancialItemSanctionCheck,
    ClaimFinancialItemStatusChangeRequestDetail,
    PaymentRequest
} from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class PaymentRequestsHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private pendingPaymentRequestsApiUrl = "finance/pendingPaymentRequests";
    private paidPaymentRequestsApiUrl = "finance/paidPaymentRequests";
    private postClaimFinancialItemStatusChangeUrl = `finance/PostClaimFinancialItemStatusChange`;
    private postClaimFinancialItemStatusChangesUrl = `finance/PostClaimFinancialItemStatusChanges`;
    private postClaimFinancialItemSanctionCheckUrl = `finance/PostClaimFinancialItemSanctionCheck`;

    public getPendingPaymentRequests(): Observable<PaymentRequest[] | any> {
        return this.http.get(this.pendingPaymentRequestsApiUrl)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getPaidPaymentRequests(): Observable<PaymentRequest[] | any> {
        return this.http.get(this.paidPaymentRequestsApiUrl)
            .pipe(catchError(this.handleErrorObservable));
    }

    public PostClaimFinancialItemStatusChange(statusChange: ClaimFinancialItemStatusChangeRequestDetail): Observable<PaymentRequest | any> {
        return this.http.post(this.postClaimFinancialItemStatusChangeUrl, statusChange)
            .pipe(catchError(this.handleErrorObservable));
    }

    public PostClaimFinancialItemStatusChanges(statusChanges: ClaimFinancialItemStatusChangeRequestDetail[]): Observable<number | any> {
        return this.http.post(this.postClaimFinancialItemStatusChangesUrl, statusChanges)
            .pipe(catchError(this.handleErrorObservable));
    }

    public PostClaimFinancialItemSanctionCheck(claimFinancialItemId: number): Observable<ClaimFinancialItemSanctionCheck | any> {
        return this.http.post(this.postClaimFinancialItemSanctionCheckUrl + "?claimFinancialItemId=" + claimFinancialItemId, "")
            .pipe(catchError(this.handleErrorObservable));
    }

    public PostClaimFinancialItemSanctionChecks(claimFinancialItemIds: number[]): Observable<ClaimFinancialItemSanctionCheck[] | any> {
        return this.http.post(this.postClaimFinancialItemSanctionCheckUrl, claimFinancialItemIds)
            .pipe(catchError(this.handleErrorObservable));
    }

    /**
     * The list of columns to be displayed on the website
     */
    public getColumns(): any[] {
        return PAYMENT_REQUESTS_COLUMNS;
    }

    public getDefaultColumn() {
        return PAYMENT_REQUESTS_DEFAULT_COLUMN;
    }
}
