import { Component, ElementRef, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MessageType } from "@app/enums";
import { AdditionalInsuredMtaRequest } from "@app/policy/models/AdditionalInsuredMtaRequest";
import { Message } from "@app/models/Message";
import { MtaService } from "@app/policy/services/mta.service";
import { PolicyAdditionalInsuredService } from "@app/policy/services/policy-additional-insured.service";
import { DropdownService } from "@app/services/dropdown.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { AdditionalInsuredComponent } from "@app/shared/additional-insured/additional-insured.component";
import { AdditionalInsuredConfigBuilder } from "@app/shared/additional-insured/additional-insured.config-builder";
import { IAdditionalInsuredDetailsList } from "@app/shared/additional-insured/IAdditionalInsuredDetailsList";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { MtaModalModel } from "../mta-modal.model";
import { MtaSendEmailModalConfig } from '../send-email/mta-send-email-modal.config';
import { MtaSendEmailComponent } from '../send-email/mta-send-email.component';
import { MtaSendEmailModel } from '../send-email/mta-send-email.model';

@Component({
    selector: "policy-mta-additional-insured-modal",
    styleUrls: ["mta-additional-insured.component.scss"],
    templateUrl: "mta-additional-insured.component.html",
})
export class MtaAdditionalInsuredComponent extends AdditionalInsuredComponent {
    public isSaving = false;
    public isSending = false;
    public isSendDisabled = true;
    public dialogModel: MtaModalModel;
    public effectiveDateForm: FormGroup;

    protected sendEmailModalModel: MtaSendEmailModel;

    private mtaId: Guid;

    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public readonly userService: UserService,
        public readonly formCreatorService: FormCreatorService,
        public readonly dropdownService: DropdownService,
        public readonly additionalInsuredConfigBuilder: AdditionalInsuredConfigBuilder,
        private readonly formBuilder: FormBuilder,
        private readonly messageService: MessageService,
        private readonly modalDialogService: ModalDialogService,
        private readonly mtaService: MtaService,
        private readonly policyAdditionalInsuredService: PolicyAdditionalInsuredService,
    ) {
        super(userService, formCreatorService, dropdownService, additionalInsuredConfigBuilder);
    }

    public ngOnInit() {
        super.ngOnInit();
        this.getExistingAdditionalInsureds();

        this.effectiveDateForm = this.formBuilder.group({
            effectiveDate: new FormControl((moment(this.dialogModel.policy.inceptionDate)), [Validators.required])
        });
    }

    public save() {
        this.messageService.clearAllMessages();
        this.savingAdditionalInsured();

        const request = <AdditionalInsuredMtaRequest>{
            additionalInsureds: this.formList.map(list => list.additionalInsured),
            cfcUserId: this.userProfile.cfcContactUid,
            effectiveDate: this.effectiveDateForm.controls.effectiveDate.value.toDate()
        };

        this.mtaService.postAdditionalInsuredMta(this.dialogModel.policy.reference, request)
            .subscribe(
                (data) => {
                    data.mtaId ? this.mtaId = Guid.parse(data.mtaId) : this.handleError();
                    this.additionalInsuredFormSaved();
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

                    this.additionalInsuredFormErrorOnSaving();
                }
            );
    }

    private getExistingAdditionalInsureds() {
        this.policyAdditionalInsuredService.get(this.dialogModel.policy.reference).subscribe(
            (additionalInsureds) => {
                if (additionalInsureds) {
                    additionalInsureds.map((additionalInsured) => {
                        let additionalInsuredDetails: IAdditionalInsuredDetailsList = { additionalInsured: additionalInsured, isVisible: false, id: Guid.create() }
                        this.formList.push(additionalInsuredDetails);
                    });
                } else {
                    this.handleError();
                }
            },
            (exception) => {
                if (exception.error?.validationMessages && exception.error.validationMessages.length > 0) {
                    this.handleError(exception.error.validationMessages);
                } else {
                    this.handleError();
                }
            });
    }

    private savingAdditionalInsured() {
        this.isSaving = true;
        if (this.isButtonsSet()) {
            this.disableAddButton();
        }
        this.isSaveDisabled = true;
    }

    private additionalInsuredFormSaved() {
        this.isSaving = false;
        this.isSaved = true;
        this.isSendDisabled = false;
        this.isSaveDisabled = true;
    }

    private additionalInsuredFormErrorOnSaving() {
        this.isSaving = false;
        this.isSaveDisabled = false;
        this.isSendDisabled = true;
    }

    private handleError(errorList: string[] = null) {
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
            this.additionalInsuredFormSaved();
            this.formHandler();
        });
    }
}
