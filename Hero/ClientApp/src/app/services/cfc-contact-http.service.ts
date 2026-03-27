import { Injectable } from "@angular/core";
import { CfcContact } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CfcContactHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getByInitials(initials: string): Observable<CfcContact | any> {
        const url: string = `/cfccontact/getbyinitials?initials=${initials}`;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }
}
