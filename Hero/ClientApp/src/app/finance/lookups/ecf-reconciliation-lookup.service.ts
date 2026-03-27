import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ILookup } from "@app/finance/lookups/interfaces/ILookup";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { EcfReconciliation, UcrLookup } from "@app/models";

@Injectable()
export class EcfReconciliationLookupService implements ILookup<Array<EcfReconciliation>> {
    constructor(private readonly ecfReconciliationService: EcfReconciliationHttpService) {
    }

    public getData(ucr?: UcrLookup): Observable<Array<EcfReconciliation>> {
        if (ucr) {
            return this.requestData(ucr.reference);
        }

        return of([]);
    }

    protected requestData(ucr: string): Observable<Array<EcfReconciliation>> {
        return this.ecfReconciliationService.getEcfReconciliationsFromUcr(ucr);
    }
}
