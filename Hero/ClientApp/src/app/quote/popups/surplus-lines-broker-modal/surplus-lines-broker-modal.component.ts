import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { DropDownItem } from "@app/models";
import { SurplusLinesBrokerModalHandler } from "@app/quote/popups/surplus-lines-broker-modal/surplus-lines-broker-modal-handler.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { SurplusLinesLicenseService } from "@app/quote/services/surplus-lines-license.service";
import { DropdownService } from "@app/services/dropdown.service";
import { UserService } from "@app/services/user.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-surplus-lines-broker-modal",
    templateUrl: "./surplus-lines-broker-modal.component.html"
})

export class SurplusLinesBrokerModal implements OnInit, OnDestroy {
    public form: FormGroup;
    public isSurplusLinesLicenseFeatureEnabled: boolean;

    public usStates$: Observable<DropDownItem[]>;
    public isSaving: boolean;
    private brokerContactEmail: string;
    private ngUnsubscribe = new Subject<void>();

    constructor(
        private readonly dropdownService: DropdownService,
        private readonly dialogRef: MatDialogRef<SurplusLinesBrokerModal>,
        private readonly surplusLinesBrokerModalHandler: SurplusLinesBrokerModalHandler,
        private readonly surplusLinesLicenseService: SurplusLinesLicenseService,
        private readonly quoteService: QuoteService,
        private readonly userService: UserService,
        private readonly formBuilder: FormBuilder
    ) { }

    public ngOnInit() {
        this.isSurplusLinesLicenseFeatureEnabled = this.userService.isFeatureAccessible("heroSurplusLinesLicense");
        if (this.isSurplusLinesLicenseFeatureEnabled) {
            this.setBrokerContactEmail();
        }
        this.form = this.createForm();
        this.usStates$ = this.dropdownService.getCountryStates("US");
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public close() {
        if (!this.isSaving) {
            this.dialogRef.close();
        }
    }

    public save() {
        if (this.form.valid) {
            this.isSaving = true;
            if (this.userService.isFeatureAccessible("heroSurplusLinesLicense")) {
                this.surplusLinesLicenseService.saveSurplusLinesLicense(this.form)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe(surplusLine => this.dialogRef.close(surplusLine),
                        error => console.error(error),
                        () => this.isSaving = false);
            } else {
                this.surplusLinesBrokerModalHandler
                    .save(this.form)
                    .subscribe(
                        surplusLine => this.dialogRef.close(surplusLine),
                        error => console.error(error),
                        () => this.isSaving = false);
            }
        } else {
            this.markAllControlsAsTouched();
        }
    }

    public get disableSave() {
        return this.isSaving || this.form.invalid;
    }

    private createForm(): FormGroup {
        if (this.userService.isFeatureAccessible("heroSurplusLinesLicense")) {
            return this.formBuilder.group({
                name: [null, Validators.maxLength(150)],
                company: [null, [Validators.required, Validators.maxLength(150)]],
                licenceState: [null, [Validators.required, AutocompleteSelectedValidator]],
                licence: [null, Validators.required],
                expiry: [null, Validators.required],
                address1: [null, Validators.required],
                address2: [null],
                address3: [null],
                state: [null, [Validators.required, AutocompleteSelectedValidator]],
                zip: [null, Validators.required]
            });
        } else {
            return this.formBuilder.group({
                name: [null, Validators.maxLength(150)],
                company: [null, [Validators.required, Validators.maxLength(150)]],
                licence: [null, Validators.required],
                expiry: [null, Validators.required],
                address1: [null, Validators.required],
                address2: [null],
                address3: [null],
                state: [null, [Validators.required, AutocompleteSelectedValidator]],
                zip: [null, Validators.required]
            });
        }
    }

    private markAllControlsAsTouched(): void {
        Object.keys(this.form.controls)
            .forEach(key => this.form.get(key).markAsTouched());
    }

    private setBrokerContactEmail() {
        const quote = this.quoteService.getQuoteReference();
        if (quote && quote.brokerContact) {
            this.brokerContactEmail = quote.brokerContact.email;
        }
    }
}
