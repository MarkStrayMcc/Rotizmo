import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ClientLocation } from "@app/models";
import { PlaceResult } from "@app/models/locationapis.model";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class LocationHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getMainData(clientId: number): Observable<ClientLocation[] | any> {
        const url = `/Location/GetClientLocations?clientId=${clientId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getPlaceDetailsAddress(placeId: string): Observable<PlaceResult | any> {
        const url = `/Location/GetPlaceDetailsAddress?placeId=${placeId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public add(model: any): Observable<any> {
        const url = `/Location/AddLocation`;
        model = this.parseModel(model);

        const options = this.commonHttpHeaders(null);

        return this.http.post(url, model, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public update(model: any): Observable<any> {
        const url = `/Location/EditLocation`;
        model = this.parseModel(model);

        const options = this.commonHttpHeaders(null);

        return this.http.post(url, model, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public delete(model: any): Observable<any> {
        const url = `/Location/DeleteLocation`;
        model = { ClientLocationId: model.clientLocationId };

        const options = this.commonHttpHeaders(null);

        return this.http.post(url, model, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    private parseModel(model: any): any {
        model.countryId = model.country.value;
        model.country = null;
        model.stateProvinceCode = typeof model.stateProvinceCode === "object" ? model.stateProvinceCode.value : "";

        return model;
    }

}
