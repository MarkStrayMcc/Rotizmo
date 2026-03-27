import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { SurplusLinesLicenseResponse } from '../models/SurplusLinesLicenseResponse';
import { SurplusLine } from '@app/models';
import { SurplusLinesLicenseResult } from '../models/SurplusLinesLicenseResult';

@Injectable()
export class SurplusLinesLicenseHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getSurplusLinesByBrokerTeamIdAndStateIsoCode(brokerId: number, state: string): Observable<SurplusLine[] | any> {
        const url = `/SurplusLine?state=${state}&brokerTeamId=${brokerId}`;
        return this.http.get(url)
            .pipe(
                map((response:SurplusLinesLicenseResponse[]) => {
                    if (response && response.length > 0) {
                        return response.map((item: SurplusLinesLicenseResponse) => {
                            return {
                                id: item.key,
                                surplusLineBrokerUid: item.id,
                                stateProvinceCode: item.licenseStateIsoCode,
                                brokerName: item.company,
                                contactName: item.name,
                                address1: item.addressLine1,
                                address2: item.addressLine2,
                                address3: item.addressLine3,
                                licenseNumber: item.licenseNumber,
                                zip: item.addressZipCode,
                                expiryDate: item.licenseExpiryDate,
                            } as SurplusLine;
                        });
                    } else {
                        return [];
                    }
                }),
                catchError(this.handleErrorObservable)
            );
    }

    public saveSurplusLine(surplusLine: SurplusLine): Observable<number | any> {
        const url = `/SurplusLine`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, surplusLine, options)
            .pipe(catchError(this.handleErrorObservable));
    }

    public saveSurplusLinesLicense(surplusLinesLicenseRequest): Observable<SurplusLinesLicenseResult | any> {
        const url = `/surplus-lines`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, surplusLinesLicenseRequest, options);
    }
}
