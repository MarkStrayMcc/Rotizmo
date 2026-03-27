import { Component, ElementRef, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { DropdownService } from "@app/services/dropdown.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { AdditionalInsuredComponent } from "@app/shared/additional-insured/additional-insured.component";
import { Quote } from "@app/models/auto-generated/Quote";
import { AdditionalInsuredConfigBuilder } from "@app/shared/additional-insured/additional-insured.config-builder";
import { IAdditionalInsuredDetailsList } from "@app/shared/additional-insured/IAdditionalInsuredDetailsList";
import { Guid } from 'guid-typescript';

@Component({
    selector: "quote-additional-insured-modal",
    styleUrls: ["quote-additional-insured.component.scss"],
    templateUrl: "quote-additional-insured.component.html",
})
export class QuoteAdditionalInsuredComponent extends AdditionalInsuredComponent {

    public isSaving = false;
    public quote: Quote;
    
    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public userService: UserService,
        public formCreatorService: FormCreatorService,
        public dialogRef: MatDialogRef<QuoteAdditionalInsuredComponent>,
        public dropdownService: DropdownService,
        public additionalInsuredConfigBuilder: AdditionalInsuredConfigBuilder
    ) {
        super(userService, formCreatorService, dropdownService, additionalInsuredConfigBuilder);
    }

    public ngOnInit() {
        super.ngOnInit();
        if (this.quote.additionalInsureds) {
            this.quote.additionalInsureds.map(additionalInsured => {
                let additionalInsuredDetails: IAdditionalInsuredDetailsList = {
                    additionalInsured: additionalInsured,
                    isVisible: false,
                    id: Guid.create()
                }
                this.formList.push(additionalInsuredDetails);
            });
        }
    }

    public save() {
        this.quote.additionalInsureds = this.formList.map(list => list.additionalInsured);
        this.dialogRef.close(this.formList);
    }
}
