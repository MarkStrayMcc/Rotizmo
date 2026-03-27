import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";
import { BinderHttpService } from "@app/services/binder-http.service";
import { BinderLookup, FinancialLedgerLookup } from "@app/models";

@Injectable()
export class BinderLookupService extends CachedLookupBaseService<Array<BinderLookup>> {
    constructor(private readonly binderService: BinderHttpService) {
        super();
    }

    public getData(ledger?: FinancialLedgerLookup): Observable<Array<BinderLookup>> {
        if (ledger) {
            return this.data$.pipe(map(lookups => {
                return lookups.filter(lookup => lookup.binderId === ledger.binderId);
            }));
        }

        return this.data$;
    }

    protected requestData(): Observable<Array<BinderLookup>>  {
        return this.binderService.getBinderLookups();
    }
}
