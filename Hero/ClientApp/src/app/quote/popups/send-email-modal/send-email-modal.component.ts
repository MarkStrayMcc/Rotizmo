import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { EuDocumentsHttpService } from "@app/compliance/services/eu-documents-http.service";
import { FileValidators } from "@app/components/input-file/file-validators";
import { Configurations } from "@app/constants/Configurations";
import {
    CfcContact,
    Email,
    EmailContact,
    EmailTemplate,
    EmailType,
    FeatureAccess,
    FileData,
    Quote,
    QuoteAttachment,
    QuoteState,
    ServerSideFileData,
    ServerSideFileType
} from "@app/models";
import { UnderwritingDistributionEmail } from '@app/models/underwriting-distribution-email';
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailHttpService } from "@app/services/email-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { FeaturesHttpService } from '@app/services/features-http.service';
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { PolicyEmailHttpService } from "@app/services/policy-email-http.service";
import { QuoteEmailHttpService } from "@app/services/quote-email-http.service";
import { UnderwritingDistributionService } from '@app/services/underwriting-distribution.service';
import { UserService } from "@app/services/user.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { forkJoin, from, Observable, ReplaySubject, Subscription } from "rxjs";
import { first, flatMap, map, takeUntil, tap } from "rxjs/operators";
import { LoggingService } from "../../../services/logging.service";

@Component({
    selector: "send-email-modal",
    templateUrl: "./send-email-modal.component.html",
    styleUrls: ["./send-email-modal.component.scss"]
})
export class SendEmailModalComponent implements OnInit, OnDestroy {
    public title: string;
    public user: CfcContact;
    public quote: Quote;
    public brokerTeamId: number;
    public emailType: EmailType;
    public policyNumber: string;
    public form: FormGroup;
    public attachmentsErrorMessage: { [key: string]: string };

    public contactOptions: EmailContact[];
    public maxFileSize: number;
    protected maxFileCount: number;
    public validFileTypes: string;
    protected maxContentSize: number;
    public isLoading: boolean = true;
    public sendingEmail: boolean = false;

    private errorSendEmail = "The email could not be sent as an error occurred. Please try again.";
    private formChangeSubscription: Subscription;
    private quoteIdsChangeSubscription: Subscription;
    private defaultAttachments: ServerSideFileData[];
    private subject: string;
    private isSendEUDocumentsEmailFeatureEnabled: boolean;
    public quoteIsPublished: boolean;
    private isEuEmail: boolean;
    private _destroyed$ = new ReplaySubject<void>(1);

    public get quoteIds(): number[] {
        const ids = [];

        if ((!this.defaultAttachments || this.emailType !== EmailType.sendQuote) && (!this.defaultAttachments || this.emailType !== EmailType.sendAdmittedQuote)) {
            return [];
        }

        this.defaultAttachments.forEach(attachment =>
            (attachment as QuoteAttachment).quoteIds.forEach(id => {
                if (!ids.find(x => x === id)) {
                    if (this.defaultAttachments.filter(y => y.fileName).find(x =>
                        x.reference === id.toString() && x.serverSideFileType === ServerSideFileType.Quote) !== undefined) {
                        ids.push(id);
                    }
                }
            })
        );

        return ids;
    }

    public get showQuoteSelector() {
        return (this.emailType === EmailType.sendQuote || this.emailType === EmailType.sendAdmittedQuote) && this.quoteIds.length > 1;
    }

    private readonly isUnderwritingDistributionEmailsEnabled$: Observable<FeatureAccess | any> = this.featureService.isFeatureActive("HERO_EnableUnderwritingDistributionEmails");
    private isUnderwritingDistributionEmailsEnabled: boolean | any = false;

    constructor(
        private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<SendEmailModalComponent>,
        private emailHttpService: EmailHttpService,
        private quoteEmailHttpService: QuoteEmailHttpService,
        private policyEmailHttpService: PolicyEmailHttpService,
        private emailContactService: EmailContactService,
        private errorMessageHandlerService: ErrorMessageHandlerService,
        private messageService: MessageService,
        private fileUploadService: FileUploadService,
        private euDocumentsHttpService: EuDocumentsHttpService,
        private userService: UserService,
        private featureService: FeaturesHttpService,
        private underwritingDistributionService: UnderwritingDistributionService,
        private log: LoggingService

    ) { }

    public ngOnInit(): void {
        this.isSendEUDocumentsEmailFeatureEnabled = this.userService.isFeatureAccessible("sendEUDocumentsEmail");

        const contacts$ = this.emailContactService.getEmailContacts().pipe(first());
        const emailTemplate$ = this.getEmailTemplate().pipe(first());

        forkJoin(contacts$, emailTemplate$)
            .pipe(map(value => ({ contacts: value[0], template: value[1] })))
            .subscribe(value => this.loadEmailData(value.contacts, value.template));

        this.quoteIsPublished = this.quote.isPublished;

        this.isUnderwritingDistributionEmailsEnabled$.pipe(
            takeUntil(this._destroyed$),
            tap((feature: FeatureAccess | any) => this.isUnderwritingDistributionEmailsEnabled = feature.hasAccess))
            .subscribe();
    }

    public ngOnDestroy(): void {
        if (this.formChangeSubscription) {
            this.formChangeSubscription.unsubscribe();
        }

        if (this.quoteIdsChangeSubscription) {
            this.quoteIdsChangeSubscription.unsubscribe();
        }
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public send(): void {
        this.log.logInfo("USING SEND");

        this.sendingEmail = true;
        this.messageService.clearMessage();

        this.getEmail$().pipe(flatMap((email: Email) => this.sendEmail(email)), first())
            .subscribe(
                () => this.handleSendSuccess(),
                error => this.handleSendError(error),
                () => this.sendingEmail = false);
    }

    private sendEmail(email: any): Observable<any> {
        if (this.isSendEUDocumentsEmailFeatureEnabled && this.isEuEmail) {
            email.clientUid = this.quote.client.uid;
            email.emailType = this.getEUEmailType();
            email.dataAttachments = email.dataAttachments === "" ? [] : email.dataAttachments;
            return this.euDocumentsHttpService.sendEuDocuments(email);
        } else {
            email = email.dataAttachments === "" ? { ...email, dataAttachments: [] } : email;
            email.emailType = this.emailType;
            if (this.isUnderwritingDistributionEmailsEnabled == true) {
                email.mergeFields = this.form.controls.mergeFields?.value || {};

                const underwritingDistributionEmail: UnderwritingDistributionEmail = {
                    email: email,
                    productCode: this.quote.product.productName,
                    countryIsoCode: this.userService.countryIsoCode,
                    stateProvinceCode: this.quote.client.primaryLocation?.stateProvinceCode,
                    wordingVersionId: this.quote.wordingVersionId,
                    isPublished: this.quote.isPublished,
                    isBindable: this.quote.isBindable,
                    quoteUid: this.quote.quoteUid,
                    quoteId: this.quote.quoteReference,
                    quoteIds: this.form.controls.quoteIds?.value,
                    policyNumber: this.policyNumber,
                    clientUid : this.quote.client.uid,
                    brokerId: this.quote.brokerTeam?.broker?.brokerId
                };

                if (this.emailType === EmailType.sendQuote) {
                    underwritingDistributionEmail.email.emailType = EmailType.sendQuoteWithCoverholder;
                    return this.underwritingDistributionService.sendUnderwritingDistributionQuoteEmail(underwritingDistributionEmail);
                } else if (this.emailType === EmailType.sendPolicy) {
                    underwritingDistributionEmail.email.emailType = EmailType.sendPolicyWithCoverholder;
                    return this.underwritingDistributionService.sendUnderwritingDistributionPolicyEmail(underwritingDistributionEmail);
                }
                else {
                    return this.emailHttpService.sendEmail(email);
                }
            } else {
                return this.emailHttpService.sendEmail(email);
            }
        }
    }

    private isEUEmailType(emailType: EmailType): boolean {
        return emailType === EmailType.sendEuQuote || emailType === EmailType.sendEuPolicy;
    }

    private getEUEmailType(): EmailType {
        return this.emailType === EmailType.sendQuote
            ? EmailType.sendEuQuote
            : EmailType.sendEuPolicy;
    }

    public onCloseModal = () => this.dialogRef.close(this.form ? this.form.value : null);

    public dropDownDisplay = (contact: EmailContact) => contact ? `${contact.name} (${contact.email})` : "";

    public displayName = (contact: EmailContact) => contact ? contact.name : "";

    private handleSendSuccess(): void {
        this.form.controls.isSent.setValue(true);
        this.dialogRef.close(this.form.value);
    }

    private handleSendError(error: any): void {
        console.error(error.message);
        error.message = this.errorSendEmail;
        this.errorMessageHandlerService.handleError(error);
    }

    private getEmailTemplate() {
        return this.emailType === EmailType.sendQuote || this.emailType === EmailType.sendAdmittedQuote ?
            this.quoteEmailHttpService.getEmailTemplateForQuote(this.quote.quoteReference) :
            this.policyEmailHttpService.getEmailTemplateForPolicy(this.policyNumber);
    }

    private loadEmailData(contacts: EmailContact[], template: EmailTemplate) {
        this.contactOptions = contacts;
        this.defaultAttachments = template.defaultAttachments;
        this.subject = template.subject;
        this.isEuEmail = this.isEUEmailType(template.emailType);

        this.form = this.createForm(template);

        if (this.showQuoteSelector) {
            this.quoteIdsChangeSubscription = this.form.controls.quoteIds.valueChanges
                .subscribe(quoteIds => this.handleQuoteIdChanges(quoteIds));
        }

        this.isLoading = false;
    }

    private createForm(template: EmailTemplate) {
        const form = this.formBuilder.group({
            to: [[this.getContact(this.quote.brokerContact.email)], [Validators.required, AutocompleteSelectedValidator]],
            cc: [[this.getContact(this.user.email)], AutocompleteSelectedValidator],
            bcc: [[this.getContact(this.quote.assignedContact.email)], AutocompleteSelectedValidator],
            subject: [this.getSubject([this.quote.quoteReference])],
            emailBody: [],
            mergeFields: this.getMergeFields([this.quote.quoteReference]),
            sender: [this.getContact(this.user.email)],
            dataAttachments: [
                "", [
                    FileValidators.maxFileCount(Configurations.Email.MaxFileCount),
                    FileValidators.maxFileSize(Configurations.Email.MaxFileSize),
                    FileValidators.validFileTypes(Configurations.Email.ValidFileTypes.split(",")),
                    FileValidators.duplicateFiles(),
                    FileValidators.maxContentSize(Configurations.Email.MaxContentSize)
                ]
            ],
            serverSideAttachments: [this.getDefaultAttachments()],
            emailType: [template.emailType],
            isSent: [false]
        });

        if (this.showQuoteSelector) {
            form.addControl("quoteIds", new FormControl([this.quote.quoteReference]));
        }

        return form;
    }

    private getEmail$(): Observable<Email> {
        const email: Email = this.form.value;

        return email.dataAttachments && (email.dataAttachments as any).files ?
            this.getEmailWithAttachments$(email) : from([email]);
    }

    private getEmailWithAttachments$(email: Email): Observable<Email> {
        const files = (email.dataAttachments as any).files;
        const fileDataObservables = files.map(file => this.fileUploadService.readFile(file));

        return forkJoin(fileDataObservables).pipe(map((fileData: FileData[]) => {
            email.dataAttachments = fileData;
            return email;
        }));
    }

    private getContact = (email: string) => this.contactOptions.find(c => c.email.toLowerCase() === email.toLowerCase());

    private getSubject(quoteIds: number[]): string {
        return this.subject.replace("[[ClientName]]", this.quote.client.companyName)
            .replace("[[QuoteNumber]]", this.getQuoteNumberSubject(quoteIds))
            .replace("[[PolicyNumber]]", this.quote.policyNumber);
    }

    private getQuoteNumberSubject(quoteIds: number[]): string {
        if (!this.showQuoteSelector || quoteIds.length > 1) {
            return quoteIds.join(", ");
        }

        return this.quote.quoteReference.toString();
    }

    private getCommissionMergeField = () => this.quote.commissionInformation.actualGrossCommission.toFixed(2).toString() + "%";

    private handleQuoteIdChanges(quoteIds: number[]): void {
        this.form.controls.serverSideAttachments.setValue(this.getDefaultAttachments());
        this.form.controls.mergeFields.setValue(this.getMergeFields(quoteIds));
        this.form.controls.subject.setValue(this.getSubject(quoteIds));
    }

    private getDefaultAttachments = () =>
        this.defaultAttachments
            .map(attachment => attachment as QuoteAttachment)
            .filter(attachment => this.showQuoteSelector ? this.shouldAttachmentBeIncluded(attachment) : true)
            .filter(attachment => attachment.fileName);

    private getMergeFields(quoteIds: number[]) {
        const mergeFields = {
            "Commission": this.getCommissionMergeField(),
            "QuoteReferences": quoteIds.join(";")
        } as { [key: string]: string }

        if (this.quote.state == QuoteState.Bound) {
            mergeFields["PolicyNumber"] = this.quote.policyNumber
        }

        return mergeFields;
    }

    private shouldAttachmentBeIncluded = (attachment: QuoteAttachment) =>
        attachment.quoteIds.find(quoteId => this.isQuoteIdSelected(quoteId));

    private isQuoteIdSelected(quoteId: number): boolean {
        if (this.form) {
            return (this.form.get("quoteIds").value as number[]).find(x => x === quoteId) !== undefined;
        }

        return quoteId === this.quote.quoteReference;
    }

    public setAttachmentsErrorList() {
        var maxFileCount = "Too many files, maximum allowed:";
        var maxContentSize = "The total size of all attachments exceeds maximum allowed";
        var fileErrors = "Maximum file size is";
        var wrongFileTypes = "File type is not allowed";
        //var wrongFileTypes = "Allowed file types: ";
        var duplicateFiles = "File is duplicated more than once";

        if (this.form.controls.dataAttachments.errors.wrongFileType) {
            wrongFileTypes = this.form.controls.dataAttachments.errors.wrongFileType.name + wrongFileTypes;
        }

        this.attachmentsErrorMessage =
        {
            "maxFileCount": maxFileCount,
            "maxContentSize": maxContentSize,
            "fileErrors": fileErrors,
            "wrongFileTypes": wrongFileTypes,
            "duplicateFiles": duplicateFiles
        }
    }
}
