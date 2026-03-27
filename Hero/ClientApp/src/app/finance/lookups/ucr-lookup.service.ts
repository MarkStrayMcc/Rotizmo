import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { UcrLookup } from "@app/models";

@Injectable()
export class UcrLookupService extends CachedLookupBaseService<Array<UcrLookup>> {
    constructor(private readonly ecfReconciliationService: EcfReconciliationHttpService) {
        super();
    }

    public getData(): Observable<Array<UcrLookup>> {
        return this.data$;
    }

    protected requestData(): Observable<Array<UcrLookup>> {
        return this.ecfReconciliationService.getEcfUcrLookups()
            .pipe(map(x => x.map(ref => {
                // TODO: TEMPORARY UNTIL CHANGES TO COREAPI ARE MADE (STORY #18233)
                let ul = new UcrLookup();
                ul.reference = ref;
                return ul;
            })));
    }
}
