import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "@app/services/base.service";
import { ClientNote } from "@app/models";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";

@Injectable()
export class ClientNoteHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getMainData(clientId: number): Observable<ClientNote[] | any> {
        const url = `/ClientNote/Get?clientId=${clientId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public add(model: ClientNote): Observable<ClientNote | any> {
        const url = `/ClientNote/Add`;

        const options = this.commonHttpHeaders(null);

        return this.http.post(url, model, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

}
