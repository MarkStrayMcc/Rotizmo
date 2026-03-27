import { Component, OnDestroy } from "@angular/core";
import { Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { EuDocumentsHttpService } from "@app/compliance/services/eu-documents-http.service";
import { FileValidators } from "@app/components/input-file/file-validators";
import { Configurations } from "@app/constants/Configurations";
import { EmailTemplate, EmailType, Message, MessageType } from "@app/models";
import { SendEuDocumentsRequest } from "@app/models/auto-generated/SendEuDocumentsRequest";
import { ClientHttpService } from "@app/services/client-http.service";
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailHttpService } from "@app/services/email-http.service";
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import {
    AttachmentField, ContactField, DropDownField, FieldValidator, FormButton, FormButtonTypes,
    FormConfig, FormType, SubjectField, TemplateType, TextAreaField, TextBoxField
} from "@app/shared/form-creator/form-creator.config";
import { SendEmailComponent } from "@app/shared/send-email/send-email.component";
import { DropDownFieldService } from "@app/shared/services/dropdown-field.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { first, flatMap, single, takeUntil } from "rxjs/operators";
import { SendEuTemplateTypeEnum } from "../enums/SendEuTemplateType";

@Component({
    selector: "compliance-send-eu-documents",
    styleUrls: ["send-eu-documents.component.scss"],
    templateUrl: "send-eu-documents.component.html",
})
export class SendEuDocumentsComponent extends SendEmailComponent implements OnDestroy {

    public formConfig: FormConfig;

    private templatesList: EmailTemplate[] = [];
    private selectedTemplate: number;
    private currentSearchWord: string;
    private searchClientSubscription: Subscription;
    private jointTemplates: Observable<any> = of([]);

    constructor(
        protected euDocumentsHttpService: EuDocumentsHttpService,
        protected emailContactService: EmailContactService,
        protected emailHttpService: EmailHttpService,
        protected fileUploadService: FileUploadService,
        protected formCreatorService: FormCreatorService,
        protected messageService: MessageService,
        protected userService: UserService,
        public dropDownFieldService: DropDownFieldService,
        public clientHttpService: ClientHttpService,
        private route: ActivatedRoute
    ) {
        super(messageService, emailHttpService, fileUploadService, formCreatorService, userService);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.loadEmailTemplates();
        this.setEmailContacts();
    }

    private setEmailContacts = () => {
        this.emailContactService.getEmailContacts().subscribe((contacts) => {
            this.formCreatorService.setContacts(contacts);
        });
    }

    private handleTemplateField() {
        this.jointTemplates.subscribe(([mtaTemplate, policyTemplate, quoteTemplate]) => {
            this.templatesList.push(mtaTemplate);
            this.templatesList.push(policyTemplate);
            this.templatesList.push(quoteTemplate);

            if (this.route.snapshot.queryParams["template"] && this.sendEmailForm.form.get("template").untouched) {
                this.sendEmailForm.form.get("template").setValue(this.getTemplateType(this.route.snapshot.queryParams["template"]));
                this.formCreatorService.setForm(this.sendEmailForm);
            }
        });
    }

    private getTemplateType(queryParam: string) {
        let selectedTemplate = "";
        switch (queryParam) {
            case "quote":
                selectedTemplate = "sendEuQuoteManual";
                break;
            case "policy":
                selectedTemplate = "sendEuPolicyManual";
                break;
            case "mta":
                selectedTemplate = "sendEuMta";
                break;
        }
        return selectedTemplate;
    }

    protected formHandler() {
        this.formCreatorService.formInstance.pipe(takeUntil(this.destroyed$)).subscribe((form) => {
            if (form && this.sendEmailForm !== form) {
                this.sendEmailForm = form;
                this.changeEmailTemplate();
                this.handleButtonsState();
                this.handleAutoCompleteField();
                if (this.templatesList.length === 0) {
                    this.handleTemplateField();
                }
            }
        });
    }

    private handleAutoCompleteField() {
        if (this.currentSearchWord !== this.sendEmailForm.form.get("client").value) {
            this.currentSearchWord = this.sendEmailForm.form.get("client").value;
            if (this.currentSearchWord && this.currentSearchWord.length > 2) {
                if (this.searchClientSubscription) {
                    this.searchClientSubscription.unsubscribe();
                }
                this.searchClientSubscription = this.clientHttpService.searchClient(this.currentSearchWord).pipe(single()).subscribe((response) => {
                    this.dropDownFieldService.setOptionList(response);
                });
            }
        }
    }

    private loadEmailTemplates() {
        const templates = [
            this.emailHttpService.getEmailTemplate(EmailType.sendEuMta),
            this.emailHttpService.getEmailTemplate(EmailType.sendEuPolicyManual),
            this.emailHttpService.getEmailTemplate(EmailType.sendEuQuoteManual)
        ];

        this.jointTemplates = forkJoin(templates);
    }

    private getEmailType(templateType: string): number {
        return EmailType[templateType];
    }

    private changeEmailTemplate = () => {
        const emailType = this.getEmailType(this.sendEmailForm.form.get("template").value);
        if (emailType && emailType !== this.selectedTemplate) {
            this.selectedTemplate = emailType;
            const selectedEmailTemplate = this.templatesList.filter((template) => template.emailType === emailType)[0];
            this.formCreatorService.setEmailTemplate(selectedEmailTemplate);
        }
    }

    protected setConfig() {
        this.formConfig = {
            title: "Send European documents",
            selector: "eu-documents-send-email",
            type: FormType.SendEmail,
            template: TemplateType.OneColumn,
            fields: [
                new DropDownField({
                    cssClass: "select-client",
                    label: "Client",
                    property: "client",
                    requestData: this.clientHttpService.searchClient(),
                    serverFiltering: true,
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        })
                    ]
                }),
                new DropDownField({
                    cssClass: "select-template",
                    label: "Template",
                    property: "template",
                    enum: SendEuTemplateTypeEnum,
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        })
                    ]
                }),
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
                    emailType: EmailType.sendEuPolicyManual,
                    templateProperty: "toContacts",
                    value: []
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
                    emailType: EmailType.sendEuPolicyManual,
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
                    emailType: EmailType.sendEuPolicyManual,
                    templateProperty: "bccContacts",
                    value: []
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

    public handleSendSuccess(data: any): void {
        const successMessage = new Message("Documents uploaded and email successfully sent", MessageType.Success);
        this.messageService.sendMessage(successMessage);
        this.sendButton.isExecuting = false;
        this.sendButton.disable = false;
        this.formCreatorService.setForm(this.sendEmailForm);
    }

    public handleSendError(error: any): void {
        this.sendButton.isExecuting = false;
        this.sendButton.disable = false;
        this.formCreatorService.setForm(this.sendEmailForm);
        const errorMessage = new Message(error.message, MessageType.Error);
        this.messageService.sendMessage(errorMessage);
    }

    public sendEmail(data) {
        data.mergeFields = this.getMergeFields();
        data = this.formatSendEuDocumentRequest(data);

        this.sendingEmail();

        this.getEmail$(data).pipe(flatMap((email: SendEuDocumentsRequest) => this.euDocumentsHttpService.sendEuDocuments(email)),
            first())
            .subscribe(
                () => this.handleSendSuccess(data),
                error => this.handleSendError(error));
    }

    private formatSendEuDocumentRequest(data) {
        data.emailBody = data.emailBody === null ? "" : data.emailBody;
        data.subject = data.subject === null ? "" : data.subject;
        data.clientUid = data.client.value;
        data.emailType = this.emailTemplate.emailType;
        return data;
    }
}
