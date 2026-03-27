import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Validators } from "@angular/forms";
import { MessageType } from "@app/enums";
import { CfcContact } from "@app/models";
import { Message } from "@app/models/Message";
import { MtaChangeTypeEnum } from "@app/policy/enums/MtaChangeType";
import { CoreMtaResult } from "@app/policy/models/CoreMtaResult";
import { MtaResult } from "@app/policy/models/MtaResult";
import { NameChangeMtaRequest } from "@app/policy/models/NameChangeMtaRequest";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from '@app/services/modal-dialog.service';
import { UserService } from "@app/services/user.service";
import { DateField, DropDownField, FieldValidator, FormButton, FormButtonTypes, FormConfig, FormItem, ReadOnlyField, TemplateType, TextBoxField } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { Subscription } from 'rxjs';
import { MtaModalModel } from "../mta-modal.model";
import { MtaSendEmailModalConfig } from '../send-email/mta-send-email-modal.config';
import { MtaSendEmailComponent } from '../send-email/mta-send-email.component';
import { MtaSendEmailModel } from '../send-email/mta-send-email.model';
import {MtaConfirmationComponent} from "@app/policy/mta/popups/confirmation/confirmation.component";
import {MtaConfirmationModalConfig} from "@app/policy/mta/popups/confirmation/confirmation-modal.config";
import {SharedFormCreatorComponent} from "@app/shared/form-creator/form-creator.component";

@Component({
    selector: "policy-mta-client-name-change-modal",
    styleUrls: ["mta-client-name-change.component.scss"],
    templateUrl: "mta-client-name-change.component.html",
})
export class MtaClientNameChangeComponent implements OnInit, OnDestroy {

    public isSaving = false;
    public dialogModel: MtaModalModel;
    public userProfile: CfcContact;
    public formModalConfig: FormConfig;
    public mtaId: Guid;
    public nameChangeForm$: Subscription;
    public formButtonClicked$: Subscription;
    public nameChangeForm: FormItem;

    protected sendEmailModalModel: MtaSendEmailModel;

    private mtaChangeTypeEnum = MtaChangeTypeEnum;
    private saveButton: FormButton;
    private sendButton: FormButton;
    private saveButtonProperty: string = "name-change-save";
    private sendButtonProperty: string = "name-change-send";

    @ViewChild("formComponent") formComponent: ElementRef;
    @ViewChild("sharedFormCreatorComponent", { static: true }) sharedFormCreatorComponent: SharedFormCreatorComponent;

    constructor(
        public mtaHttpService: MtaService,
        public userService: UserService,
        public formCreatorService: FormCreatorService,
        private messageService: MessageService,
        public modalDialogService: ModalDialogService
    ) { }

    public ngOnInit() {
        this.setConfig();
        this.userProfile = this.userService.getUser();
        this.formHandler();
        this.messageService.clearAllMessages();
    }

    public ngOnDestroy() {
        this.unsubscribeAll();
    }

    public formHandler() {
        this.nameChangeForm$ = this.formCreatorService.formInstance.subscribe((form) => {
            if (form && this.nameChangeForm !== form) {
                this.nameChangeForm = form;
                this.saveButton = this.getButton(this.saveButtonProperty);
                this.sendButton = this.getButton(this.sendButtonProperty);
                this.handleButtonsState();
                this.handleFieldsState();
            }
        });
        this.formButtonClicked$ = this.formCreatorService.buttonClicked.subscribe((button) => {
            if (button && button === this.sendButtonProperty) {
                this.openSendEmailModal();
            }
        });
    }

    public handleFieldsState() {
        const changeTypeField = this.nameChangeForm.form.get("changeType");
        const effectiveDateField = this.nameChangeForm.form.get("effectiveDate");

        if (changeTypeField.value === "Endorsement" && effectiveDateField.disabled && this.nameChangeForm.form.enabled) {
            effectiveDateField.enable();
        }
        if (changeTypeField.value === "PolicyReissue" && effectiveDateField.enabled) {
            effectiveDateField.disable();
        }

        this.formCreatorService.setForm(this.nameChangeForm);
    }

    public handleButtonsState() {
        if (this.areButtonsSet()) {
            if (this.nameChangeForm.form.invalid || this.isButtonExecuting()) {
                this.disableBothButtons();
                return false;
            }
            this.enableSaveDisableSend();
        }
    }

    public isButtonExecuting() {
        return this.areButtonsSet() && (this.saveButton.isExecuting || this.sendButton.isExecuting);
    }

    public areButtonsSet(): boolean {
        return this.saveButton && this.sendButton ? true : false;
    }

    public savingNameChange() {
        this.saveButton.isExecuting = true;
        this.saveButton.disable = true;
        this.sendButton.disable = true;
        this.formCreatorService.setForm(this.nameChangeForm);
    }

    public nameChangeFormSaved() {
        this.saveButton.isExecuting = false;
        this.nameChangeForm.form.disable();
        this.saveButton.disable = true;
        this.sendButton.disable = false;
        this.formCreatorService.setForm(this.nameChangeForm);
    }

    public nameChangeFormErrorOnSaving() {
        this.saveButton.isExecuting = false;
        this.saveButton.disable = false;
        this.sendButton.disable = true;
        this.formCreatorService.setForm(this.nameChangeForm);
    }

    public disableBothButtons() {
        if (this.saveButton.disable !== true || this.sendButton.disable !== true) {
            this.saveButton.disable = true;
            this.sendButton.disable = true;
            this.formCreatorService.setForm(this.nameChangeForm);
        }
    }

    public enableSaveDisableSend() {
        if (this.saveButton.disable !== false || this.sendButton.disable !== true) {
            this.saveButton.disable = false;
            this.sendButton.disable = true;
            this.formCreatorService.setForm(this.nameChangeForm);
        }
    }

    public setConfig() {
        this.formModalConfig = {
            title: "Client Name Change MTA",
            selector: "mta-name-change",
            template: TemplateType.OneColumn,
            fields: [
                new DropDownField({
                    cssClass: "name-change-mta-change-type",
                    label: "Change type",
                    property: "changeType",
                    enum: this.mtaChangeTypeEnum
                }),
                new DateField({
                    cssClass: "name-change-mta-effective-date",
                    label: "Effective date",
                    property: "effectiveDate",
                    isDisabled: false,
                    hasSeparator: true,
                    value: moment(this.dialogModel.policy.inceptionDate)
                }),
                new ReadOnlyField({
                    cssClass: "name-change-mta-current-client-name readonly-fieldvalue",
                    label: "Current client name",
                    property: "currentName",
                    value: this.dialogModel.policy.companyName
                }),
                new TextBoxField({
                    cssClass: "name-change-mta-client-name",
                    label: "Client name",
                    property: "name",
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        })
                    ],
                }),
            ],
            buttons: [
                new FormButton({
                    cssClass: "name-change-send",
                    property: this.sendButtonProperty,
                    label: "Send",
                    type: FormButtonTypes.Button,
                    disable: true
                }),
                new FormButton({
                    cssClass: "name-change-submit md-mr2",
                    property: this.saveButtonProperty,
                    label: "Save",
                    type: FormButtonTypes.Submit,
                    disable: true
                })
            ]
        };
    }

    public save(formValues) {
        this.messageService.clearAllMessages();

        this.savingNameChange();

        const nameChangeRequest: NameChangeMtaRequest = this.mtaNameChangeRequestBuilder(formValues);
        this.mtaHttpService.postNameChangeMta(nameChangeRequest)
            .subscribe(
                (data: MtaResult) => {
                    data.mtaId ? this.mtaId = Guid.parse(data.mtaId) : this.handleError();
                    this.nameChangeFormSaved();
                },
                (exception) => {
                    if (!!exception.error?.validationMessages && exception.error.validationMessages.length > 0) {
                        this.handleError(exception.error.validationMessages);
                    } else if (exception.error.type === "schema/file-system-error") {
                        this.handleError([
                            "An error occurred while creating documentation. Please check that the client folder and its contents are not open elsewhere."
                        ]);
                    } else {
                        this.handleError();
                    }
                    this.nameChangeFormErrorOnSaving();
                }
            );
    }

    public mtaNameChangeRequestBuilder(nameChangeMtaRequest: NameChangeMtaRequest): NameChangeMtaRequest {
        nameChangeMtaRequest.cfcUserId = this.userProfile.cfcContactUid;
        nameChangeMtaRequest.policyNumber = this.dialogModel.policy.reference;
        return nameChangeMtaRequest;
    }

    public handleError(errorList: string[] = null) {
        const message = new Message();
        message.type = MessageType.Error;

        if (errorList != null && errorList.length === 1) {
            message.text = errorList[0];
        } else if (errorList != null && errorList.length > 1) {
            message.messageList = errorList;
        } else {
            message.text = "An error occurred while submitting your change. Please contact IT Support.";
        }

        this.messageService.sendMessage(message);
    }

    public openSendEmailModal() {
        this.formCreatorService.setForm(null);
        this.formCreatorService.setButtonClicked(null);
        this.unsubscribeAll();
        this.sendEmailModalModel = {
            mtaId: this.mtaId,
            policy: this.dialogModel.policy
        };
        this.modalDialogService.openDialog<MtaSendEmailComponent, MtaSendEmailModel>
            (MtaSendEmailComponent, MtaSendEmailModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    modalConfig.user = this.userProfile;
                    modalConfig.dialogModel = this.sendEmailModalModel;
                    modalConfig.readOnly = false;
                },
                (result: any) => this.onCloseClientSendEmailDialog(result)
            );
    }

    public openWarningModal(formValues) {
        this.modalDialogService.openDialog<MtaConfirmationComponent, MtaModalModel>
        (MtaConfirmationComponent, MtaConfirmationModalConfig.dialog.matDialogConfig,
            modalConfig => {},
            (result: any) => {
                if (result) {
                    this.save(formValues);
                }
            }
        );
    }

    private onCloseClientSendEmailDialog(result: any) {
        setTimeout(() => {
            this.sendEmailModalModel = result;
            this.nameChangeFormSaved();
            this.formHandler();
        });
    }

    private getButton(buttonProperty: string) {
        return this.nameChangeForm.buttons[this.nameChangeForm.buttons.findIndex(btn => btn.property === buttonProperty)];
    }

    private unsubscribeAll() {
        if (this.nameChangeForm$ && this.formButtonClicked$) {
            this.nameChangeForm$.unsubscribe();
            this.formButtonClicked$.unsubscribe();
        }
    }
}
