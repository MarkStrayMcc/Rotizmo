import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
    ECF_RECONCILIATION_SUMMARY_COLUMNS,
    ECF_RECONCILIATION_SUMMARY_DEFAULT_COLUMN
} from "@app/finance/ecf-reconciliation-summary/ecf-reconciliation-summary.columns";
import { EcfReconciliationSummary } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class EcfReconciliationSummaryHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private ecfReconciliationApiUrl = "ecfReconciliation/ecfReconciliationSummaries";

    public getEcfReconciliationSummaries(
        ucr: string, currencyId: number, financialLedgerId: number, binderId: number, sectionId: number, riskCode: string, unreconciledOnly: boolean)
        : Observable<EcfReconciliationSummary[] | any> {
        const params = this.getQueryParameters(ucr, currencyId, financialLedgerId, binderId, sectionId, riskCode, unreconciledOnly);
        const url = this.ecfReconciliationApiUrl + params;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }

    /**
     * The list of columns to be displayed on the website
     */
    public getColumns(): any[] {
        return ECF_RECONCILIATION_SUMMARY_COLUMNS;
    }

    public getDefaultColumn() {
        return ECF_RECONCILIATION_SUMMARY_DEFAULT_COLUMN;
    }

    private getQueryParameters(ucr: string, currencyId: number, financialLedgerId: number, binderId: number,
                               sectionId: number, riskCode: string, unreconciledOnly: boolean): string {
        const parameters: string[] = [];

        if (ucr) {
            parameters.push(`ucr=${ucr}`);
        }

        if (currencyId) {
            parameters.push(`currencyId=${currencyId}`);
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

        if (unreconciledOnly) {
            parameters.push(`unreconciledOnly=${unreconciledOnly}`);
        }

        if (parameters.length > 0) {
            return `?${parameters.join("&")}`;
        }

        return "";
    }
}
