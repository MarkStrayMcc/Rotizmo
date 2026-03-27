import { Component, OnDestroy, OnInit } from "@angular/core";
import { CfcContact, Email, EmailContact, EmailType, FileData } from "@app/models";
import { EmailHttpService } from "@app/services/email-http.service";
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { FormButton, FormItem } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { forkJoin, from, Observable, Subject } from "rxjs";
import { map, takeUntil } from "rxjs/operators";

@Component({
    template: ''
})
export abstract class SendEmailComponent implements OnInit, OnDestroy {

    public emailType: EmailType;
    public user: CfcContact;

    protected emailTemplate: object | any;
    protected sendEmailForm: FormItem;
    protected sendButton: FormButton;
    protected sendButtonProperty: string = "send-email-button";
    protected contactOptions: EmailContact[];
    protected readonly destroyed$ = new Subject<void>();

    constructor(
        protected messageService: MessageService,
        protected emailHttpService: EmailHttpService,
        protected fileUploadService: FileUploadService,
        protected formCreatorService: FormCreatorService,
        protected userService: UserService) { }

    ngOnInit() {
        this.formCreatorService.emailTemplateChanged.subscribe((emailTemplate) => {
            if (emailTemplate) {
                this.emailTemplate = emailTemplate;
            }
        });

        this.userService.getData().subscribe(user => {
            this.user = user;
            this.setConfig();
            this.formHandler();
        });
    }

    protected formHandler() {
        this.formCreatorService.formInstance.pipe(takeUntil(this.destroyed$)).subscribe((form) => {
            if (form && this.sendEmailForm !== form) {
                this.sendEmailForm = form;
                this.handleButtonsState();
            }
        });
    }

    protected handleButtonsState() {
        this.sendButton = this.getButton(this.sendButtonProperty);

        if (this.sendEmailForm.form.invalid) {
            this.disableButton();
            return;
        }

        this.enableSend();
    }

    protected getButton(buttonProperty: string) {
        return this.sendEmailForm.buttons[this.sendEmailForm.buttons.findIndex(btn => btn.property === buttonProperty)];
    }

    protected disableButton() {
        if (this.sendButton && this.sendButton.disable !== true) {
            this.sendButton.disable = true;
            this.formCreatorService.setForm(this.sendEmailForm);
        }
    }

    protected enableSend() {
        if (this.sendButton && this.sendButton.disable !== false) {
            this.sendButton.disable = false;
            this.formCreatorService.setForm(this.sendEmailForm);
        }
    }

    ngOnDestroy() {
        this.formCreatorService.setForm(null);
        this.formCreatorService.setButtonClicked(null);
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    protected abstract setConfig(): void;

    protected getMergeFields() {
        if (!this.emailTemplate) {
            return null;
        }

        return this.emailTemplate.mergeFields as { [key: string]: string };
    }

    protected getEmail$(email: Email): Observable<Email | any> {
        return email.dataAttachments && (email.dataAttachments as any).files ?
            this.getEmailWithAttachments$(email) : from([email]);
    }

    protected getEmailWithAttachments$(email: Email): Observable<Email> {
        const files = (email.dataAttachments as any).files;
        const fileDataObservables = files.map(file => this.fileUploadService.readFile(file));

        return forkJoin(fileDataObservables).pipe(map((fileData: FileData[]) => {
            email.dataAttachments = fileData;
            return email;
        }));
    }

    protected abstract handleSendSuccess(data: any): void;

    protected abstract handleSendError(error: any): void;

    protected sendingEmail() {
        this.sendButton.isExecuting = true;
        this.sendButton.disable = true;
        this.formCreatorService.setForm(this.sendEmailForm);
    }

    protected abstract sendEmail(data): void;
}
