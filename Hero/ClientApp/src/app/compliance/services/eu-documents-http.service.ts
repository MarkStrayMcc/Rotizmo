import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageResult } from "@app/models";
import { SendEuDocumentsRequest } from "@app/models/auto-generated/SendEuDocumentsRequest";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class EuDocumentsHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public sendEuDocuments(model: SendEuDocumentsRequest): Observable<MessageResult | any> {
        const url = `/SendEuDocuments`;
        const body = model;
        const options = this.commonHttpHeaders(null);

        return this.http.post(url, body, options)
            .pipe(catchError(this.handleErrorObservable));
    }
}
