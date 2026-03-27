import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { BaseService } from "@app/services/base.service";
import { Observable, interval } from "rxjs";
import { LatestQuoteReferenceResponse } from "@app/models/auto-generated/LatestQuoteReferenceResponse";
import { LatestQuoteReferenceRequest } from "@app/models/auto-generated/LatestQuoteReferenceRequest";

@Injectable()
export class ClientLatestReferenceHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public checkClientLatestReference(latestQuoteReferenceRequest: LatestQuoteReferenceRequest): Observable<LatestQuoteReferenceResponse | any> {
        var clientid = latestQuoteReferenceRequest.clientId;
        const url = `/Client/` + clientid + `/latest-active-quote-reference`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, latestQuoteReferenceRequest, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
