import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { ConfigService } from "@app/services/config.service";
import { FinancialLedgerInfo, FinancialLedgerLookup } from "@app/models";
import { catchError } from "rxjs/operators";

@Injectable()
export class LedgerReferenceHttpService extends BaseService {
    constructor(http: HttpClient,
        private configService: ConfigService) {
        super(http);
    }

    private financialLedgerReferencesUrl = "finance/financialLedgers";

    public getLedgerReferences(): Observable<FinancialLedgerInfo[] | any> {
        return this.http.get(this.financialLedgerReferencesUrl)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getLedgerLookups(): Observable<FinancialLedgerLookup[] | any> {
        return this.http.get("finance/financialLedgerLookups")
            .pipe(catchError(this.handleErrorObservable));
    }
}
