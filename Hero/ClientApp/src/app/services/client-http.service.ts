import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Client } from "@app/models/auto-generated/Client";
import { ClientSearchResult } from "@app/models/auto-generated/ClientSearchResult";
import { BaseService } from "@app/services/base.service";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class ClientHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getClient(policyNumber: string): Observable<Client | any> {
        const url = `/client/get/${policyNumber}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public searchClient(searchTerm?: string): Observable<Client | any> {
        if (!searchTerm) {
            return of([]);
        }
        const url = `/client/search/${encodeURIComponent(searchTerm)}`;
        return this.http.get(url)
            .pipe(map((response: Array<any>) => {
                return response.map((client: ClientSearchResult) => ({
                    text: client.companyName,
                    value: client.clientUid
                }));
            }), catchError(this.handleErrorObservable));
    }
}
