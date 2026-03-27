import { Component, Input, OnDestroy, OnInit, SimpleChanges, ChangeDetectorRef } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { LEDGER_CURRENCIES } from "@app/finance/shared/ledger.currencies";
import { FINANCIAL_TRANSACTION_TYPES } from "@app/finance/ledger/financial-ledger.transaction-types";
import {
  CfcBankAccount,
  DropDownItem,
  FinancialLedgerInfo,
  FinancialTransactionDetail,
  Currency,
  Carrier
} from "@app/models";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { DropdownService } from "@app/services/dropdown.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { FinanceHttpService } from "@app/services/finance-http.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { cloneDeep } from "lodash";
import { of } from "rxjs";
import { Observable, Subject } from "rxjs";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DateValidators } from "@app/validators/date.validators";
import { isMoment } from "moment";
import * as moment from "moment";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { UserService } from "@app/services/user.service";
import { coerceNumberProperty } from "@angular/cdk/coercion";
import { takeUntil, first, map } from "rxjs/operators";
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";

@Component({
    selector: "add-transaction-modal",
    templateUrl: "./add-transaction-modal.component.html",
    styleUrls: ["./add-transaction-modal.component.scss"]
})
export class AddTransactionModalComponent implements OnInit, OnDestroy {
    @Input()
    public financialTransactionAddedResult: FinancialTransactionDetail;

    public addTransForm: FormGroup;

    public displayErrorMessage = false;
    public cfcBankAccounts: Observable<CfcBankAccount[]>;
    public carriers: Carrier[];
    public multiTagRegex = "^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[0-9]{2}$";
    public singleTagRegex = "^(olf|clf)$";
    public queryInProgress = false;
    public isLoadingCarriers = false;

    public errorMessage = null;
    public supportedCurrencyCodes = LEDGER_CURRENCIES;

    public additionalCurrencyCodes: DropDownItem[];
    public currencyObservable: Observable<DropDownItem[]>;
    public supportedTransactionTypes = FINANCIAL_TRANSACTION_TYPES;

    public ledgerReferences: Observable<FinancialLedgerInfo[]>;
    public allowedLloydsRiskCodes: string[];
    public allowedSectionShortCodes: string[];
    public allowedMarketTypes: string[];

    public financialTransactionModel: FinancialTransactionDetail = new FinancialTransactionDetail();

    public originalCurrency: Currency = {
        id: 1,
        symbol: "",
        isoCode: "",
        name: "",
        rate: 1.0
    };

    public accountCurrency: Currency = {
        id: 1,
        symbol: "",
        isoCode: "",
        name: "",
        rate: 1.0
    };

    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private fb: FormBuilder,
        private cfcBankAccountHttpService: CfcBankAccountService,
        private transactionService: FinanceHttpService,
        private ledgerReferenceService: LedgerReferenceHttpService,
        private messageErrorHandler: ErrorMessageHandlerService,
        private readonly dialogRef: MatDialogRef<AddTransactionModalComponent>,
        private dropDownService: DropdownService,
        private dropDownMgrService: DropDownManagerService,
        private readonly userService: UserService,
        private cdRef: ChangeDetectorRef,
        private binderSectionParticipationLookupService: BinderSectionParticipationLookupService
    ) {
    }

    public ngOnInit(): void {
        this.addTransForm = this.fb.group({
            cfcBankAccountId: [null, [Validators.required]],
            paidDate: [moment(), [Validators.required, DateValidators.date()]],
            transactionType: ["", [Validators.required]],
            financialLedgerId: [null, [Validators.required, AutocompleteSelectedValidator]],
            bankAccountCurrencyId: [{ value: null, disabled: true }, [Validators.required]],
            bankAccountAmount: [null, [Validators.required]],
            entryType: [{ value: "", disabled: true }],
            originalAmountCurrencyId: [null, [Validators.required, AutocompleteSelectedValidator]],
            originalAmount: ["", [Validators.required]],
            binderDescription: [{ value: "", disabled: true }],
            binderYear: [{ value: "", disabled: true }],
            sectionShortCode: [{ value: "", disabled: true }, [Validators.pattern("^[a-zA-Z0-9_]*$")]],
            lloydsRiskCode: [{ value: "", disabled: true }, [Validators.pattern("^([a-zA-Z0-9_]{2})?$")]],
            transactionReference: ["", [Validators.required]],
            tags: [[]],
            carrier: [null, Validators.required],
            notes: [""]
        });

        // set up event handling
        this.addTransForm.controls.cfcBankAccountId.valueChanges
            .pipe(
            takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.onCfcBankAccountChanged(data);
            });

        this.addTransForm.controls.financialLedgerId.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: FinancialLedgerInfo) => {
                this.onLedgerReferenceChanged(data);
            });

        this.addTransForm.controls.bankAccountAmount.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.onBankAccountAmountChanged(data);
            });
        this.addTransForm.controls.originalAmountCurrencyId.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.onOriginalCurrencyChange();
            });
        this.addTransForm.controls.sectionShortCode.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe))
                .subscribe((data) => {
                    this.loadCarriers();
                });
        this.addTransForm.controls.lloydsRiskCode.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: string) => {
                if (data) {
                    this.addTransForm.patchValue({
                        lloydsRiskCode: data.toUpperCase()
                    }, {emitEvent: false});
                }
            });
        this.addTransForm.controls.transactionType.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: string) => {
                if (data) {
                    this.selectDefaultCarrier();
                }
            });
        this.financialTransactionModel.entryDate = new Date();
        this.cfcBankAccounts = this.cfcBankAccountHttpService
            .getBankAccounts();
        this.ledgerReferences = this.ledgerReferenceService.getLedgerReferences();
        this.dropDownService.getCurrencies()
            .pipe(first())
            .subscribe((currencies) => {
            this.additionalCurrencyCodes = currencies;
            this.currencyObservable = of(this.additionalCurrencyCodes);
        });
    }

    public ngAfterViewInit() {
        this.addTransForm.controls.bankAccountAmount.markAsPristine();
        this.addTransForm.controls.bankAccountAmount.markAsUntouched();
        this.addTransForm.controls.originalAmount.markAsPristine();
        this.addTransForm.controls.originalAmount.markAsUntouched();

        this.cdRef.detectChanges();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public onSubmit() {
        this.queryInProgress = true;
        const transactionToSend = this.createTransaction();
        this.transactionService.addTransaction(transactionToSend)
            .pipe(
                takeUntil(this.ngUnsubscribe))
            .subscribe(x => {
                this.financialTransactionModel = x;
                this.financialTransactionAddedResult = this.financialTransactionModel;
                this.displayErrorMessage = false;
                this.onCloseModal();
            },
                err => {
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(`Unable to add transaction. ${err.error.Message}`);
                    this.queryInProgress = false;
                }
            );
    }

    private createTransaction(): FinancialTransactionDetail {
        // If this isn't familiar to you, see this: https://github.com/tc39/proposal-object-rest-spread
        // getRawValue includes values from disabled controls
        this.financialTransactionModel = { ...this.financialTransactionModel, ...this.addTransForm.getRawValue() };
        if (this.financialTransactionModel.tags &&
            Array.isArray(this.financialTransactionModel.tags)) {
            this.financialTransactionModel.tags = this.financialTransactionModel.tags.join(",").toUpperCase();
        }
        if (isMoment(this.financialTransactionModel.paidDate)) {
            this.financialTransactionModel.paidDate = this.financialTransactionModel.paidDate.toDate();
        }
        // This is because the selected ledger gets assigned to the value for the auto-complete
        if (this.financialTransactionModel.financialLedgerId &&
            (this.financialTransactionModel.financialLedgerId as any).financialLedgerId) {
            this.financialTransactionModel.financialLedgerId =
                ((this.financialTransactionModel.financialLedgerId as any) as FinancialLedgerInfo).financialLedgerId;
        }
        this.financialTransactionModel.originalAmountCurrencyId =
            coerceNumberProperty(((this.financialTransactionModel.originalAmountCurrencyId as any) as DropDownItem).value);
        const financialTransactionToSend = cloneDeep(this.financialTransactionModel);
        financialTransactionToSend.financialTransactionId = 0;
        financialTransactionToSend.entryDate = new Date();
        financialTransactionToSend.addedOn = new Date();
        financialTransactionToSend.addedByContactId = this.userService.getUser().cfcContactId;
        return financialTransactionToSend;
    }

    public onCloseModal() {
        this.dialogRef.close(this.financialTransactionAddedResult);
    }

    /**
     * When bank account selection changes, make sure the account currency dropdown is also updated
     * to the corresponding currency
     * @param $event
     */
    public onCfcBankAccountChanged(bankAccountIdString: string): void {
        const bankAccountId: number = parseInt(bankAccountIdString);
        let selectedBankAccount: CfcBankAccount;
        this.cfcBankAccounts
            .pipe(
                takeUntil(this.ngUnsubscribe))
            .subscribe(
            bankAccounts => {
                selectedBankAccount = bankAccounts.find(ba => ba.cfcBankAccountId === bankAccountId);
                this.patchOriginalCurrencyDropDownValue(selectedBankAccount.bankAccountCurrencyId);
                this.addTransForm.patchValue({
                    bankAccountCurrencyId: selectedBankAccount.bankAccountCurrencyId
                });
                this.financialTransactionModel.bankAccountName = selectedBankAccount.bankAccountName;
                this.financialTransactionModel.originalAmountCurrencyName = selectedBankAccount.bankAccountCurrencyName;
                this.financialTransactionModel.bankAccountCurrencyName = selectedBankAccount.bankAccountCurrencyName;
                this.setCurrencySymbols();

                this.addTransForm.updateValueAndValidity();
            });
    }

    private patchOriginalCurrencyDropDownValue(currencyId: number): void {
        const foundItems = this.additionalCurrencyCodes.filter((item: DropDownItem) => {
            return item.value == currencyId.toString();
        });
        if (foundItems.length > 0) {
            this.addTransForm.patchValue({
                originalAmountCurrencyId: foundItems[0]
            });
        }
    }

    private setCurrencySymbols() {
        if (this.additionalCurrencyCodes) {
            const matchingAccountItems = this.additionalCurrencyCodes.filter((item: DropDownItem) => {
                return item.value == this.addTransForm.controls.bankAccountCurrencyId.value;
            });
            if (matchingAccountItems && matchingAccountItems.length === 1) {
                this.accountCurrency = this.dropDownMgrService.setCurrencyFromDropDownItem(matchingAccountItems[0]);
            }
            if (this.addTransForm.controls.originalAmountCurrencyId.value &&
                this.addTransForm.controls.originalAmountCurrencyId.value.value) {
                this.originalCurrency =
                    this.dropDownMgrService.setCurrencyFromDropDownItem(this.addTransForm.controls
                        .originalAmountCurrencyId.value);
                this.financialTransactionModel.originalAmountCurrencyName = this.originalCurrency.isoCode;
            }
        }
    }

    public onLedgerReferenceChanged(selectedLedgerReference: FinancialLedgerInfo): void {
        if (selectedLedgerReference) {
            this.addTransForm.patchValue({
                binderYear: selectedLedgerReference.binderYear,
                sectionShortCode: selectedLedgerReference.shortCode,
                binderDescription: selectedLedgerReference.binderDescription,
                lloydsRiskCode: selectedLedgerReference.lloydsRiskCode
            });
            this.financialTransactionModel.ledgerReference = selectedLedgerReference.ledgerReference;
            this.financialTransactionModel.binderYearNo = selectedLedgerReference.binderYearNo;
            this.financialTransactionModel.sectionId = selectedLedgerReference.sectionId;
            this.allowedSectionShortCodes = selectedLedgerReference.allowedSectionShortCodes;
            if (this.financialTransactionModel.sectionShortCode == null &&
                this.allowedSectionShortCodes &&
                this.allowedSectionShortCodes.length > 1) {
                this.addTransForm.controls.sectionShortCode.enable();
            } else {
                this.addTransForm.controls.sectionShortCode.disable();
            }

            this.allowedLloydsRiskCodes = selectedLedgerReference.allowedLloydsRiskCodes;
            if (this.financialTransactionModel.lloydsRiskCode == null && selectedLedgerReference.binderId == null) {
                this.addTransForm.controls.lloydsRiskCode.disable();
            } else {
                this.addTransForm.controls.lloydsRiskCode.enable();
            }
        }
    }

    private loadCarriers() {
        let binderDescription = null;
        let sectionShortCode = null;
        let binderYear = null;
        let sectionId = null;

        if (this.addTransForm.controls.sectionShortCode) {
            binderDescription = this.addTransForm.controls.binderDescription.value;
            sectionShortCode = this.addTransForm.controls.sectionShortCode.value;
            binderYear = this.addTransForm.controls.binderYear.value;
            sectionId = this.addTransForm.controls.financialLedgerId.value.sectionId;
        }

        this.isLoadingCarriers = false;
        this.binderSectionParticipationLookupService
        .getData(binderDescription, sectionShortCode, binderYear, sectionId)
        .pipe(
            map(binderSectionParticipations => {
            return binderSectionParticipations[0]
                ? binderSectionParticipations[0].carriers
                : null;
            })
        )
        .subscribe(carriers => {
            this.carriers = carriers;
            this.isLoadingCarriers = false;

            this.selectDefaultCarrier();
        });
    }

    private selectDefaultCarrier() {
        this.addTransForm.controls.carrier.setValue("N/A");
        if (this.addTransForm.controls.transactionType.value === "MISC") {
            this.addTransForm.controls.carrier.disable();
        } else {
            this.addTransForm.controls.carrier.enable();
        }
      }

    /**
     * When bank account amount is set, the Credit/Debit drop down value is set automatically.
     * @param bankAccountAmount
     */
    public onBankAccountAmountChanged(bankAccountAmountNumber: number): void {
        if (bankAccountAmountNumber > 0) {
            this.addTransForm.patchValue({
                entryType: "DB"
            });
        } else {
            this.addTransForm.patchValue({
                entryType: "CR"
            });
        }
        this.onOriginalCurrencyChange();
    }

    public onOriginalCurrencyChange() {
        this.setCurrencySymbols();
        if (this.addTransForm.controls.bankAccountCurrencyId.value &&
            this.addTransForm.controls.originalAmountCurrencyId.value &&
            this.addTransForm.controls.bankAccountCurrencyId.value ==
            this.addTransForm.controls.originalAmountCurrencyId.value.value) {
            this.addTransForm.controls.originalAmount.disable();
            this.addTransForm.patchValue({
                originalAmount: this.addTransForm.controls.bankAccountAmount.value
            });
        } else {
            this.addTransForm.controls.originalAmount.enable();
        }
    }

    public ledgerReferenceDisplay(item: FinancialLedgerInfo): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item.financialLedgerId;
            return item.ledgerReference;
        }
    }
}
