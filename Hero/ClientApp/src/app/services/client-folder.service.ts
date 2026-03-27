import { Injectable } from '@angular/core';
import { BaseService } from "@app/services/base.service";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ClientFolderService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getClientFolder(clientId: number): Observable<string | any> {
        const url = `/client/${clientId}/folder`;
        return this.http.get(url, { responseType: 'text' })
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
