import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";
import { BinderSectionLookup } from "@app/models";

@Injectable()
export class RiskCodeLookupService extends CachedLookupBaseService<Array<string>> {
    constructor() {
        super();
    }

    public getData(binderSection?: BinderSectionLookup): Observable<Array<string>> {
        if (binderSection) {
            return of(binderSection.allowedLloydsRiskCodes);
        }

        return this.data$;
    }

    protected requestData(): Observable<Array<string>> {
        return of([]);
    }
}
