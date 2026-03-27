import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseService } from "../../../services/base.service";
import {
  Document
} from "@app/models";
import { catchError } from "rxjs/operators";
import { AvailableEndorsementsRequest } from "@app/quote/models/endorsements/AvailableEndorsementsRequest";
import { AutoAttachingEndorsementsRequest } from "@app/quote/models/endorsements/AutoAttachingEndorsementsRequest";

@Injectable({ providedIn: "root" })
export class EndorsementHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getAvailable(request: AvailableEndorsementsRequest): Observable<Document[] | any> {

        let url: string = `/endorsement/getavailableendorsements`;

        const options = this.commonHttpHeaders(null);

        return this.http.post(url, request, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getAutoAttaching(request: AutoAttachingEndorsementsRequest): Observable<Document[] | any> {

        let url: string = `/endorsement/getautoattachingendorsements`;

        const options = this.commonHttpHeaders(null);

        return this.http.post(url, request, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
