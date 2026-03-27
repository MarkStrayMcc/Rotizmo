import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { BaseService } from "@app/services/base.service";
import { Country } from "@app/models";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";

@Injectable()
export class CountryHttpService extends BaseService  {

    constructor(http: HttpClient) {
        super(http);
    }

    public getMainData(): Observable<Country[] | any> {
        const url = `/Countries`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
