import { Component, ElementRef, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { DropdownService } from "@app/services/dropdown.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { LossPayeeComponent } from "@app/shared/loss-payee/loss-payee.component";
import { Quote } from "@app/models/auto-generated/Quote";
import { LossPayeeConfigBuilder } from "@app/shared/loss-payee/loss-payee.config-builder";
import { ILossPayeeDetails } from "@app/shared/loss-payee/ILossPayeeDetails";
import { Guid } from 'guid-typescript';

@Component({
    selector: "quote-loss-payee-modal",
    styleUrls: ["quote-loss-payee.component.scss"],
    templateUrl: "quote-loss-payee.component.html",
})
export class QuoteLossPayeeComponent extends LossPayeeComponent {

    public isSaving = false;
    public quote: Quote;
    
    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public userService: UserService,
        public formCreatorService: FormCreatorService,
        private readonly dialogRef: MatDialogRef<QuoteLossPayeeComponent>,
        public dropdownService: DropdownService,
        public lossPayeeConfigBuilder: LossPayeeConfigBuilder
    ) {
        super(userService, formCreatorService, dropdownService, lossPayeeConfigBuilder);
    }

    public ngOnInit() {
        super.ngOnInit();
        if (this.quote.lossPayees) {
            this.quote.lossPayees.map(lossPayee => {
                let lossPayeeDetails: ILossPayeeDetails = {
                    lossPayee: lossPayee,
                    isVisible: false,
                    id: Guid.create()
                }
                this.lossPayeeDetails.push(lossPayeeDetails);
            });
        }
    }

    public save() {
        this.quote.lossPayees = this.lossPayeeDetails.map(list => list.lossPayee);
        this.dialogRef.close(this.lossPayeeDetails);
    }
}
