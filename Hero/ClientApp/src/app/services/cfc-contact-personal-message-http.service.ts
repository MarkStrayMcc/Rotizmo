import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { CfcContactPersonalMessage, CfcContactPersonalMessageChangeRequest } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";

@Injectable()
export class CfcContactPersonalMessageHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getPersonalMessageById(cfcContactId: number): Observable<CfcContactPersonalMessage | any> {
        const url: string = `/cfcContactPersonalMessage/GetPersonalMessageById?cfcContactId=${cfcContactId}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public setPersonalMessage(request: CfcContactPersonalMessageChangeRequest): Observable<CfcContactPersonalMessage | any> {
        const url = `/cfcContactPersonalMessage/SetPersonalMessage`;
        const options = this.commonHttpHeaders(null);

        return this.http.post(url, request, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
