import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Email, EmailTemplate, EmailType, MessageResult } from "@app/models";
import { MtaEmailTemplate } from "@app/policy/models/MtaEmailTemplate";
import { BaseService } from "@app/services/base.service";
import { Guid } from "guid-typescript";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { UserService } from "./user.service";

@Injectable()
export class EmailHttpService extends BaseService {
    constructor(
        protected readonly http: HttpClient,
        private readonly userService: UserService
    ) {
        super(http);
    }

    public sendEmail(model: Email): Observable<MessageResult | any> {
        const url = `/email?isHeroOrigin=true`;
        const body = model;
        // TODO: escape the email content
        const options = this.commonHttpHeaders(null);

        return this.http.post(url, body, options)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getEmailTemplateForEnquiry(enquiryId: number): Observable<EmailTemplate | any> {
        const url = `/enquiry/${enquiryId}/emailtemplate`;
        const options = this.commonHttpHeaders(null);

        return this.http.get(url, options)
            .pipe(catchError(this.handleErrorObservable));
    }

    public getEmailTemplateForMta(policyNumber: string, mtaId: Guid): Observable<MtaEmailTemplate | any> {
        let url = `/api/policy/${policyNumber}/mta/${mtaId}/email-template`;

        if (!this.userService.isFeatureAccessible("heroMtaEmailTemplateMtaV2")) {
            url = `/mta/mtatemplate/${policyNumber}/${mtaId}`;
        }

        return this.http.get<MtaEmailTemplate>(url).pipe(catchError(this.handleErrorObservable));
    }

    public getEmailTemplate(templateType: EmailType): Observable<EmailTemplate | any> {
        const url = `/emailtemplate/${templateType}`;
        const options = this.commonHttpHeaders(null);

        return this.http.get(url, options)
            .pipe(catchError(this.handleErrorObservable));
    }
}
