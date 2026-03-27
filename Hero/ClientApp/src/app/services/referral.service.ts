import { Injectable } from '@angular/core';
import { BaseService } from "@app/services/base.service";
import { ReferralRequest } from "@app/models/auto-generated";
import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { catchError } from 'rxjs/operators';

@Injectable()
export class ReferralService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public refer(referralRequest: ReferralRequest): Observable<boolean | any> {
        const url = `/Referral/Refer/`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, referralRequest, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
