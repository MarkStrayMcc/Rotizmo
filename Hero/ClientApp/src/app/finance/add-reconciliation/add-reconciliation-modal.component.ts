import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import * as moment from "moment";
import { Observable, Subject, of } from "rxjs";
import { takeUntil, first, take, map} from "rxjs/operators";
import {
  Currency,
  DropDownItem,
  EcfReconciliation,
  EcfReconciliationSummary,
  UcrLookup
} from "@app/models";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { UserService } from "@app/services/user.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { DateValidators } from "@app/validators/date.validators";

@Component({
    selector: "app-add-reconciliation-modal",
    templateUrl: "./add-reconciliation-modal.component.html"
})
export class AddReconciliationModalComponent implements OnInit, OnDestroy {
    @Input()
    public initialEcfReconciliationSummary: EcfReconciliationSummary;

    public ucrLookups$: Observable<Array<UcrLookup>>;

    public isEcfFinanceAdminFeatureEnabled: boolean = false;
    public isEcfFinanceUserFeatureEnabled: boolean = false;

    public addReconciliationForm: FormGroup;
    public errorMessage = null;
    public displayErrorMessage: boolean = false;
    public currencyObservable: Observable<DropDownItem[]>;

    public isEditMode: boolean = false;
    public isReadOnly: boolean = false;
    public isAmountEditable: boolean = true;
    public isDeleteVisible: boolean = false;
    public isSubmitEnabled: boolean = false;

    public amountCurrency: Currency = {
        id: 1,
        symbol: "",
        isoCode: "",
        name: "",
        rate: 1.0
    };

    private ngUnsubscribe: Subject<any> = new Subject();
    private readonly ecfFinanceAdminFeatureName: string = "ecfFinanceAdmin";
    private readonly ecfFinanceUserFeatureName: string = "ecfFinanceUser";


    constructor(
        private fb: FormBuilder,
        private ecfReconciliationService: EcfReconciliationHttpService,
        private messageErrorHandler: ErrorMessageHandlerService,
        private dropDownService: DropdownService,
        private dropDownMgrService: DropDownManagerService,
        private readonly dialogRef: MatDialogRef<AddReconciliationModalComponent>,
        private readonly userService: UserService,
        private cdRef: ChangeDetectorRef
    ) {
    }

    public ngOnInit(): void {
        this.initializeFormControls();
        this.initializeLookups();
        this.userService.getData().subscribe(() => {
            this.checkFeatureAvailability();
            this.setFormElementsVisibility();
            this.cdRef.detectChanges();
        });
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public ucrDisplay(item: UcrLookup): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item;
            return item.reference;
        }
    }

    public checkFeatureAvailability() {
        this.isEcfFinanceAdminFeatureEnabled = this.userService.isFeatureAccessible(this.ecfFinanceAdminFeatureName);
        this.isEcfFinanceUserFeatureEnabled = this.userService.isFeatureAccessible(this.ecfFinanceUserFeatureName);
    }

    public onSubmit() {
        const ucr = this.getSelectedUcr();

        this.ucrLookups$.pipe(take(1), map(k => k.find(item => item.reference === ucr))).subscribe(ucrLookup => {
            if (!this.isEcfFinanceAdminFeatureEnabled && !ucrLookup) {
                this.displayAuthorityError();
            }
            else {
                const ecfReconciliationToSend = this.createEcfReconciliation();
                this.addOrUpdateEcfReconciliation(ecfReconciliationToSend);
            }
        });
    }

    public onDelete() {
        const ecfReconciliationIdToSend = this.initialEcfReconciliationSummary.ecfReconciliationId;
        const canDelete = !this.linkedItemsExist();
        if (canDelete) {
            this.ecfReconciliationService.deleteEcfReconciliation(ecfReconciliationIdToSend)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(x => {
                        this.displayErrorMessage = false;
                        this.onCloseModal(null);
                    },
                    err => {
                        this.displayErrorMessage = true;
                        this.messageErrorHandler.handleError(
                            `Unable to delete reconciliation. ${err.error.Message}`);
                    }
                );
        } else {
            this.displayErrorMessage = true;
            this.messageErrorHandler.handleError("Unable to delete reconciliation with linked items");
        }
    }

    public onCloseModal(result: EcfReconciliation) {
        this.dialogRef.close(result);
    }

    private setFormElementsVisibility(): void {
        if (this.isEditMode) {
            if (!this.isEcfFinanceAdminFeatureEnabled) {
                this.addReconciliationForm.disable();
                this.isAmountEditable = false;
                this.displayErrorMessage = true;
                this.messageErrorHandler.handleWarning("No authority to edit ECF Reconciliations");
            } else if (this.initialEcfReconciliationSummary.reconciledGroupId) {
                this.addReconciliationForm.disable();
                this.isAmountEditable = false;
                this.displayErrorMessage = true;
                this.messageErrorHandler.handleWarning("Reconciliation has been completed. Please unreconcile before editing.");
            } else {
                if (this.linkedItemsExist()) {
                    this.addReconciliationForm.disable();
                    this.addReconciliationForm.get("amount").enable();
                } else {
                    this.addReconciliationForm.enable();
                }
                this.isAmountEditable = true;
                this.isDeleteVisible = true;
            }
        } else {
            if (!this.isEcfFinanceUserFeatureEnabled) {
                this.addReconciliationForm.disable();
                this.displayErrorMessage = true;
                this.messageErrorHandler.handleWarning("No authority to add ECF Reconciliations");
            }
        }

        this.isSubmitEnabled = !this.isReadOnly || this.isAmountEditable;
    }

    private linkedItemsExist(): boolean {
        // it checks whether there are any linked CFIs or FTs based on cfiDiff and ftDiff
        // it would fail with certain edge cases (for example, if the sum of the transactions cancel each other out)
        const ecfAmount = this.initialEcfReconciliationSummary.ecfAmount;
        const cfiDiff = this.initialEcfReconciliationSummary.claimFinancialItemsDifference;
        const ftDiff = this.initialEcfReconciliationSummary.financialTransactionsDifference;

        return (ecfAmount !== -cfiDiff || ecfAmount !== ftDiff);
    }

    private initializeFormControls(): void {
        const sequenceNoValidationPattern = "[1-9][0-9]{2}|[0-9]?[1-9][0-9]|[0-9]{0,2}[1-9]";

        if (!this.initialEcfReconciliationSummary) {
            this.isEditMode = false;
            this.addReconciliationForm = this.fb.group({
                ucr: [{
                    value: "",
                    disabled: this.isReadOnly
                }, Validators.required],
                currencyId: [
                    {
                        value: null,
                        disabled: this.isReadOnly
                    }, [Validators.required, AutocompleteSelectedValidator]
                ],
                sequenceNo: [{
                    value: "",
                    disabled: this.isReadOnly
                }, [Validators.required, Validators.pattern(sequenceNoValidationPattern)]],
                completedDate: [{
                    value: moment(),
                    disabled: this.isReadOnly
                }, [DateValidators.date()]],
                amount: [{
                    value: "",
                    disabled: true
                }, [Validators.required]]
            });
        } else {
            this.isEditMode = true;
            this.isReadOnly = true;

            const ucrLookup = new UcrLookup();
            ucrLookup.reference = this.initialEcfReconciliationSummary.ucr;
            const completedDate = this.initialEcfReconciliationSummary.completedDate ? moment(this.initialEcfReconciliationSummary.completedDate) : null;

            this.addReconciliationForm = this.fb.group({
                ucr: [{
                    value: ucrLookup,
                    disabled: this.isReadOnly
                }, [Validators.required]],
                currencyId: [
                    {
                        value: null,
                        disabled: this.isReadOnly
                    }, [Validators.required, AutocompleteSelectedValidator]
                ],
                sequenceNo: [{
                    value: this.initialEcfReconciliationSummary.sequenceNo,
                    disabled: this.isReadOnly
                }, [Validators.required, Validators.pattern(sequenceNoValidationPattern)]],
                completedDate: [{
                    value: completedDate,
                    disabled: this.isReadOnly
                }, [DateValidators.date()]],
                amount: [{
                    value: "",
                    disabled: !this.isAmountEditable
                }, [Validators.required]]
            });
            this.addReconciliationForm.controls.amount.patchValue(this.initialEcfReconciliationSummary.ecfAmount);
            this.setAmountCurrencySymbol();
        }

        this.addReconciliationForm.controls.currencyId.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.onAmountCurrencyChange();
            });
    }

    private initializeLookups() {
        this.dropDownService.getCurrencies().pipe(first()).subscribe(currencies => {
            if (this.isEditMode) {
                const initialCurrencyId = this.initialEcfReconciliationSummary.currency.id;
                const initialCurrency = currencies.find(c => +c.value === initialCurrencyId);
                if (initialCurrency) {
                    this.addReconciliationForm.controls.currencyId.patchValue(initialCurrency);
                }
            }
            this.currencyObservable = of(currencies);
        });
    }

    private onAmountCurrencyChange(): void {
        this.setAmountCurrencySymbol();
        this.setAmountAvailability();
    }

    private setAmountAvailability() {
        const currencyId = this.addReconciliationForm.controls.currencyId.value;

        if (currencyId && this.isAmountEditable) {
            this.addReconciliationForm.controls.amount.enable();
        } else {
            this.addReconciliationForm.controls.amount.disable();
        }
    }

    private setAmountCurrencySymbol() {
        const currencyId = this.addReconciliationForm.controls.currencyId.value;
        if (currencyId && currencyId.value) {
            const currency = this.dropDownMgrService.setCurrencyFromDropDownItem(currencyId);
            this.amountCurrency = {
                id: currency.id,
                symbol: currency.symbol,
                isoCode: currency.isoCode,
                name: currency.isoCode,
                rate: currency.rate
            };
        }
    }

    private addOrUpdateEcfReconciliation(ecfReconciliationToSend: EcfReconciliation) {
        this.ecfReconciliationService.addOrUpdateEcfReconciliation(ecfReconciliationToSend)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(x => {
                this.displayErrorMessage = false;
                this.onCloseModal(ecfReconciliationToSend);
            },
                err => {
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(`Unable to add reconciliation. ${err.error.Message}`);
                }
            );
    }

    private displayAuthorityError() {
        this.displayErrorMessage = true;
        this.messageErrorHandler.handleError(`Unable to add reconciliation. Current user does not have the authority to create a new UCR`);
    }

    private createEcfReconciliation(): EcfReconciliation {
        const user = this.userService.getUser();
        const result = new EcfReconciliation();
        const formControls = this.addReconciliationForm.controls;

        if (this.initialEcfReconciliationSummary) {
            result.ecfReconciliationId = this.initialEcfReconciliationSummary.ecfReconciliationId;
            result.reconciledGroupId = this.initialEcfReconciliationSummary.reconciledGroupId;
        }

        result.ucr = this.getSelectedUcr();;
        result.currencyId = formControls.currencyId.value ? formControls.currencyId.value.value : null;
        result.sequenceNo = formControls.sequenceNo.value ? formControls.sequenceNo.value : null;
        result.amount = isNaN(formControls.amount.value) ? null : formControls.amount.value;
        result.completedDate = formControls.completedDate.value ? formControls.completedDate.value : null;
        result.addedByCfcContactId = this.isEditMode ? null : user.cfcContactId;
        result.lastEditedByCfcContactId = this.isEditMode ? user.cfcContactId : null;


        if (moment.isMoment(result.completedDate)) {
            result.completedDate = result.completedDate.toDate();
        }

        return result;
    }

    private getSelectedUcr(): string {
        const selectedUcr = this.addReconciliationForm.controls.ucr.value;
        const ucrReference = selectedUcr.reference ? selectedUcr.reference : selectedUcr;
        return ucrReference;
    }
}
