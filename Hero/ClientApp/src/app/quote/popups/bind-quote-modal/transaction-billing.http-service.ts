import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class TransactionBillingHttpService extends BaseService {
    constructor(protected readonly http: HttpClient) {
        super(http);
    }

    public put(policyNumber: string, contact): Observable<void> {
        let url: string = `/policy/${policyNumber}/transactions/billing`;
        return this.http.put<void>(url, { type: "Direct", contact }).pipe(catchError(this.handleErrorObservable));
    }
}
