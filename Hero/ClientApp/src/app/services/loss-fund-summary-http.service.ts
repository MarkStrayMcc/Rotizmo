import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LOSS_FUND_SUMMARY_COLUMNS, LOSS_FUND_SUMMARY_DEFAULT_COLUMN } from "@app/finance/loss-fund-summary/loss-fund-summary.columns";
import { FinanceLossFundSummary } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class LossFundSummaryHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private LossFundApiUrl = "finance/lossFundSummaries";

    public getLossFundSummaries(): Observable<FinanceLossFundSummary[] | any> {
        return this.http.get(this.LossFundApiUrl)
            .pipe(catchError(this.handleErrorObservable));
    }

    /**
     * The list of columns to be displayed on the website
     */
    public getColumns(): any[] {
        return LOSS_FUND_SUMMARY_COLUMNS;
    }

    public getDefaultColumn() {
        return LOSS_FUND_SUMMARY_DEFAULT_COLUMN;
    }
}
