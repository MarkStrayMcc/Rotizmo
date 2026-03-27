import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { UnderwritingDistributionEmail } from '@app/models/underwriting-distribution-email';
import { Observable } from 'rxjs';

@Injectable()
export class UnderwritingDistributionService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public sendUnderwritingDistributionQuoteEmail(underwritingDistributionEmail: UnderwritingDistributionEmail): Observable<any> {
        const url = `underwriting-distribution-email/send-quote-email`;
        const options = this.commonHttpHeaders(null);

        return this.http.post(url, underwritingDistributionEmail, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public sendUnderwritingDistributionPolicyEmail(underwritingDistributionEmail: UnderwritingDistributionEmail): Observable<any> {
        const url = `underwriting-distribution-email/send-policy-email`;
        const options = this.commonHttpHeaders(null);

        return this.http.post(url, underwritingDistributionEmail, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
