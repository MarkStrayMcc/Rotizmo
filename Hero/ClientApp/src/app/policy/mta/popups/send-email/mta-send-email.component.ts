import { Component } from "@angular/core";
import { Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { EuDocumentsHttpService } from "@app/compliance/services/eu-documents-http.service";
import { FileValidators } from "@app/components/input-file/file-validators";
import { Configurations } from "@app/constants/Configurations";
import { EmailTemplate, EmailType, Message, MessageType } from "@app/models";
import { MtaEmailTemplate } from "@app/policy/models/MtaEmailTemplate";
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailHttpService } from "@app/services/email-http.service";
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { AttachmentField, ContactField, FieldValidator, FormButton, FormButtonTypes, FormType, SendEmailFormConfig, SubjectField, TemplateType, TextAreaField, TextBoxField } from "@app/shared/form-creator/form-creator.config";
import { SendEmailComponent } from "@app/shared/send-email/send-email.component";
import { FormCreatorService } from '@app/shared/services/form-creator.service';
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { camelCase } from "lodash";
import { Observable } from "rxjs";
import { first, flatMap } from "rxjs/operators";
import { MtaAddressChangeComponent } from "../address-change/mta-address-change.component";
import { MtaSendEmailModel } from "./mta-send-email.model";

@Component({
    selector: "policy-mta-send-email",
    styleUrls: ["mta-send-email.component.scss"],
    templateUrl: "mta-send-email.component.html",
})
export class MtaSendEmailComponent extends SendEmailComponent {

    public dialogModel: MtaSendEmailModel;
    public formModalConfig: SendEmailFormConfig;
    public isEuPolicy: boolean;

    private isSendEUDocumentsEmailFeatureEnabled: boolean;

    constructor(
        private readonly dialogRef: MatDialogRef<MtaAddressChangeComponent>,
        protected messageService: MessageService,
        protected emailHttpService: EmailHttpService,
        protected euDocumentsHttpService: EuDocumentsHttpService,
        protected emailContactService: EmailContactService,
        protected fileUploadService: FileUploadService,
        protected formCreatorService: FormCreatorService,
        protected userService: UserService) {
        super(messageService, emailHttpService, fileUploadService, formCreatorService, userService);
    }

    public ngOnInit(): void {
        this.isSendEUDocumentsEmailFeatureEnabled = this.userService.isFeatureAccessible("sendEUDocumentsEmail");
        super.ngOnInit();

        this.setEmailTemplate();
        this.setBrokerContacts();
    }

    public sendEmail(data) {
        data.mergeFields = this.getMergeFields();
        data.emailBody = data.emailBody === null ? "" : data.emailBody;
        data.subject = data.subject === null ? "" : data.subject;
        data.emailType = this.emailTemplate.emailType;

        this.sendingEmail();

        this.getEmail$(data).pipe(flatMap((email: any) => this.send(email)),
            first())
            .subscribe(
                () => this.handleSendSuccess(data),
                error => this.handleSendError(error));
    }

    protected setConfig() {
        this.formModalConfig = {
            selector: "mta-send-email",
            policyNumber: this.dialogModel.policy.reference,
            mtaId: this.dialogModel.mtaId,
            type: FormType.SendEmail,
            brokerName: this.dialogModel.policy.brokerName,
            template: TemplateType.OneColumn,
            fields: [
                new ContactField({
                    cssClass: "send-email-to",
                    label: "To",
                    property: "to",
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        }),
                        new FieldValidator({
                            selector: "invalidSelection",
                            message: "Invalid Selection",
                            validator: AutocompleteSelectedValidator
                        })
                    ],
                    emailType: EmailType.sendMta,
                    templateProperty: "toContacts"
                }),
                new ContactField({
                    cssClass: "send-email-cc",
                    label: "CC",
                    property: "cc",
                    validators: [
                        new FieldValidator({
                            selector: "invalidSelection",
                            message: "Invalid Selection",
                            validator: AutocompleteSelectedValidator
                        })
                    ],
                    emailType: EmailType.sendMta,
                    templateProperty: "ccContacts",
                    value: [this.user]
                }),
                new ContactField({
                    cssClass: "send-email-bcc",
                    label: "BCC",
                    property: "bcc",
                    validators: [
                        new FieldValidator({
                            selector: "invalidSelection",
                            message: "Invalid Selection",
                            validator: AutocompleteSelectedValidator
                        })
                    ],
                    emailType: EmailType.sendMta,
                    templateProperty: "bccContacts"
                }),
                new SubjectField({
                    cssClass: "send-email-subject",
                    label: "Subject",
                    property: "subject",
                    validators: []
                }),
                new AttachmentField({
                    cssClass: "send-email-attachments",
                    label: "Attachments",
                    property: "dataAttachments",
                    validators: [
                        new FieldValidator({
                            selector: "maxFileCount",
                            validator: FileValidators.maxFileCount(Configurations.Email.MaxFileCount)
                        }),
                        new FieldValidator({
                            selector: "maxFileSize",
                            validator: FileValidators.maxFileSize(Configurations.Email.MaxFileSize)
                        }),
                        new FieldValidator({
                            selector: "validFileTypes",
                            validator: FileValidators.validFileTypes(Configurations.Email.ValidFileTypes.split(","))
                        }),
                        new FieldValidator({
                            selector: "duplicateFiles",
                            validator: FileValidators.duplicateFiles()
                        }),
                        new FieldValidator({
                            selector: "maxContentSize",
                            validator: FileValidators.maxContentSize(Configurations.Email.MaxContentSize)
                        })
                    ],
                    serverSideField: "serverSideAttachments"
                }),
                new TextBoxField({
                    property: "serverSideAttachments",
                    isVisible: false
                }),
                new TextBoxField({
                    property: "sender",
                    isVisible: false,
                    value: {
                        email: this.user.email,
                        firstName: this.user.firstName,
                        lastName: this.user.lastName
                    }
                }),
                new TextBoxField({
                    property: "mergeFields",
                    isVisible: false,
                    value: this.getMergeFields()
                }),
                new TextAreaField({
                    cssClass: "send-email-body",
                    label: "Email body",
                    property: "emailBody",
                    validators: [],
                    rows: 8
                })
            ],
            buttons: [
                new FormButton({
                    property: this.sendButtonProperty,
                    cssClass: this.sendButtonProperty,
                    label: "Send",
                    type: FormButtonTypes.Submit,
                    disable: true
                })
            ]
        };
    }

    protected handleSendSuccess(data: any): void {
        this.dialogRef.close(data);
    }

    protected handleSendError(error: any): void {
        this.sendButton.isExecuting = false;
        this.sendButton.disable = false;
        this.formCreatorService.setForm(this.sendEmailForm);
        const errorMessage = new Message(error.message,
            MessageType.Error);
        this.messageService.sendMessage(errorMessage);
    }

    private setBrokerContacts = () => {
        this.emailContactService.getEmailContacts().subscribe((brokerContacts) => {
            this.formCreatorService.setContacts(brokerContacts);
        });
    }

    private setEmailTemplate = () => {
        this.emailHttpService.getEmailTemplateForMta(this.formModalConfig.policyNumber, this.formModalConfig.mtaId)
            .subscribe((template: MtaEmailTemplate) => {
                var emailTemplate = template as unknown as EmailTemplate;
                emailTemplate.emailType = EmailType[camelCase(template.emailType)];
                this.isEuPolicy = this.isEUEmailType(emailTemplate.emailType);
                this.formCreatorService.setEmailTemplate(emailTemplate);
            });
    }

    private isEUEmailType(emailType: EmailType): boolean {
        return emailType === EmailType.sendEuMta;
    }

    private send(email: any): Observable<any> {
        if (this.isSendEUDocumentsEmailFeatureEnabled && this.isEuPolicy) {
            email.clientUid = this.dialogModel.policy.companyGuid;
            return this.euDocumentsHttpService.sendEuDocuments(email);
        } else {
            return this.emailHttpService.sendEmail(email);
        }
    }
}
