import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BrokerTeam } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Memoize } from "@app/shared/decorators/memoize.decorator";
import { Observable } from "rxjs";
import { catchError, shareReplay } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class BrokerTeamHttpService extends BaseService {
    constructor(protected readonly http: HttpClient) {
        super(http);
    }

    @Memoize()
    public get(countryIsoCodes: string[]): Observable<BrokerTeam[]> {
        const url = `/broker-teams?countryIsoCode=${countryIsoCodes.join("&countryIsoCode=")}`;
        return this.http.get<BrokerTeam[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }
}
