import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { EmailTemplate } from "@app/models";
import { BaseService } from "@app/services/base.service";

@Injectable()
export class PolicyEmailHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getEmailTemplateForPolicy(policyNumber: string): Observable<EmailTemplate | any> {
        const url = `/policy/${policyNumber}/email-template`;
        const options = this.commonHttpHeaders(null);

        return this.http.get(url, options)
            .pipe(catchError(this.handleErrorObservable));
    }
}
