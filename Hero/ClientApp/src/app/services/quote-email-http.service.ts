import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { EmailTemplate } from "@app/models";
import { BaseService } from "@app/services/base.service";

@Injectable()
export class QuoteEmailHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getEmailTemplateForQuote(quoteId: number): Observable<EmailTemplate | any> {
        const url = `/quote/${quoteId}/email-template`;
        const options = this.commonHttpHeaders(null);

        return this.http.get(url, options)
            .pipe(catchError(this.handleErrorObservable));
    }
}
