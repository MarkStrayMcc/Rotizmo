import { Injectable } from '@angular/core';
import {HttpClient } from "@angular/common/http";
import { BaseService } from "./base.service";
import { catchError } from 'rxjs/operators';
import { Guid } from 'guid-typescript';
import {Observable } from 'rxjs';
import { EnquirySearchResponse } from '../models/auto-generated/EnquirySearchResponse';
import {NerdEnquiry} from "@app/quote/models/enquiry/NerdEnquiry";
import {EnquiryServiceEnquiry} from "@app/quote/models/enquiry/EnquiryServiceEnquiry";

@Injectable()
export class EnquiryHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getEnquiryById(enquiryId: number): Observable<NerdEnquiry | any>  {
        let url: string = `/enquiry/getenquiry?enquiryId=${enquiryId}`;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getEnquiryByUid(enquiryUid: Guid): Observable<EnquiryServiceEnquiry | any> {
        let url: string = `/enquiry/getenquiry?enquiryId=${enquiryUid}`;
        return this.http.get(url);
    }

    public enquiriesSearch(clientId: number, cfcTeamName: string): Observable<EnquirySearchResponse | any>{
        let url: string = `/enquiries/search?clientId=${clientId}&cfcTeamName=${encodeURIComponent(cfcTeamName)}`;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }
}
