import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { LEDGER_CURRENCIES } from "@app/finance/shared/ledger.currencies";
import { FINANCIAL_TRANSACTION_TYPES } from "@app/finance/ledger/financial-ledger.transaction-types";
import { CfcBankAccount, DropDownItem, FinancialLedgerInfo, FinancialTransactionDetail, Currency, Carrier } from "@app/models";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { FinanceHttpService } from "@app/services/finance-http.service";
import { cloneDeep } from "lodash";
import { Observable, Subject, BehaviorSubject, forkJoin } from "rxjs";
import { FormGroup } from "@angular/forms";
import { isMoment } from "moment";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { UserService } from "@app/services/user.service";
import { coerceNumberProperty } from "@angular/cdk/coercion";
import { takeUntil, map, debounceTime, distinctUntilChanged, filter } from "rxjs/operators";
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";
import { AddTransactionModalFormInitialiser } from "@app/services/finance/add-transaction-modal/form-initialiser/add-transaction-modal-form-initialiser";
import { AddTransactionModalFormDataRetriever } from "@app/services/finance/add-transaction-modal/data-retriever/add-transaction-modal-form-data-retriever";
import { InitialFormValueRetriever } from "@app/services/finance/add-transaction-modal/initial-value-retriever/initial-form-value-retriever";
import { TransactionModalContext } from "@app/services/finance/add-transaction-modal/modal-service/TransactionModalContext";
import { AddTransactionFormValue } from "@app/services/finance/add-transaction-modal/models/AddTransactionFormValue";
import { ContextualFormValueRetriever } from "@app/services/finance/add-transaction-modal/contextual-value-retriever/contextual-value-retriever";
import { CarrierContribution } from "@app/services/finance/add-transaction-modal/models/CarrierContribution";

@Component({
    selector: "add-transaction-outstanding-fund-modal",
    templateUrl: "./add-transaction-outstanding-fund-modal.component.html",
    styleUrls: ["./add-transaction-outstanding-fund-modal.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTransactionOutstandingFundModalComponent implements OnInit, OnDestroy {

    public financialTransactionAddedResult: FinancialTransactionDetail;
    @Input() public formInitialiser: AddTransactionModalFormInitialiser;
    @Input() public addTransactionModalFormDataRetriever: AddTransactionModalFormDataRetriever;
    @Input() public initialFormValueRetriever: InitialFormValueRetriever;
    @Input() public transactionModalContext: TransactionModalContext;
    @Input() public contextualValueRetriever: ContextualFormValueRetriever;

    public carrierContributions: Array<CarrierContribution>;
    public addTransForm: FormGroup;
    public displayErrorMessage = false;
    private cfcBankAccountSubject: BehaviorSubject<CfcBankAccount[]> = new BehaviorSubject([]);
    public cfcBankAccounts$: Observable<CfcBankAccount[]> = this.cfcBankAccountSubject.asObservable();

    public carriers: Carrier[];
    public multiTagRegex = "^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[0-9]{2}$";
    public singleTagRegex = "^(olf|clf)$";
    public queryInProgress = false;
    public isLoadingCarriers = false;
    public errorMessage = null;
    public supportedCurrencyCodes = LEDGER_CURRENCIES;
    private currenciesDropDownSubject: BehaviorSubject<DropDownItem[]> = new BehaviorSubject([]);
    public currenciesDropDownItems$: Observable<DropDownItem[]> = this.currenciesDropDownSubject.asObservable();
    public supportedTransactionTypes = FINANCIAL_TRANSACTION_TYPES;

    private financialLedgerSubject: BehaviorSubject<FinancialLedgerInfo[]> = new BehaviorSubject([]);
    public ledgerReferences$: Observable<FinancialLedgerInfo[]> = this.financialLedgerSubject.asObservable();

    public allowedLloydsRiskCodes: string[];
    public allowedSectionShortCodes: string[];
    public allowedMarketTypes: string[];
    public transactionTypeHasParticipations = true;
    public financialTransactionModel = new FinancialTransactionDetail();

    private ngUnsubscribe: Subject<any> = new Subject();
    public originalCurrency = this.getEmptyCurrency();
    public accountCurrency = this.getEmptyCurrency();
    public isFormLoading = false;

    constructor(
        private readonly transactionService: FinanceHttpService,
        private readonly messageErrorHandler: ErrorMessageHandlerService,
        private readonly dialogRef: MatDialogRef<AddTransactionOutstandingFundModalComponent>,
        private readonly dropDownMgrService: DropDownManagerService,
        private readonly userService: UserService,
        private readonly cdRef: ChangeDetectorRef,
        private readonly binderSectionParticipationLookupService: BinderSectionParticipationLookupService
    ) {
    }

    public ngOnInit(): void {
        this.isFormLoading = true;
        this.addTransForm = this.formInitialiser.initialiseForm(this.initialFormValueRetriever.getInitialValue());
        forkJoin([
            this.addTransactionModalFormDataRetriever
                .initialiseFormDropDownData(this.transactionModalContext),
            this.contextualValueRetriever
                .getFormValue$(this.transactionModalContext)
        ]).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((combinedObservableResults: [
                [CfcBankAccount[], FinancialLedgerInfo[], DropDownItem[]],
                AddTransactionFormValue]) => {
                this.cfcBankAccountSubject.next(combinedObservableResults[0][0]);
                this.financialLedgerSubject.next(combinedObservableResults[0][1]);
                this.currenciesDropDownSubject.next(combinedObservableResults[0][2]);
                this.initialiseFormControlValueChangesSubscriptions();
                this.updateFormValueFromContext(combinedObservableResults[1]);
                this.isFormLoading = false;
            });
    }

    updateFormValueFromContext(addTransFormContextualValue: AddTransactionFormValue) {
        if (this.transactionModalContext.outstandingFund) {
            this.carrierContributions = addTransFormContextualValue.carrierContributions;
            this.carriers = addTransFormContextualValue.remainingCarriers;
            this.addTransForm.patchValue({
                cfcBankAccountId: addTransFormContextualValue.cfcBankAccountId.cfcBankAccountId,
                paidDate: addTransFormContextualValue.paidDate,
                transactionType: addTransFormContextualValue.transactionType,
                financialLedgerId: addTransFormContextualValue.financialLedgerId,
                bankAccountCurrencyId: addTransFormContextualValue.bankAccountCurrencyId.id,
                totalAccountAmount: addTransFormContextualValue.totalAccountAmount,
                entryType: addTransFormContextualValue.entryType,
                binderDescription: addTransFormContextualValue.binderDescription,
                binderYear: addTransFormContextualValue.binderYear,
                sectionShortCode: addTransFormContextualValue.sectionShortCode,
                sectionId: addTransFormContextualValue.financialLedgerId.sectionId,
                lloydsRiskCode: addTransFormContextualValue.lloydsRiskCode,
                transactionReference: addTransFormContextualValue.transactionReference,
                tags: addTransFormContextualValue.tags,
                tpaFee: addTransFormContextualValue.tpaFee,
                notes: addTransFormContextualValue.notes
            }, { onlySelf: true, emitEvent: false });
            this.patchOriginalCurrencyDropDownValue(addTransFormContextualValue.bankAccountCurrencyId.id);
            this.handleOriginalCurrencyAndAmountControls();
            this.setLedgerReferenceAdditionalInformation(addTransFormContextualValue.financialLedgerId);
            this.updatePaidDateAndNotesFieldsState();
            this.addTransForm.controls.totalAccountAmount.markAsPristine();
            this.addTransForm.controls.totalAccountAmount.markAsUntouched();
            this.addTransForm.controls.originalAmount.markAsPristine();
            this.addTransForm.controls.originalAmount.markAsUntouched();
        }
    }

    private updatePaidDateAndNotesFieldsState() {
        if (this.transactionModalContext.outstandingFund) {
            if (this.transactionModalContext.outstandingFund.outstandingAmount === 0) {
                this.addTransForm.get("paidDate").disable();
                this.addTransForm.get("notes").disable();
            }
        }
    }

    private initialiseFormControlValueChangesSubscriptions() {
        this.addTransForm.controls.cfcBankAccountId.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.onCfcBankAccountChanged(data);
            });

        this.addTransForm.controls.financialLedgerId.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .pipe(debounceTime(600))
            .pipe(distinctUntilChanged((prev, curr) => prev.value === curr.value))
            .pipe(filter(selectedLedgerReference => this.isSelectedLedgerReferenceValid(selectedLedgerReference)))
            .subscribe((data: FinancialLedgerInfo) => {
                this.onLedgerReferenceChanged(data);
            });

        this.addTransForm.controls.totalAccountAmount.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.onTotalAccountAmountChanged(data);
            });

        this.addTransForm.controls.bankAccountAmount.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.onBankAccountAmountChanged(data);
            });

        this.addTransForm.controls.originalAmountCurrencyId.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.onOriginalCurrencyChange();
            });

        if (this.transactionModalContext.outstandingFund === undefined) {
            this.addTransForm.controls.sectionShortCode.valueChanges
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(() => {
                    this.loadCarriers();
                });
        }

        this.addTransForm.controls.transactionType.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: string) => {
                if (data) {
                    this.selectEmptyDefaultCarrier();
                }
            });

        this.addTransForm.controls.carrier.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((carrierName) => {
                if (carrierName) {
                    this.onCarrierSelected(carrierName);
                }
            });
    }

    private isSelectedLedgerReferenceValid(selectedLedgerReference: any): boolean {
        if (typeof (selectedLedgerReference) !== "string") {
            return true;
        } else if (typeof (selectedLedgerReference) === "string" && selectedLedgerReference === "") {
            return true;
        } else { return false; }
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public onSubmit(): void {
        this.queryInProgress = true;
        const transactionToSend = this.createTransaction();
        if (!this.isTransactionValid(transactionToSend)) {
            this.queryInProgress = false;
            return;
        }
        this.transactionService.addTransaction(transactionToSend)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(x => {
                this.financialTransactionModel = x;
                this.financialTransactionAddedResult = this.financialTransactionModel;
                this.displayErrorMessage = false;
                this.updateTransactionModalContextWithSelectedInformation();
                this.onCloseModal();
            },
                err => {
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(`Unable to add transaction. ${err.error.Message}`);
                    this.queryInProgress = false;
                    /**
                     * As we use OnPush change detection, we have to mark the component as something to
                     * be explicitly checked for change detection. This has to be done explicitly using
                     * markForCheck.
                     * https://angular.io/api/core/ChangeDetectorRef#detectChanges
                     */
                    this.forceChangeDetection();
                }
            );
    }

    private forceChangeDetection() {
        this.cdRef.markForCheck();
        setTimeout(() => {
            /**
             * Delaying the detectChanges because the errorMessageHandler service seems to have a
             * setTimeout in it, which then sends the error message asynchronously.
             */
            this.cdRef.detectChanges();
        }, 0);
    }

    private updateTransactionModalContextWithSelectedInformation() {
        const cfcBankAccountId = parseInt(this.addTransForm.get("cfcBankAccountId").value, 10);
        this.transactionModalContext.cfcBankAccount =
            this.addTransactionModalFormDataRetriever
                .cfcBankAccounts
                .find(x => x.cfcBankAccountId === cfcBankAccountId);
        const selectedLedgerReference: FinancialLedgerInfo = this.addTransForm.get("financialLedgerId").value;
        this.transactionModalContext.financialLedger =
            this.addTransactionModalFormDataRetriever
                .financialLedgerInfos
                .find(x => x.ledgerReference === selectedLedgerReference.ledgerReference);
        this.transactionModalContext.originalCurrency = this.originalCurrency;
        this.transactionModalContext.financialTransactionDetail = this.financialTransactionAddedResult;
    }

    public onCloseModal(): void {
        this.dialogRef.close(this.transactionModalContext);
    }

    public onCfcBankAccountChanged(bankAccountIdString: string): void {
        const bankAccountId: number = parseInt(bankAccountIdString, 10);
        const selectedBankAccount: CfcBankAccount = this.addTransactionModalFormDataRetriever.cfcBankAccounts.find(ba => ba.cfcBankAccountId === bankAccountId);
        this.patchOriginalCurrencyDropDownValue(selectedBankAccount.bankAccountCurrencyId);
        this.addTransForm.patchValue({
            bankAccountCurrencyId: selectedBankAccount.bankAccountCurrencyId
        });
        this.financialTransactionModel.bankAccountName = selectedBankAccount.bankAccountName;
        this.financialTransactionModel.originalAmountCurrencyName = selectedBankAccount.bankAccountCurrencyName;
        this.financialTransactionModel.bankAccountCurrencyName = selectedBankAccount.bankAccountCurrencyName;
        this.handleOriginalCurrencyAndAmountControls();
        this.addTransForm.updateValueAndValidity();
    }

    public onLedgerReferenceChanged(selectedLedgerReference: FinancialLedgerInfo): void {
        if (selectedLedgerReference) {
            this.setLedgerReferenceAdditionalInformation(selectedLedgerReference);

            this.allowedSectionShortCodes = selectedLedgerReference.allowedSectionShortCodes;

            this.allowedLloydsRiskCodes = selectedLedgerReference.allowedLloydsRiskCodes;
            this.addTransForm.patchValue({
                binderYear: selectedLedgerReference.binderYear,
                binderDescription: selectedLedgerReference.binderDescription,
                sectionShortCode: selectedLedgerReference.shortCode,
                lloydsRiskCode: selectedLedgerReference.lloydsRiskCode
            }, { onlySelf: true, emitEvent: false });
            this.updateStateOfSectionShortCode();
            this.updateStateOfLloydsRiskCode(selectedLedgerReference);
        }
    }

    private setLedgerReferenceAdditionalInformation(ledgerReference: FinancialLedgerInfo) {
        this.financialTransactionModel.ledgerReference = ledgerReference.ledgerReference;
        this.financialTransactionModel.binderYearNo = ledgerReference.binderYearNo;
        this.financialTransactionModel.sectionId = ledgerReference.sectionId;
    }

    private updateStateOfLloydsRiskCode(selectedLedgerReference: FinancialLedgerInfo) {
        if (!this.transactionModalContext.outstandingFund) {
            if (this.financialTransactionModel.lloydsRiskCode == null && selectedLedgerReference.binderId == null) {
                this.addTransForm.controls.lloydsRiskCode.disable({ emitEvent: false, onlySelf: true });
            } else {
                this.addTransForm.controls.lloydsRiskCode.enable({ emitEvent: false, onlySelf: true });
            }
        }
    }

    private updateStateOfSectionShortCode() {
        if (!this.transactionModalContext.outstandingFund) {
            if (this.financialTransactionModel.sectionShortCode == null &&
                this.allowedSectionShortCodes &&
                this.allowedSectionShortCodes.length > 1) {
                this.addTransForm.controls.sectionShortCode.enable();
            } else {
                this.addTransForm.controls.sectionShortCode.disable();
            }
        }
    }

    public onTotalAccountAmountChanged(totalAccountAmount: number): void {
        if (totalAccountAmount > 0) {
            this.addTransForm.patchValue({
                entryType: "DB"
            });
        } else {
            this.addTransForm.patchValue({
                entryType: "CR"
            });
        }
        this.propagateTotalAccountAmountToForm();
    }

    public onBankAccountAmountChanged(bankAccountAmount: number): void {
        if (this.areBankAccountAndOriginalAmountCurrencyDefinedAndEqual() && this.isCarrierNotNaOrEmpty()) {
            this.addTransForm.controls.originalAmount.setValue(bankAccountAmount);
        }
    }

    private areBankAccountAndOriginalAmountCurrencyDefinedAndEqual() {
        const bankAccountCurrency = this.addTransForm.controls.bankAccountCurrencyId.value;
        const originalAmountCurrency = this.addTransForm.controls.originalAmountCurrencyId.value;
        return bankAccountCurrency && originalAmountCurrency && originalAmountCurrency.value &&
        bankAccountCurrency.toString() === originalAmountCurrency.value.toString();
    }

    public onOriginalCurrencyChange(): void {
        this.handleOriginalCurrencyAndAmountControls();
    }

    public ledgerReferenceDisplay(item: FinancialLedgerInfo): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item.financialLedgerId;

            return item.ledgerReference;
        }
    }

    public onCarrierSelected(selectedCarrierName: string) {
        if (selectedCarrierName) {
            if (selectedCarrierName === "" || selectedCarrierName === "N/A") {
                this.addTransForm.patchValue({
                    carrierParticipationPercentage: null,
                    bankAccountAmount: null,
                    originalAmount: null
                }, {
                    emitEvent: false,
                    onlySelf: true
                });
            } else if (this.carriers) {
                const selectedCarrier = this.carriers.find(ba => ba.carrierName.trim().toUpperCase() === selectedCarrierName.trim().toUpperCase());
                if (selectedCarrier) {
                    const selectedCarrierParticipationPercent = selectedCarrier.participationPercent;
                    this.addTransForm.controls.carrierParticipationPercentage.setValue(selectedCarrierParticipationPercent);
                    this.propagateTotalAccountAmountToForm();
                } else {
                    this.addTransForm.controls.carrierParticipationPercentage.setValue(null);
                }
            }
        }
    }

    private handleOriginalCurrencyAndAmountControls(): void {
        this.setCurrencySymbols();
        if (this.areBankAccountAndOriginalAmountCurrencyDefinedAndEqual() &&
            this.isCarrierNotNaOrEmpty()
        ) {
            this.addTransForm.patchValue({
                originalAmount: this.addTransForm.controls.bankAccountAmount.value
            });
        }
    }

    private isCarrierNotNaOrEmpty(): boolean {
        const selectedCarrier = this.addTransForm.controls.carrier.value;
        return (selectedCarrier !== "" && selectedCarrier !== "N/A");
    }

    private createTransaction(): FinancialTransactionDetail {
        // If this isn't familiar to you, see this: https://github.com/tc39/proposal-object-rest-spread
        // getRawValue includes values from disabled controls
        this.financialTransactionModel = { ...this.financialTransactionModel, ...this.addTransForm.getRawValue() };
        if (this.transactionModalContext.outstandingFund) {
            this.financialTransactionModel.outstandingFundId = this.transactionModalContext.outstandingFund.outstandingFundId;
        }
        if (this.financialTransactionModel.lloydsRiskCode) {
            this.financialTransactionModel.lloydsRiskCode = this.financialTransactionModel.lloydsRiskCode.toUpperCase();
        }
        if (this.financialTransactionModel.tags &&
            Array.isArray(this.financialTransactionModel.tags) &&
            this.financialTransactionModel.tags.length > 0) {
            this.financialTransactionModel.tags = this.financialTransactionModel.tags.join(",").toUpperCase();
        } else {
            this.financialTransactionModel.tags = null;
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

    private patchOriginalCurrencyDropDownValue(currencyId: number): void {
        const currencyDropDownItem = this.addTransactionModalFormDataRetriever.getCurrencyDropDownItem(currencyId.toString());
        if (currencyDropDownItem) {
            this.addTransForm.patchValue({
                originalAmountCurrencyId: currencyDropDownItem
            });
        }
    }

    private setCurrencySymbols(): void {
        if (this.addTransactionModalFormDataRetriever.currencies) {
            let bankAccountCurrencyDropDownItem;
            if (this.addTransForm.controls.bankAccountCurrencyId.value) {
                bankAccountCurrencyDropDownItem = this.addTransactionModalFormDataRetriever
                    .getCurrencyDropDownItem(this.addTransForm.controls.bankAccountCurrencyId.value.toString());
            }

            if (bankAccountCurrencyDropDownItem) {
                this.accountCurrency = this.dropDownMgrService.setCurrencyFromDropDownItem(bankAccountCurrencyDropDownItem);
            }
            if (this.addTransForm.controls.originalAmountCurrencyId.value &&
                this.addTransForm.controls.originalAmountCurrencyId.value.value) {
                this.originalCurrency = this.dropDownMgrService.setCurrencyFromDropDownItem(this.addTransForm.controls.originalAmountCurrencyId.value);
                this.financialTransactionModel.originalAmountCurrencyName = this.originalCurrency.isoCode;
            }
        }
    }

    private loadCarriers(): void {
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

        this.isLoadingCarriers = true;
        this.binderSectionParticipationLookupService
        .getData(binderDescription, sectionShortCode, binderYear, sectionId)
            .pipe(map(binderSectionParticipations => binderSectionParticipations[0] ? binderSectionParticipations[0].carriers : null))
        .subscribe(carriers => {
            this.carriers = carriers;
            this.isLoadingCarriers = false;

            this.selectEmptyDefaultCarrier();
        });
    }

    private selectEmptyDefaultCarrier(): void {
        this.addTransForm.controls.carrier.setValue("N/A");
        if (this.addTransForm.controls.transactionType.value === "MISC") {
            this.addTransForm.controls.carrier.disable();
            this.transactionTypeHasParticipations = false;
        } else {
            this.addTransForm.controls.carrier.enable();
            this.transactionTypeHasParticipations = true;
        }
    }

    private propagateTotalAccountAmountToForm(): void {
        let selectedCarrierParticipationPercent = 100;
        const currentlySelectedCarrier = this.getCurrentlySelectedCarrier();
        if (currentlySelectedCarrier) {
            selectedCarrierParticipationPercent = currentlySelectedCarrier.participationPercent;
        }
        const totalAccountAmount = this.addTransForm.controls.totalAccountAmount.value;
        if (totalAccountAmount) {
            let bankAccountAmount = (selectedCarrierParticipationPercent / 100) * totalAccountAmount;
            bankAccountAmount = Math.round(bankAccountAmount * 100) / 100;
            this.addTransForm.patchValue({
                bankAccountAmount,
                originalAmount: bankAccountAmount
            }, {
                onlySelf: true,
                emitEvent: false
            });
        }
    }

    private getCurrentlySelectedCarrier(): Carrier {
        const currentlySelectedCarrierName = this.addTransForm.controls.carrier.value as string;
        if (currentlySelectedCarrierName && this.carriers) {
            const selectedCarrier = this.carriers.find(ba => ba.carrierName.trim().toUpperCase() === currentlySelectedCarrierName.trim().toUpperCase());
            return selectedCarrier;
        }
        return null;
    }

    private getEmptyCurrency(): Currency {
        const emptyCurrency = new Currency();
        emptyCurrency.id = 1;
        emptyCurrency.symbol = "";
        emptyCurrency.isoCode = "";
        emptyCurrency.name = "";
        emptyCurrency.rate = 1.0;
        return emptyCurrency;
    }

    private isTransactionValid(transactionToSend: any): boolean {
        if (transactionToSend.totalAccountAmount === 0) {
            this.showErrorMessage("The total account amount cannot be zero.");
            return false;
        }
        if (transactionToSend.bankAccountAmount === 0) {
            this.showErrorMessage("The transaction account amount cannot be zero.");
            return false;
        }
        if (transactionToSend.originalAmount === 0) {
            this.showErrorMessage("The transaction original amount cannot be zero.");
            return false;
        }
        if (transactionToSend.transactionType !== "MISC" && (!transactionToSend.carrier || transactionToSend.carrier === "N/A")) {
            this.showErrorMessage("A carrier has to be selected for a Cash Call or a Loss Fund transaction.");
            return false;
        }
        if ((transactionToSend.totalAccountAmount < 0 && transactionToSend.bankAccountAmount > 0) ||
            (transactionToSend.totalAccountAmount > 0 && transactionToSend.bankAccountAmount < 0)) {
            this.showErrorMessage("The total account amount and the transaction account amount must both be positive or both be negative");
            return false;
        }
        if ((transactionToSend.totalAccountAmount < 0 && transactionToSend.originalAmount > 0) ||
            (transactionToSend.totalAccountAmount > 0 && transactionToSend.originalAmount < 0)) {
            this.showErrorMessage("The total account amount and the transaction original amount must both be positive or both be negative");
            return false;
        }
        if ((transactionToSend.bankAccountAmount < 0 && transactionToSend.originalAmount > 0) &&
            (transactionToSend.bankAccountAmount > 0 && transactionToSend.originalAmount < 0)) {
            this.showErrorMessage("The transaction account amount and the original amount must both be positive or both be negative");
            return false;
        }
        return true;
    }

    private showErrorMessage(errorMessage: string): void {
        this.displayErrorMessage = true;
        this.messageErrorHandler.handleError(`Unable to add transaction. ${errorMessage}`);
        this.forceChangeDetection();
    }

    public isCarrierParticipationInputDisplayed() {
        if (this.transactionModalContext.outstandingFund) {
            return this.areCarrierPaymentsDue();
        }
        return true;
    }

    private areCarrierPaymentsDue(): boolean {
        return (this.carrierContributions && this.transactionModalContext.outstandingFund.outstandingAmount !== 0);
    }

    public isAddTransactionButtonDisabled() {
        const isFormInvalid = (this.addTransForm.invalid || this.queryInProgress);
        const transactionType = this.addTransForm.controls.transactionType.value;

        if (transactionType === "MISC") {
            return isFormInvalid;
        }
        const outstandingFund = this.transactionModalContext.outstandingFund;
        const carrierParticipation = this.addTransForm.controls.carrierParticipationPercentage.value;

        if ((outstandingFund && outstandingFund.outstandingAmount === 0) || carrierParticipation === null || isFormInvalid) {
            return true;
        }

        return false;
    }
}
