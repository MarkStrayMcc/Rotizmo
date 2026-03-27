import { Injectable } from "@angular/core";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { Observable, BehaviorSubject } from "rxjs";
import { FinancialLedgerInfo, CfcBankAccount, MultipleOperationsResultProblemDetails, OutstandingFundsTransferResponse } from "@app/models";
import { OutstandingFund } from "@app/finance/models/OutstandingFund";
import { OutstandingFundsHttpService } from "./outstanding-funds-http.service";
import { OUTSTANDING_FUNDS_COLUMNS, OUTSTANDING_FUNDS_DEFAULT_COLUMN } from "@finance/outstanding-funds/outstanding-funds-grid/outstanding-funds.columns";
import { AgGridColumnDefinition } from "@finance/ledger/AgGridColumnDefinition";
import { ColDef } from "ag-grid";
import { map, take } from "rxjs/operators";
import { LEDGER_CURRENCIES } from "@finance/shared/ledger.currencies";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { TransferToOfficeResponseMessageRetriever } from "../transfer-to-office-modal/response-message-retriever/transfer-to-office-response-message-retriever";
import { UserService } from "@app/services/user.service";

@Injectable({
    providedIn: "root"
})
export class OutstandingFundsGridDataHandlerService {
    // do not expose subjects directly as clients can then emit new values of the subject - BAD
    private outstandingFundRecordsSubject = new BehaviorSubject<OutstandingFund[]>([]);

    private ledgerReferencesSubject = new BehaviorSubject<Array<{value: string}>>([]);
    private cfcBankAccountNamesSubject = new BehaviorSubject<Array<string>>([]);
    private ledgerCurrencyIsoCodesSubject = new BehaviorSubject<Array<string>>([]);
    private gridInlineColumnFiltersResetSubject = new BehaviorSubject(null);
    /**
     * a BehaviorSubject that will store the values of the controls in the ofundsform.
     */
    private oFundsFormSelectionSubject = new BehaviorSubject<{
        bankAccountName: string,
        currencyIsoCode: string,
        ledgerReference: string;
    }>({
        bankAccountName: "",
        currencyIsoCode: "",
        ledgerReference: ""
    });

    private displayErrorMessageSubject = new BehaviorSubject<boolean>(false);

    // observable to wrap around the subject - exposed to clients
    public readonly ledgerReferences$: Observable<Array<{value: string}>> = this.ledgerReferencesSubject.asObservable();
    public readonly cfcBankAccountNames$: Observable<Array<string>> = this.cfcBankAccountNamesSubject.asObservable();
    public readonly ledgerCurrencyIsoCodes$: Observable<Array<string>> = this.ledgerCurrencyIsoCodesSubject.asObservable();
    public readonly outstandingFundRecords$: Observable<OutstandingFund[]> = this.outstandingFundRecordsSubject.asObservable();
    public readonly gridInlineColumnFiltersReset$: Observable<null> = this.gridInlineColumnFiltersResetSubject.asObservable();

    public readonly displayErrorMessage$ = this.displayErrorMessageSubject.asObservable();

    public readonly oFundsFormSelection$ = this.oFundsFormSelectionSubject.asObservable();

    constructor(private readonly cfcBankAccountHttpService: CfcBankAccountService,
                private readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                private readonly outstandingFundsHttpService: OutstandingFundsHttpService,
                private readonly errorMessageHandlerService: ErrorMessageHandlerService,
                private readonly userService: UserService
    ) {
        this.initialiseFormControls();
    }

    initialiseFormControls() {
        this.cfcBankAccountHttpService.getBankAccounts()
            .pipe(
                map((cfcbankaccounts) => {
                    return cfcbankaccounts.map((x: CfcBankAccount) => x.bankAccountName);
                }))
            .pipe(take(1))
            .subscribe((cfcBankAccounts) => this.cfcBankAccountNamesSubject.next(cfcBankAccounts));

        this.ledgerCurrencyIsoCodesSubject.next(this.getLedgerCurrencyIsoCodes());

        /**
         * In order to get autocompletevalidator to work correctly with the elements of a dropdownselect,
         * it is important to feed the datasource a list of elements that have `value` as a property.
         * Thus mapping the lederReference values to an array of anonymous objects with a value property
         */
        this.ledgerReferenceHttpService.getLedgerReferences()
            .pipe(
                map((financialLedgerInfos) => {
                    return financialLedgerInfos.map((x: FinancialLedgerInfo) => {
                        return { value: x.ledgerReference };
                    });
                }))
            .pipe(take(1))
            .subscribe((ledgerReferences) => this.ledgerReferencesSubject.next(ledgerReferences));
    }

    private getLedgerCurrencyIsoCodes(): Array<string> {
        return LEDGER_CURRENCIES.map((currency) => currency.isoCode);
    }

    public updateGridData(cfcBankAccount: string, currencyIsoCode: string, ledgerReference: string) {
        this.outstandingFundsHttpService.getOutstandingFunds(cfcBankAccount, currencyIsoCode, ledgerReference)
            .pipe(take(1))
            .subscribe((outstandingFundsResponse) => this.outstandingFundRecordsSubject.next(outstandingFundsResponse.outstandingFunds));
    }

    public getOutstandingFundsGridColumns(): AgGridColumnDefinition[] {
        return OUTSTANDING_FUNDS_COLUMNS;
    }

    public resetGridInlineColumnFilters() {
        this.gridInlineColumnFiltersResetSubject.next(null);
    }

    /**
     *
     * @param transferToOfficeResponse can be of Type MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse
     */
    public handleTransferToOfficeResponse(transferToOfficeResponse: MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse) {
        const transferToOfficeResponseMessageRetriever = new TransferToOfficeResponseMessageRetriever();
        const responseMessage = transferToOfficeResponseMessageRetriever.getResponseMessage(transferToOfficeResponse);
        this.errorMessageHandlerService.handleErrorsByStatusCode(responseMessage.message, responseMessage.statusCode);
        this.displayErrorMessageOnOFundComponent();
        this.updateGridDataUsingFormSelectionFilters();
    }

    /**
     * https://www.ag-grid.com/javascript-grid-column-definitions/#default-column-definitions
     * defaultColDef: contains column properties all columns will inherit.
     */
    public getDefaultColumnDefinition(): ColDef {
        return OUTSTANDING_FUNDS_DEFAULT_COLUMN;
    }

    public setFormFilters(bankAccountName: string, currencyIsoCode: string, ledgerReference: string) {
            this.hideErrorMessageOnOFundComponent();
            this.oFundsFormSelectionSubject.next({
            bankAccountName, currencyIsoCode, ledgerReference
        });
    }

    /***
    * whenever the formFiltersChange, you obviously have to update grid data
    */
    public formFiltersChanged(bankAccount: string, currencyIsoCode: string, ledgerReference: string) {
        this.updateGridData(bankAccount, currencyIsoCode, ledgerReference);
    }

    private displayErrorMessageOnOFundComponent() {
        this.displayErrorMessageSubject.next(true);
    }

    private hideErrorMessageOnOFundComponent() {
        this.displayErrorMessageSubject.next(false);
    }

    public deleteOutstandingFund(outstandingFundId: number): void {
        const cfcContactId = this.userService.getUser().cfcContactId;
        this.outstandingFundsHttpService
            .delete(outstandingFundId, cfcContactId)
            .subscribe(
                () => {
                this.updateGridDataUsingFormSelectionFilters();
            },
                (errorResponse) => this.handleDeleteErrorResponse(errorResponse));
    }

    private handleDeleteErrorResponse(errorResponse) {
        const error = errorResponse.error;
        // errors come in a standard problem details format, ideally.
        this.errorMessageHandlerService.handleErrorsByStatusCode(error.title, error.status);
        this.displayErrorMessageOnOFundComponent();
    }

    private updateGridDataUsingFormSelectionFilters() {
        this.oFundsFormSelection$
            .pipe(take(1))
            .subscribe((formSelection: {
                bankAccountName: string,
                currencyIsoCode: string,
                ledgerReference: string;
            }) => {
                this.formFiltersChanged(formSelection.bankAccountName, formSelection.currencyIsoCode, formSelection.ledgerReference);
            });
    }
}
