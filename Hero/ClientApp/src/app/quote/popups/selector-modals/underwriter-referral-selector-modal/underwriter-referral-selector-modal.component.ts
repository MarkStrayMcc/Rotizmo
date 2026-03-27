import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable, of } from "rxjs";
import { CfcContact, DropDownItem, ReferralRequest } from "@app/models";
import { DropdownService } from "@app/services/dropdown.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { ReferralService } from "@app/services/referral.service";
import { UserService } from "@app/services/user.service";

@Component({
    selector: "underwriter-referral-selector-modal",
    templateUrl: "underwriter-referral-selector-modal.component.html"
})
export class UnderwriterReferralSelectorModal implements OnInit {
    public underwriterReferralForm: FormGroup;
    public underwriters$: Observable<DropDownItem[]>;
    public quoteId: number;
    public isLoading: boolean;

    public selectedUnderwriter: CfcContact;

    constructor(
        public dialogRef: MatDialogRef<UnderwriterReferralSelectorModal>,
        public dropdownService: DropdownService,
        private formBuilder: FormBuilder,
        private referralService: ReferralService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.dropdownService.getUnderwritersForReferral(this.quoteId).subscribe((underwriters) => {
            if (underwriters) {
                this.underwriters$ = of(underwriters);
                this.isLoading = false;
            }
        });

        this.underwriterReferralForm = this.formBuilder.group({
            underwriter: ["", [Validators.required, AutocompleteSelectedValidator]]
        });
    }

    public confirmUnderwriter(formData: any) {
        const underwriter = this.underwriterReferralForm.controls.underwriter.value;

        const referralRequest = this.createReferralRequest(underwriter);
        this.referralService.refer(referralRequest).subscribe(
            success => this.dialogRef.close({
                underwriter: underwriter,
                success: success
            }),
            () => this.dialogRef.close({
                underwriter: underwriter,
                success: false
            }));
    }

    public getUnderwriterNames(underwriter: CfcContact): string {
        if (underwriter) {
            (underwriter as any).value = underwriter;
            return `${underwriter.firstName} ${underwriter.lastName}`;
        } else {
            return "";
        }
    }

    private createReferralRequest(underwriter): ReferralRequest {
        const request: ReferralRequest = {
            quoteId: this.quoteId,
            initialsReferFrom: this.userService.getInitials(),
            initialsReferTo: underwriter.initials
        };
        return request;
    }
}
