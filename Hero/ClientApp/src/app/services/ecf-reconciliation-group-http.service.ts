import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { EcfReconciliationGroupRequest } from "@app/models";
import { catchError } from "rxjs/operators";

@Injectable()
export class EcfReconciliationGroupHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private ecfReconciliationGroupApiUrl = "ecfReconciliationGroup";

    public reconcileEcfReconciliations(ecfReconcilationItems: EcfReconciliationGroupRequest): Observable<EcfReconciliationGroupRequest | any> {
        const url = this.ecfReconciliationGroupApiUrl + "/reconcile";
        return this.http.post(url, ecfReconcilationItems)
            .pipe(catchError(this.handleErrorObservable));
    }

    public unreconcileEcfReconciliation(reconciliationGroupIdsToDelete: number[]): Observable<number[] | any> {
        const deleteReconciliationUrl = this.ecfReconciliationGroupApiUrl + "/unreconcile";
        return this.http.post(deleteReconciliationUrl, reconciliationGroupIdsToDelete)
            .pipe(catchError(this.handleErrorObservable));
    }
}
