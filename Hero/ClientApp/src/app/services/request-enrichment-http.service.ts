import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class RequestEnrichmentHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getApprovedStatesByCountryId(countryId: number): Observable<string[] | any> {
        const url = `request-enrichment/get-approval-states/${countryId}`;
        const options = this.commonHttpHeaders(null);
        return this.http.get(url, options).pipe(
            map((response: any) => {
                return response as string[];
            }),
            catchError(this.handleErrorObservable)
        );
    }
}
