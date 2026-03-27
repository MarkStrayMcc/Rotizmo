import { Injectable } from "@angular/core";
import { SurplusLine } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable, of } from "rxjs";
import { SurplusLinesLicense } from "../models/SurplusLinesLicense";

@Injectable()
export class FakeSurplusLinesLicenseHttpService extends BaseService {
    public getSurplusLinesByBrokerTeamIdAndStateIsoCode(brokerId: number, state: string): Observable<SurplusLine[] | any> {
        return of([new SurplusLine()]);
    }

    public saveSurplusLine(surplusLine: SurplusLine): Observable<number | any> {
        return of(2);
    }

    public saveSurplusLinesLicense(surplusLinesLicenseRequest: SurplusLinesLicense): Observable<number | any> {
        return of(new SurplusLinesLicense());
    }
}
