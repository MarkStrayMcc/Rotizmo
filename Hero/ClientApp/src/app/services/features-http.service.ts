import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { FeatureAccess } from "@app/models";
import { Observable } from "rxjs";
import { BaseService } from "@app/services/base.service";


@Injectable()
export class FeaturesHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public isFeatureActive(featureName: string, brokerContactId?: number): Observable<FeatureAccess | any> {
        const url = `features/IsFeatureActive?featureName=${featureName}&brokerContactId=${brokerContactId ? brokerContactId : 0}`;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }
}
