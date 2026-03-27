import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SanctionsCheckRequest } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class CheckClientSanctionsHttpService extends BaseService {
    constructor(protected readonly http: HttpClient) {
        super(http);
    }

    public checkClientSanctions(params: SanctionsCheckRequest): Observable<boolean> {
        if (!params.clientUid) {
            throw new Error('clientUid is required for the sanctions check API');
        }
        if (!params.clientId) {
            throw new Error('clientId is required for the sanctions check API');
        }
        if (!params.countryIsoCode) {
            throw new Error('countryIsoCode is required for the sanctions check API');
        }

        const request = {
            ClientUid: params.clientUid,
            ClientName: params.clientName,
            CountryIsoCode: params.countryIsoCode,
            IsSendEmail: params.isSendEmail,
            Stage: params.stage,
            ClientId: params.clientId,
            OnGoingScreening: params.onGoingScreening
        };

        return this.http.post<boolean>('/clients/sanctions-check', request).pipe(
            catchError(this.handleErrorObservable)
        );
    }
}
