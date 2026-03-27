import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { FinancialLedgerLookup } from "@app/models";

@Injectable()
export class FinancialLedgerLookupService extends CachedLookupBaseService<Array<FinancialLedgerLookup>> {
    constructor(private readonly ledgerReferenceService: LedgerReferenceHttpService) {
        super();
    }

    public getData(): Observable<Array<FinancialLedgerLookup>> {
        return this.data$;
    }

    protected requestData(): Observable<Array<FinancialLedgerLookup>> {
        return this.ledgerReferenceService.getLedgerLookups();
    }
}
