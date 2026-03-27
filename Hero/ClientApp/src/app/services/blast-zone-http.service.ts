import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BlastZoneCheckResult } from '@app/models/blast-zone-check-result';
import { BlastZoneReservation, BlastZoneReservationGetResponse } from '@app/models/blast-zone-get-response';
import { PropertyLimitBlastZoneCapacityRequest } from '@app/models/property-limit-blast-zone-capacity-request';
import { PropertyLimitBlastZoneCapacityResponse } from '@app/models/property-limit-blast-zone-capacity-response';
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable()
export class BlastZoneHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public createBlastZoneReservation(propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest):
        Observable<PropertyLimitBlastZoneCapacityResponse | any> {
        const url = `blast-zone/create-reservation`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, propertyLimitBlastZoneCapacityRequest, options).pipe(catchError(this.handleErrorObservable));
    }

    public updateBlastZoneReservation(propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest):
        Observable<PropertyLimitBlastZoneCapacityResponse | any> {
        const url = `blast-zone/update-reservation`;
        const options = this.commonHttpHeaders(null);
        return this.http.put(url, propertyLimitBlastZoneCapacityRequest, options).pipe(catchError(this.handleErrorObservable));
    }

    public checkPropertyLimitBlastCapacity(propertyLimitBlastZoneRequest: PropertyLimitBlastZoneCapacityRequest):Observable<BlastZoneCheckResult[] | any> {
        const url = `blast-zone/capacity-result`;
        const options = this.commonHttpHeaders(null);
        return this.http.post(url, propertyLimitBlastZoneRequest, options).pipe(catchError(this.handleErrorObservable));
    }

    public getBlastZoneDetails(blastZoneGroupId: string): Observable<BlastZoneReservationGetResponse | any> {
        const url = `blast-zone/get-blast-zone-reservation/${blastZoneGroupId}`;
        const options = this.commonHttpHeaders(null);
        return this.http.get(url, options).pipe(
            map((response: any) => {
                if(!response || !response.reservations) {
                    return response;
                }
                const blastZoneReservationGetResponse = response as BlastZoneReservationGetResponse;

                blastZoneReservationGetResponse.Reservations = response.reservations.map((r: any) => {
                    const reservation = new BlastZoneReservation();
                    reservation.Location = {
                        Latitude: r.location.latitude,
                        Longitude: r.location.longitude
                    };
                    reservation.Exposure = r.exposure;
                    reservation.Id = r.id;
                    return reservation;
                });
                return blastZoneReservationGetResponse;
            }),
            catchError(this.handleErrorObservable)
        );
    }

    public deleteBlastZoneReservation(blastZoneGroupId: string): Observable<boolean | any> {
        const url = `blast-zone/delete-blast-zone-reservation/${blastZoneGroupId}`;
        const options = this.commonHttpHeaders(null);
        return this.http.delete(url, options).pipe(catchError(this.handleErrorObservable));
    }
}
