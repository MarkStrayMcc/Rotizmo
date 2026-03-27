import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, ValidationErrors, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { MessageType } from "@app/enums";
import { CfcContact } from "@app/models";
import { Message } from "@app/models/Message";
import { MtaTypeEnum } from "@app/policy/enums/MtaType";
import { ManualChangeMtaRequest } from "@app/policy/models/ManualMtaRequest";
import { MtaResult } from "@app/policy/models/MtaResult";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { DateField, DropDownField, FieldValidator, FormButton, FormButtonTypes, FormConfig, FormItem, TemplateType, TextAreaField } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { DateValidators } from "@app/validators/date.validators";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { Subscription } from 'rxjs';
import { MtaModalModel } from "../mta-modal.model";

@Component({
    selector: "policy-mta-manual-change-mta-modal",
    styleUrls: ["mta-manual-mta.component.scss"],
    templateUrl: "mta-manual-mta.component.html",
})
export class MtaManualChangeMtaComponent implements OnInit, AfterViewInit, OnDestroy {
    public isSaving = false;
    public dialogModel: MtaModalModel;
    public userProfile: CfcContact;
    public formModalConfig: FormConfig;
    public mtaId: Guid;
    public manualMtaForm$: Subscription;
    public formButtonClicked$: Subscription;
    public manualMtaForm: FormItem;

    private mtaTypeEnum = MtaTypeEnum;
    private saveButton: FormButton;
    private saveButtonProperty: string = "manual-mta-save";

    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public mtaHttpService: MtaService,
        public userService: UserService,
        public formCreatorService: FormCreatorService,
        private readonly dialogRef: MatDialogRef<MtaManualChangeMtaComponent>,
        private messageService: MessageService,
    ) { }

    public ngOnInit() {
        this.setConfig();
        this.userProfile = this.userService.getUser();
        this.formHandler();
    }

    public ngOnDestroy() {
        this.unsubscribeAll();
    }

    public formHandler() {
        this.manualMtaForm$ = this.formCreatorService.formInstance.subscribe((form) => {
            if (form && this.manualMtaForm !== form) {
                this.manualMtaForm = form;
                this.saveButton = this.getButton(this.saveButtonProperty);
                this.handleFieldsState();
                this.handleButtonsState();
            }
        });
    }

    public handleFieldsState() {
        if (this.manualMtaForm.form.get("description")) {
            this.manualMtaForm.form.get("description").markAsDirty();
            this.manualMtaForm.form.get("description").updateValueAndValidity({ emitEvent: false });
        }
    }

    public handleButtonsState() {
        if (this.isSaveButtonSet()) {
            if ((this.manualMtaForm.form.invalid || this.isButtonExecuting()) && !this.mtaId) {
                this.disableSaveButton();
            } else {
                this.enableSaveButton();
            }
        }
    }

    public isButtonExecuting() {
        return this.isSaveButtonSet() && this.saveButton.isExecuting;
    }

    public isSaveButtonSet(): boolean {
        return this.saveButton ? true : false;
    }

    public disableSaveButton() {
        if (this.saveButton.disable !== true) {
            this.saveButton.disable = true;
            this.formCreatorService.setForm(this.manualMtaForm);
        }
    }

    public enableSaveButton() {
        if (this.saveButton.disable === true) {
            this.saveButton.disable = false;
            this.formCreatorService.setForm(this.manualMtaForm);
        }
    }

    public ngAfterViewInit() { }

    public setConfig() {
        this.formModalConfig = {
            title: "Register Manual MTA",
            selector: "mta-manual-mta",
            template: TemplateType.OneColumn,
            fields: [
                new DropDownField({
                    cssClass: "manual-change-mta-mta-type",
                    label: "Change type",
                    property: "manualChangeType",
                    enum: this.mtaTypeEnum,
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        }),
                    ]
                }),
                new DateField({
                    cssClass: "manual-change-mta-effective-date",
                    label: "Effective date",
                    property: "effectiveDate",
                    isDisabled: false,
                    hasSeparator: true,
                    validators: [
                        new FieldValidator({
                            selector: "required",
                            message: "Required",
                            validator: Validators.required
                        }),
                        new FieldValidator({
                            selector: "beforeMinimumDate",
                            message: "Effective date must be within the policy period.",
                            validator: this.getInceptionDateValidator()
                        }),
                        new FieldValidator({
                            selector: "afterMaximumDate",
                            message: "Effective date must be within the policy period.",
                            validator: this.getExpirationDateValidator()
                        }),
                    ],
                    value: moment(this.dialogModel.policy.inceptionDate)
                }),
                new TextAreaField({
                    cssClass: "manual-change-mta-description",
                    label: "Description",
                    property: "description",
                    validators: [
                        new FieldValidator({
                            selector: "manualMtaDescription",
                            message: "Required when Mta Type \"Other\" or \"Policy Correction\" is selected",
                            validator: this.descriptionValidation
                        })
                    ]
                })
            ],
            buttons: [
                new FormButton({
                    cssClass: "manual-change-submit",
                    property: this.saveButtonProperty,
                    label: "Save",
                    type: FormButtonTypes.Submit,
                    disable: false
                })
            ]
        };
    }

    public save(formValues) {
        this.messageService.clearAllMessages();

        this.saveButton.isExecuting = true;
        this.saveButton.disable = true;

        const manualChangeMtaRequest: ManualChangeMtaRequest = this.manualChangeMtaRequestBuilder(formValues);
        this.mtaHttpService.postManualChangeMta(this.dialogModel.policy.reference, manualChangeMtaRequest)
            .subscribe(
                (result: MtaResult) => {
                    if (result.mtaId) {
                        this.mtaId = Guid.parse(result.mtaId);
                        this.dialogRef.close();
                    } else {
                        this.handleError();
                    }

                    this.saveButton.isExecuting = false;
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
                    this.saveButton.isExecuting = false;
                }
            );
    }

    private getInceptionDateValidator = () => DateValidators.min(moment(new Date(this.dialogModel.policy.inceptionDate)))

    private getExpirationDateValidator = () => DateValidators.max(moment(new Date(this.dialogModel.policy.expirationDate)))

    private manualChangeMtaRequestBuilder(manualMtaRequest: ManualChangeMtaRequest): ManualChangeMtaRequest {
        return {
            cfcUserId: this.userProfile.cfcContactUid,
            effectiveDate: manualMtaRequest.effectiveDate,
            description: manualMtaRequest.description,
            manualChangeType: manualMtaRequest.manualChangeType
        };
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

    private getButton(buttonProperty: string) {
        return this.manualMtaForm.buttons[this.manualMtaForm.buttons.findIndex(btn => btn.property === buttonProperty)];
    }

    private descriptionValidation(descriptionFormControl: AbstractControl): ValidationErrors {
        if (!descriptionFormControl.parent) {
            return null;
        }

        const doesMtaTypeRequireDescription = () => descriptionFormControl.parent.get("manualChangeType").value === "Other"
            || descriptionFormControl.parent.get("manualChangeType").value === "PolicyCorrection";

        const isDescriptionValid = () => descriptionFormControl.value !== "" && descriptionFormControl.value !== null;

        if (doesMtaTypeRequireDescription() && !isDescriptionValid()) {
            return {
                manualMtaDescription: true
            };
        }
        return null;
    }

    private unsubscribeAll() {
        if (this.manualMtaForm$ && this.formButtonClicked$) {
            this.manualMtaForm$.unsubscribe();
            this.formButtonClicked$.unsubscribe();
        }
    }
}
