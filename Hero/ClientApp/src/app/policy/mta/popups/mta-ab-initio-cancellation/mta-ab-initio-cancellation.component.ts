import { getCurrencySymbol } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Validators } from "@angular/forms";
import { MessageType } from "@app/enums";
import { CfcContact } from "@app/models";
import { Message } from "@app/models/Message";
import { MtaCancellationReasonEnum } from "@app/policy/enums/MtaCancellationReason";
import { CancellationMtaRequest } from "@app/policy/models/CancellationMtaRequest";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from '@app/services/modal-dialog.service';
import { UserService } from "@app/services/user.service";
import { CurrencyField, DropDownField, FieldValidator, FormButton, FormButtonTypes, FormConfig, FormItem, ReadOnlyField, TemplateType } from "@app/shared/form-creator/form-creator.config";
import { ICurrency } from "@app/shared/form-creator/ICurrency";
import { ConfirmationModalComponent } from "@app/shared/modals/confirmation-modal/confirmation-modal.component";
import { ConfirmationModalConfig } from "@app/shared/modals/confirmation-modal/confirmation-modal.config";
import { ConfirmationModalModel } from "@app/shared/modals/confirmation-modal/confirmation-modal.model";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { BehaviorSubject, Subscription } from 'rxjs';
import { MtaModalModel } from "../mta-modal.model";
import { MtaSendEmailModalConfig } from "../send-email/mta-send-email-modal.config";
import { MtaSendEmailComponent } from "../send-email/mta-send-email.component";
import { MtaSendEmailModel } from '../send-email/mta-send-email.model';
import { ICancellationPremium } from "./ICancellationPremium";

@Component({
    selector: "policy-mta-cancellation-change-modal",
    styleUrls: ["mta-ab-initio-cancellation.component.scss"],
    templateUrl: "mta-ab-initio-cancellation.component.html",
})

/**
 * @deprecated This class should be deleted once we toggle on Mid Term Cancellation and the new cancellation component on live
 */
export class MtaAbInitioCancellationComponent implements OnInit, OnDestroy {

    public isSaving = false;
    public dialogModel: MtaModalModel;
    public userProfile: CfcContact;
    public formModalConfig: FormConfig;
    public mtaId: Guid;
    public cancellationForm$: Subscription;
    public formButtonClicked$: Subscription;
    public cancellationForm: FormItem;
    public confirmationModalModel = new ConfirmationModalModel();

    protected sendEmailModalModel: MtaSendEmailModel;
    protected currency$: BehaviorSubject<ICurrency> = new BehaviorSubject<ICurrency>(null);
    protected currencyObservable = this.currency$.asObservable();

    private cancellationPremium: ICancellationPremium;
    private mtaCancellationReasonEnum = MtaCancellationReasonEnum;

    private saveButton: FormButton;
    private sendButton: FormButton;
    private saveButtonProperty: string = "cancellation-save";
    private sendButtonProperty: string = "cancellation-send";

    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public mtaService: MtaService,
        public userService: UserService,
        public formCreatorService: FormCreatorService,
        public modalDialogService: ModalDialogService,
        private messageService: MessageService,
    ) { }

    public ngOnInit() {
        this.getCancellationPremium();
        this.setConfig();
        this.userProfile = this.userService.getUser();
        this.formHandler();
    }

    public ngOnDestroy() {
        this.unsubscribeAll();
    }

    public getCancellationPremium() {
        this.mtaService.getCancellationPremium(this.dialogModel.policy.reference)
            .subscribe(
                (data) => {   
                    const currencySymbol = getCurrencySymbol(data.currencyIsoCode, "narrow"); 
                    this.cancellationPremium = {...data, totalTax: data.totalReturnPremium * data.taxRate, currencySymbol};
                    this.currency$.next({ isoCode: this.cancellationPremium.currencyIsoCode, symbol: currencySymbol });
                    this.setCancellationFormPremium();
                },
                (error) => {
                    const errorMessage = error.status === 404 ? ": Not Found." : ".";
                    this.handleError([
                        `An error occurred while loading the cancellation premium${errorMessage}`
                    ]);
                }
            );
    }

    public formHandler() {
        this.cancellationForm$ = this.formCreatorService.formInstance.subscribe((form) => {
            if (form && this.cancellationForm !== form && form.selector === "mta-cancellation") {
                this.cancellationForm = form;
                this.saveButton = this.getButton(this.saveButtonProperty);
                this.sendButton = this.getButton(this.sendButtonProperty);
                this.handleButtonsState();
            }
        });
        this.formButtonClicked$ = this.formCreatorService.buttonClicked.subscribe((button) => {
            if (button && button === this.sendButtonProperty) {
                this.openSendEmailModal();
            }
        });
    }

    public handleButtonsState() {
        if (this.areButtonsSet()) {
            if (this.cancellationForm.form.invalid || this.isButtonExecuting()) {
                this.disableBothButtons();
                return false;
            }
            this.enableSaveDisableSend();
        }
    }

    public enableSaveDisableSend() {
        if (this.saveButton.disable !== false || this.sendButton.disable !== true) {
            this.saveButton.disable = false;
            this.sendButton.disable = true;
            this.formCreatorService.setForm(this.cancellationForm);
        }
    }

    public isButtonExecuting() {
        return this.areButtonsSet() && (this.saveButton.isExecuting);
    }

    public areButtonsSet(): boolean {
        return this.saveButton ? true : false;
    }

    public savingCancellation() {
        this.saveButton.isExecuting = true;
        this.saveButton.disable = true;
        this.sendButton.disable = true;
        this.cancellationForm.form.disable();
        this.formCreatorService.setForm(this.cancellationForm);
    }

    public cancellationFormSaved() {
        this.saveButton.isExecuting = false;
        this.cancellationForm.form.disable();
        this.saveButton.disable = true;
        this.sendButton.disable = false;
        this.formCreatorService.setForm(this.cancellationForm);
    }

    public cancellationFormErrorOnSaving() {
        this.saveButton.isExecuting = false;
        this.saveButton.disable = false;
        this.sendButton.disable = true;
        this.cancellationForm.form.enable();
        this.formCreatorService.setForm(this.cancellationForm);
    }

    public disableBothButtons() {
        if (this.saveButton.disable !== true && this.sendButton.disable !== true) {
            this.saveButton.disable = true;
            this.sendButton.disable = true;
            this.formCreatorService.setForm(this.cancellationForm);
        }
    }

    public setConfig() {
        this.formModalConfig = {
            title: "Cancellation MTA",
            selector: "mta-cancellation",
            template: TemplateType.OneColumn,
            fields: [
                new ReadOnlyField({
                    cssClass: "cancellation-mta-effective-date",
                    label: "Effective Date",
                    property: "effectiveDate",
                    isDisabled: false,
                    value: moment(this.dialogModel.policy.inceptionDate).format("DD/MM/yyyy"),
                }),
                new ReadOnlyField({
                    cssClass: "cancellation-mta-change-type",
                    label: "Cancellation Type",
                    property: "changeType",
                    value: "Ab Initio",
                    hasSeparator: true
                }),
                new CurrencyField({
                    cssClass: "cancellation-mta-total-return-premium",
                    label: "Total Return Premium ",
                    property: "totalReturnPremium",
                    isDisabled: true,
                    currency: this.currencyObservable
                }),
                new CurrencyField({
                    cssClass: "cancellation-mta-return-fee",
                    label: "Return Fee",
                    property: "returnFee",
                    isDisabled: true,
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        })
                    ],
                    currency: this.currencyObservable
                }),
                new CurrencyField({
                    cssClass: "cancellation-mta-return-tax",
                    label: "Return Tax",
                    property: "returnTax",
                    isDisabled: true,
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        })
                    ],
                    currency: this.currencyObservable
                }),
                new DropDownField({
                    cssClass: "cancellation-mta-reason",
                    label: "Reason",
                    property: "cancellationReason",
                    enum: this.mtaCancellationReasonEnum,
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        })
                    ]
                })
            ],
            buttons: [
                new FormButton({
                    cssClass: "cancellation-send",
                    property: this.sendButtonProperty,
                    label: "Send",
                    type: FormButtonTypes.Button,
                }),
                new FormButton({
                    cssClass: "cancellation-submit md-mr2",
                    property: this.saveButtonProperty,
                    label: "Save",
                    type: FormButtonTypes.Submit,
                })
            ],

        };
    }

    public save(formValues) {
        this.messageService.clearAllMessages();

        this.savingCancellation();

        const cancellationRequest: CancellationMtaRequest = this.mtaCancellationRequestBuilder(this.cancellationForm.form.value);

        this.mtaService.postCancellation(cancellationRequest, this.dialogModel.policy.reference)
            .subscribe(
                (data) => {
                    data.mtaId ? this.mtaId = Guid.parse(data.mtaId) : this.handleError();
                    this.cancellationFormSaved();
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
                    this.cancellationFormErrorOnSaving();
                }
            );
    }

    public mtaCancellationRequestBuilder(cancellationMtaRequest: CancellationMtaRequest): CancellationMtaRequest {
        cancellationMtaRequest.cfcUserId = this.userProfile.cfcContactUid;
        return cancellationMtaRequest;
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

    public openConfirmationModal(formValues) {
        this.modalDialogService.openDialog<ConfirmationModalComponent, ConfirmationModalModel>
            (ConfirmationModalComponent, ConfirmationModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    this.confirmationModalModel.title = "Confirmation required";
                    this.confirmationModalModel.question = `Are you sure you want to cancel Policy ${this.dialogModel.policy.reference}?`;
                    this.confirmationModalModel.confirmationButtonLabel = "Yes";
                    this.confirmationModalModel.cancellationButtonLabel = "No";
                    modalConfig.dialogModel = this.confirmationModalModel;
                },
                (result: any) => this.onCloseClientConfirmationModal(result)
            );
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

    private onCloseClientSendEmailDialog(result: any) {
        setTimeout(() => {
            this.sendEmailModalModel = result;
            this.cancellationFormSaved();
            this.formHandler();
        });
    }

    private onCloseClientConfirmationModal(result: any) {
        setTimeout(() => {
            if (result === "confirm-button") {
                this.save(this.cancellationForm.form.value);
            }
        });
    }

    private setCancellationFormPremium() {
        if (this.cancellationForm && this.cancellationForm.form) {
            this.cancellationForm.form.get("returnFee").setValue(this.cancellationPremium.returnFee);
            this.cancellationForm.form.get("totalReturnPremium").setValue(this.cancellationPremium.totalReturnPremium);
            this.cancellationForm.form.get("returnTax").setValue(this.cancellationPremium.totalTax);
            this.formCreatorService.setForm(this.cancellationForm);
        }
    }

    private getButton(buttonProperty: string) {
        return this.cancellationForm.buttons[this.cancellationForm.buttons.findIndex(btn => btn.property === buttonProperty)];
    }

    private unsubscribeAll() {
        if (this.cancellationForm$ && this.formButtonClicked$) {
            this.cancellationForm$.unsubscribe();
            this.formButtonClicked$.unsubscribe();
        }
    }
}
