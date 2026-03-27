import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, AbstractControl } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { OutstandingFundsGridDataHandlerService } from "@app/services/finance/outstanding-funds/outstanding-funds-grid-data-handler.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { takeUntil, debounceTime, distinctUntilChanged, filter } from "rxjs/operators";

@Component({
    selector: "finance-outstanding-funds-form",
    templateUrl: "./outstanding-funds-form.component.html",
    styleUrls: ["./outstanding-funds-form.component.scss"]
})
export class OutstandingFundsFormComponent implements OnInit {
    public outstandingFundsGridFiltersForm: FormGroup;
    public ledgerCurrencyIsoCodes$: Observable<Array<string>>;
    public ledgerReferences$: Observable<Array<{value: string}>>;
    public cfcBankAccounts$: Observable<Array<string>>;
    private ngUnsubscribe: Subject<void> = new Subject();

    private cfcBankAccountFormControl: AbstractControl;
    private ledgerCurrencyIsoCodeFormControl: AbstractControl;
    private ledgerReferenceFormControl: AbstractControl;

    private hasInitialised = false;

    constructor(private formBuilder: FormBuilder, private oFundsGridDataHandler: OutstandingFundsGridDataHandlerService) {
    }

    // Forms working with select - ngValue instead of value - https://www.tektutorialshub.com/angular/select-options-example-in-angular/
    // Unsubscribe patterns - https://medium.com/angular-in-depth/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0
    ngOnInit() {
        this.initialiseFormGroup();
        this.initialiseFormControlLocalReferences();
        this.initialiseFormControlDataSources();
        this.ensureGridDataIsUpdatedOnFormValueChanges();
        this.hasInitialised = true;
    }

    private ensureGridDataIsUpdatedOnFormValueChanges() {
        this.oFundsGridDataHandler
            .oFundsFormSelection$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((formSelection: {
                bankAccountName: string,
                currencyIsoCode: string,
                ledgerReference: string
            }) => {
                this.updateFormSelection(formSelection);
            });

        this.outstandingFundsGridFiltersForm
            .get("cfcBankAccount")
            .valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(selectedBankAccount => {
                this.oFundsGridDataHandler
                    .setFormFilters(
                        selectedBankAccount,
                        this.ledgerCurrencyIsoCodeFormControl.value,
                        this.getValidLedgerReferenceSelection()
                    );
            });

        this.outstandingFundsGridFiltersForm
            .get("ledgerCurrencyIsoCode")
            .valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(selectedCurrencyIsoCode => {
                this.oFundsGridDataHandler
                    .setFormFilters(
                        this.cfcBankAccountFormControl.value,
                        selectedCurrencyIsoCode,
                        this.getValidLedgerReferenceSelection()
                    );
            });

        this.outstandingFundsGridFiltersForm
            .get("ledgerReference")
            .valueChanges
            .pipe(debounceTime(600))
            .pipe(distinctUntilChanged((prev, curr) => prev.value === curr.value))
            .pipe(takeUntil(this.ngUnsubscribe))
            // only subscribe when ledgerReference has a valid value- of type { value: string }
            // not a plain string
            .pipe(filter(selectedLedgerReference => this.isSelectedLedgerReferenceValid(selectedLedgerReference)))
            .subscribe((selectedLedgerReference: { value: string }) => {
                this.oFundsGridDataHandler
                    .setFormFilters(this.cfcBankAccountFormControl.value,
                        this.ledgerCurrencyIsoCodeFormControl.value,
                        selectedLedgerReference.value ? selectedLedgerReference.value : ""
                    );
            });
    }

    private updateFormSelection(formSelection: { bankAccountName: string; currencyIsoCode: string; ledgerReference: string; }) {
        /** ensure we don't fetch all outstanding funds on page load */
        if (!this.hasInitialised) {
            return;
        }
        this.outstandingFundsGridFiltersForm
            .setValue({
                cfcBankAccount: formSelection.bankAccountName,
                ledgerCurrencyIsoCode: formSelection.currencyIsoCode,
                ledgerReference: { value: formSelection.ledgerReference }
            }, { emitEvent: false });
        this.oFundsGridDataHandler
            .formFiltersChanged(
                this.cfcBankAccountFormControl.value,
                this.ledgerCurrencyIsoCodeFormControl.value,
                this.getValidLedgerReferenceSelection()
            );
    }

    private getValidLedgerReferenceSelection(): string {
        if (this.ledgerReferenceFormControl.valid &&
            this.ledgerReferenceFormControl.value) {
            return this.ledgerReferenceFormControl.value.value;
        }
        return "";
    }

    private isSelectedLedgerReferenceValid(selectedLedgerReference: any): boolean {
        if (typeof (selectedLedgerReference) !== "string") {
            return true;
        } else if (typeof (selectedLedgerReference) === "string" && selectedLedgerReference === "") {
            return true;
        } else { return false; }
    }

    private initialiseFormControlDataSources() {
        this.cfcBankAccounts$ = this.oFundsGridDataHandler.cfcBankAccountNames$;
        this.ledgerCurrencyIsoCodes$ = this.oFundsGridDataHandler.ledgerCurrencyIsoCodes$;
        this.ledgerReferences$ = this.oFundsGridDataHandler.ledgerReferences$;
    }

    private initialiseFormControlLocalReferences() {
        this.cfcBankAccountFormControl = this.outstandingFundsGridFiltersForm
            .get("cfcBankAccount");
        this.ledgerCurrencyIsoCodeFormControl = this.outstandingFundsGridFiltersForm
            .get("ledgerCurrencyIsoCode");
        this.ledgerReferenceFormControl = this.outstandingFundsGridFiltersForm
            .get("ledgerReference");
    }

    private initialiseFormGroup() {
        this.outstandingFundsGridFiltersForm = this.formBuilder.group({
            cfcBankAccount: [null],
            ledgerCurrencyIsoCode: [null],
            ledgerReference: [null, [AutocompleteSelectedValidator]]
        });
    }

    clearFilters() {
        this.oFundsGridDataHandler.resetGridInlineColumnFilters();
    }

    /**
     * Method used by the autocomplete dropdown to display the ledger references.
     * @param item : is an anonymous object with a property named value that
     * stores the ledger reference string
     */
    ledgerReferenceDisplay(item: any): string {
        if (item) {
            return item.value;
        }
    }
}
