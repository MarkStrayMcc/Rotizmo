import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { BaseService } from "@app/services/base.service";
import { Observable, interval } from "rxjs";
import { ClientClearanceResult } from "@app/models/auto-generated/ClientClearanceResult";
import { ClientClearanceRequest } from "@app/models/auto-generated/ClientClearanceRequest";

@Injectable()
export class ClientClearanceHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public checkClientClearanceForBroker(clientClearanceRequest: ClientClearanceRequest): Observable<ClientClearanceResult | any> {
        const url = `/ClientClearance/CheckForBroker`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, clientClearanceRequest, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
