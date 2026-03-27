import { Component, Input, OnInit } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import { EmailTemplate, ServerSideFileData } from "@app/models";
import { AttachmentField } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
@Component({
    selector: "app-attachment-field",
    templateUrl: "./attachment-field.component.html",
})
export class AttachmentFieldComponent implements OnInit {

    @Input()
    formGroup: FormGroup;

    @Input()
    config: AttachmentField;

    public validFileTypes: string;

    public attachmentFormControl: AbstractControl;

    private defaultAttachments: ServerSideFileData[];

    constructor(
        private formCreatorService: FormCreatorService
    ) {
    }

    ngOnInit() {
        this.attachmentFormControl = this.formGroup.get(this.config.property);

        this.formCreatorService.emailTemplateChanged.subscribe((emailTemplate: EmailTemplate) => {
            if (emailTemplate && emailTemplate.defaultAttachments) {
                var attachment: ServerSideFileData = {
                    fileName: emailTemplate.defaultAttachments[0].fileName,
                    serverSideFileType: emailTemplate.defaultAttachments[0].serverSideFileType,
                    reference: emailTemplate.defaultAttachments[0].reference,
                    countryIsoCode: emailTemplate.defaultAttachments[0].countryIsoCode,
                    stateProvinceCode: emailTemplate.defaultAttachments[0].stateProvinceCode
                };
                
                this.defaultAttachments = [attachment];

                this.formGroup.get(this.config.serverSideField).setValue(this.defaultAttachments);
            }
        });
    }
}
