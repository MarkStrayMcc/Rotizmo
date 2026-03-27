import { Injectable } from "@angular/core";
import { SanctionStage } from "@app/enums/SanctionStage";
import { SanctionsCheckRequest } from "@app/models";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { CheckClientSanctionsHttpService } from "./check-client-sanctions-http.service";

@Injectable({ providedIn: "root" })
export class CheckClientSanctionsService {
    private _hasSanctions = new BehaviorSubject<boolean>(null);

    constructor(protected readonly checkClientSanctionsHttpService: CheckClientSanctionsHttpService) { }

    public checkClientSanctions(
        clientName: string,
        clientUid: string,
        clientId: number,
        countryIsoCode: string,
        stage: SanctionStage,
        isSendEmail: boolean,
        onGoingScreening?: boolean
    ): Observable<boolean> {
        const params: SanctionsCheckRequest = {
            clientName,
            clientUid,
            clientId: clientId,
            countryIsoCode,
            stage,
            isSendEmail,
            onGoingScreening
        };

        return this.checkClientSanctionsHttpService
            .checkClientSanctions(params)
            .pipe(tap((hasSanctions) => this._hasSanctions.next(hasSanctions)));
    }

    public getClientSanctions(): Observable<boolean> {
        return this._hasSanctions.asObservable();
    }
}
