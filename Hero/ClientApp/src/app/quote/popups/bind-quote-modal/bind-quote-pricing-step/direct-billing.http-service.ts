import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Memoize } from "@app/shared/decorators/memoize.decorator";
import { Observable, of } from "rxjs";
import { catchError, shareReplay } from "rxjs/operators";

import { Limit } from "./limit.model";
import { ContactDetails } from "./contact-details.model";

@Injectable({ providedIn: "root" })
export class DirectBillingHttpService extends BaseService {
    constructor(protected readonly http: HttpClient) {
        super(http);
    }

    @Memoize()
    public getPaymentLimit(countryCode: string): Observable<Limit> {
        const url: string = `/direct-billing/payments/limits/${countryCode}`;
        return this.http.get<Limit>(url).pipe(catchError(this.catchNotFoundError), shareReplay(1));
    }

    @Memoize()
    public getContactDetails(externalCustomerReference: string): Observable<ContactDetails> {
        const url: string = `/direct-billing/${externalCustomerReference}/contact-details`;
        return this.http.get<ContactDetails>(url).pipe(catchError(this.catchNotFoundError), shareReplay(1));
    }

    private catchNotFoundError = (error: any): Observable<any> => {
        if (error.status === 404) {
            return of(null);
        }

        return this.handleErrorObservable(error);
    }
}
