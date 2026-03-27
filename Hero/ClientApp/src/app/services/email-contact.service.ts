import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Email, EmailContact, EmailTemplate, MessageResult } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Guid } from 'guid-typescript';

@Injectable()
export class EmailContactService extends BaseService {
    
    constructor(http: HttpClient) {
        super(http);
    }

    public getEmailContacts(): Observable<EmailContact[] | any> {
        const url: string = `/email-contacts`;

        return this.http.get(url)
            .pipe(catchError(this.handleErrorObservable));
    }
}
