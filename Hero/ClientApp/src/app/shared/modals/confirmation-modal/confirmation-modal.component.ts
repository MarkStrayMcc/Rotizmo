import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { FormButton, FormButtonTypes, FormConfig, FormItem, QuestionField, TemplateType } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Subscription } from 'rxjs';
import { ConfirmationModalModel } from "./confirmation-modal.model";

@Component({
    selector: "shared-confirmation-modal",
    styleUrls: ["confirmation-modal.component.scss"],
    templateUrl: "confirmation-modal.component.html",
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {

    public isSaving = false;
    public dialogModel: ConfirmationModalModel;
    public formModalConfig: FormConfig;
    public confirmationForm$: Subscription;
    public formButtonClicked$: Subscription;
    public confirmationForm: FormItem;

    private confirmationButtonProperty: string = "confirm-button";
    private cancellationButtonProperty: string = "cancel-button";

    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public formCreatorService: FormCreatorService,
        private readonly dialogRef: MatDialogRef<ConfirmationModalComponent>
    ) { }

    public ngOnInit() {
        this.setConfig();
        this.formHandler();
    }

    private unsubscribeAll() {
        if (this.confirmationForm$ && this.formButtonClicked$) {
            this.confirmationForm$.unsubscribe();
            this.formButtonClicked$.unsubscribe();
        }
    }

    public ngOnDestroy() {
        this.unsubscribeAll();
    }

    public formHandler() {
        this.confirmationForm$ = this.formCreatorService.formInstance.subscribe((form) => {
            if (form && this.confirmationForm !== form) {
                this.confirmationForm = form;
            }
        });
        this.formButtonClicked$ = this.formCreatorService.buttonClicked.subscribe((button) => {
            if (this.isValidButton(button)) {
                this.dialogRef.close(button);
            }
        });
    }

    private isValidButton(button) {
        return button && (button === this.cancellationButtonProperty || button === this.confirmationButtonProperty);
    }

    public setConfig() {
        this.formModalConfig = {
            title: this.dialogModel.title,
            selector: "confirmation-modal-form",
            template: TemplateType.OneColumn,
            fields: [
                new QuestionField({
                    cssClass: "confirmation-question",
                    label: this.dialogModel.question,
                    property: "confirmation-question"
                })
            ],
            buttons: [
                new FormButton({
                    cssClass: "confirmation-button",
                    property: this.confirmationButtonProperty,
                    label: this.dialogModel.confirmationButtonLabel,
                    type: FormButtonTypes.Button,
                }),
                new FormButton({
                    cssClass: "cancellation-button md-mr2",
                    property: this.cancellationButtonProperty,
                    label: this.dialogModel.cancellationButtonLabel,
                    type: FormButtonTypes.Button,
                    style: "link"
                })
            ]
        };
    }
}
