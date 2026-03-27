import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
    FINANCIAL_LEDGER_COLUMNS,
    FINANCIAL_LEDGER_DEFAULT_COLUMN
} from "@app/finance/ledger/financial-ledger.columns";
import {
    FinancialTransactionDetail,
    FinancialTransactionsResult
} from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class FinanceHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    private financialTransactionsApiUrl = "finance/financialTransactions";
    /**
     * Takes bankAccountName, ledger reference and currency id of the bankaccount.
     *
     * @param bankAccountName
     * @param ledgerReference
     * @param bankAccountCurrencyId
     */
    public getTransactions(
        bankAccountName: string,
        ledgerReference: string,
        bankAccountCurrencyId: number
    ): Observable<FinancialTransactionsResult | any> {
        if (!bankAccountCurrencyId && !ledgerReference && !bankAccountName)
            return of(new FinancialTransactionsResult());

        /*
         * Either Bank Account Name or a combination of Ledger Reference and CurrencyId
         */
        
        const finalFinancialTransactionsApiUrl = this.financialTransactionsApiUrl + this.getNamedQueryParamsString(
            bankAccountCurrencyId,
            ledgerReference,
            bankAccountName
        );

        return this.http
            .get(finalFinancialTransactionsApiUrl)
            .pipe(catchError(this.handleErrorObservable));
    }

    private getNamedQueryParamsString(
        bankAccountCurrencyId: number,
        ledgerReference: string,
        bankAccountName: string
    ): any {
        const queryParams = {
            bankAccountCurrencyId,
            ledgerReference,
            bankAccountName,
        };
        const queryString = Object.keys(queryParams)
            .map((key) => {
                if (queryParams[key]) {
                    return (
                        encodeURIComponent(key) +
                        "=" +
                        encodeURIComponent(queryParams[key])
                    );
                }
                return undefined;
            })
            .filter((n) => n !== undefined)
            .join("&");
        if (queryString) return `?${queryString}`;
        return "";
    }

    /**
     * The list of columns to be displayed on the website
     */
    public getColumns(): any[] {
        return FINANCIAL_LEDGER_COLUMNS;
    }

    public getDefaultColumn() {
        return FINANCIAL_LEDGER_DEFAULT_COLUMN;
    }

    public addTransaction(
        newTransaction: FinancialTransactionDetail
    ): Observable<FinancialTransactionDetail | any> {
        return this.http
            .post(this.financialTransactionsApiUrl, newTransaction)
            .pipe(catchError(this.handleErrorObservable));
    }

    public reverseTransaction(
        financialTransactionId: number
    ): Observable<FinancialTransactionDetail | any> {
        let financialTransactionReverseUrl = `finance/reverseFinancialTransaction/${financialTransactionId}`;
        return this.http
            .post(financialTransactionReverseUrl, null)
            .pipe(catchError(this.handleErrorObservable));
    }
}
