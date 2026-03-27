import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Moment } from "moment";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class BordereauHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public isReceivedDateValid(receivedDate: Moment): Observable<boolean | any> {
        const url = `/Bordereau/is-received-date-valid?receivedDate=${receivedDate}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
