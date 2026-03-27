import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import {
  ClaimFinancialItemEcfReconciliationRequest,
  EcfReconciliation,
  EcfReconciliationClaimFinancialItem,
  EcfReconciliationFinancialTransaction,
  FinancialTransactionEcfReconciliationRequest
} from "@app/models";
import { ECF_RECONCILIATION_FINANCIAL_TRANS_COLUMNS, ECF_RECONCILIATION_FINANCIAL_TRANS_DEFAULT_COLUMN } from "@app/finance/ecf-reconciliation-financial-trans/ecf-reconciliation-financial-trans.columns";
import { ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_COLUMNS, ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_DEFAULT_COLUMN } from "@app/finance/ecf-reconciliation-claim-financial-items/ecf-reconciliation-claim-financial-items.columns";
import { catchError } from "rxjs/operators";

@Injectable()
export class EcfReconciliationHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private ecfReconciliationApiUrl = "ecfReconciliation";

    public addOrUpdateEcfReconciliation(newReconciliation: EcfReconciliation): Observable<EcfReconciliation | any> {
        return this.http.post(this.ecfReconciliationApiUrl + "/ecfReconciliations", newReconciliation)
            .pipe(catchError(this.handleErrorObservable));
    }

    public deleteEcfReconciliation(reconciliationIdToDelete: number) {
        let deleteReconciliationUrl = this.ecfReconciliationApiUrl + "/ecfReconciliations/" + reconciliationIdToDelete;
        return this.http.delete(deleteReconciliationUrl)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getEcfReconciliationsFromUcr(ucr: string): Observable<EcfReconciliation[] | any> {

        let getEcfReconciliationsUrl = this.ecfReconciliationApiUrl + "/ecfReconciliations?ucr=" + ucr;
        return this.http.get(getEcfReconciliationsUrl)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getEcfUcrLookups(): Observable<string[] | any> {
        return this.http.get(this.ecfReconciliationApiUrl + "/ecfUcrLookups")
            .pipe(catchError(this.handleErrorObservable));
    }

    public reconcileEcfFinancialTransactions(ecfReconciliationRequests: FinancialTransactionEcfReconciliationRequest[]): Observable<EcfReconciliationFinancialTransaction[] | any> {
        return this.http.post(this.ecfReconciliationApiUrl + "/reconcileEcfFinancialTransactions", ecfReconciliationRequests)
            .pipe(catchError(this.handleErrorObservable));
    }

    public reconcileEcfClaimFinancialItems(ecfReconciliationRequests: ClaimFinancialItemEcfReconciliationRequest[]): Observable<EcfReconciliationClaimFinancialItem[] | any> {
        return this.http.post(this.ecfReconciliationApiUrl + "/reconcileEcfClaimFinancialItems", ecfReconciliationRequests)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getEcfFinancialTransactions(ecfReconciliationId: number, financialLedgerId: number, binderId: number, sectionId: number, riskCode: string, tags: string)
        : Observable<EcfReconciliationFinancialTransaction[] | any> {
        const params = this.getQueryParameters(ecfReconciliationId, financialLedgerId, binderId, sectionId, riskCode, tags);
        const url = this.ecfReconciliationApiUrl + "/ecfReconciliationFinancialTransactions" + params;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getEcfClaimFinancialItems(ecfReconciliationId: number, binderId: number, sectionId: number, riskCode: string)
        : Observable<EcfReconciliationClaimFinancialItem[] | any> {
        const params = this.getQueryParameters(ecfReconciliationId, null, binderId, sectionId, riskCode, null);
        const url = this.ecfReconciliationApiUrl + "/ecfReconciliationClaimFinancialItems" + params;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getFinancialTransColumns(): any[] {
        return ECF_RECONCILIATION_FINANCIAL_TRANS_COLUMNS;
    }

    public getDefaultFinancialTransColumn() {
        return ECF_RECONCILIATION_FINANCIAL_TRANS_DEFAULT_COLUMN;
    }

    public getClaimFinancialItemsColumns(): any[] {
        return ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_COLUMNS;
    }

    public getDefaultClaimFinancialItemsColumn() {
        return ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_DEFAULT_COLUMN;
    }

    private getQueryParameters(ecfReconciliationId : number, financialLedgerId: number, binderId: number, sectionId: number, riskCode: string, tags: string): string {
        const parameters: string[] = [];

        if (ecfReconciliationId) {
            parameters.push(`ecfReconciliationId=${ecfReconciliationId}`);
        }

        if (financialLedgerId) {
            parameters.push(`financialLedgerId=${financialLedgerId}`);
        }

        if (binderId) {
            parameters.push(`binderId=${binderId}`);
        }

        if (sectionId) {
            parameters.push(`sectionId=${sectionId}`);
        }

        if (riskCode) {
            parameters.push(`riskCode=${riskCode}`);
        }

        if (tags) {
            parameters.push(`tags=${tags}`);
        }

        if (parameters.length > 0) {
            return `?${parameters.join("&")}`;
        }

        return "";
    }
}
