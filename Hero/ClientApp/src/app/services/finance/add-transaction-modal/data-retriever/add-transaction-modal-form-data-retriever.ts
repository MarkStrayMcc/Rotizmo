import { Observable } from "rxjs";
import { CfcBankAccount, FinancialLedgerInfo, DropDownItem } from "@app/models";
import { Injectable } from "@angular/core";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { take, tap } from "rxjs/operators";

@Injectable({
    providedIn: "root"
})
export abstract class AddTransactionModalFormDataRetriever {
    public cfcBankAccounts$: Observable<CfcBankAccount[]>;
    public ledgerReferences$: Observable<FinancialLedgerInfo[]>;
    public currencies$: Observable<DropDownItem[]>;

    public cfcBankAccounts: CfcBankAccount[];
    public financialLedgerInfos: FinancialLedgerInfo[];
    public currencies: DropDownItem[];

    constructor(protected readonly cfcBankAccountHttpService: CfcBankAccountService,
                protected readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                protected readonly dropDownService: DropdownService) {
    }

    public abstract initialiseFormDropDownData(transactionModalContext: TransactionModalContext): Observable<[any, any, any]>;

    public getCurrencyDropDownItem(currencyId: string): DropDownItem {
        return this.currencies.find(ddi => ddi.value.toString() === currencyId);
    }

    protected initialiseBankAccountsArray(cfcBankAccounts: CfcBankAccount[]) {
        this.cfcBankAccounts = cfcBankAccounts;
    }

    protected initialiseFinancialLedgerInfosArray(financialLedgerInfos: FinancialLedgerInfo[]) {
        this.financialLedgerInfos = financialLedgerInfos;
    }

    protected initialiseCurrenciesDropdownArray(currencyDropDownItems: DropDownItem[]) {
        this.currencies = currencyDropDownItems;
    }

    protected getArrayOfSubscriptions(): [
        Observable<CfcBankAccount[]>,
        Observable<FinancialLedgerInfo[]>,
        Observable<DropDownItem[]>] {
        return [
            this.cfcBankAccountHttpService
                .getBankAccounts()
                .pipe(take(1))
                .pipe(tap((x) => this.initialiseBankAccountsArray(x))),
            this.ledgerReferenceHttpService
                .getLedgerReferences()
                .pipe(take(1))
                .pipe(tap((x) => this.initialiseFinancialLedgerInfosArray(x))),
            this.dropDownService
                .getCurrencies()
                .pipe(take(1))
                .pipe(tap((x) => this.initialiseCurrenciesDropdownArray(x)))
        ];
    }
}
