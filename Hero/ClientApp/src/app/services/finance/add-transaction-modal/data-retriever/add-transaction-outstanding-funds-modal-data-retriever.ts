import { AddTransactionModalFormDataRetriever } from "./add-transaction-modal-form-data-retriever";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { Observable, forkJoin } from "rxjs";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { map } from "rxjs/operators";
import { CfcBankAccount, FinancialLedgerInfo } from "@app/models";

export class AddTransactionOutstandingFundsModalDataRetriever extends AddTransactionModalFormDataRetriever {
    constructor(cfcBankAccountHttpService: CfcBankAccountService,
                ledgerReferenceHttpService: LedgerReferenceHttpService,
                dropDownService: DropdownService,
    ) {
        super(cfcBankAccountHttpService, ledgerReferenceHttpService, dropDownService);
    }
    public initialiseFormDropDownData(transactionModalContext: TransactionModalContext): Observable<[any, any, any]> {
        return forkJoin(this.getArrayOfSubscriptions())
            .pipe((results) => {
            return this.filterDropDownDataBasedOnContext(transactionModalContext, results);
        });
    }

    private filterDropDownDataBasedOnContext(transactionModalContext: TransactionModalContext,
                                             results: Observable<[any, any, any]>): Observable<[any, any, any]> {
       return results.pipe(map((arrays) => {
            const bankAccount = arrays[0].find((x: CfcBankAccount) => x.bankAccountName === transactionModalContext.outstandingFund.cfcBankAccount);
            const financialLedger = arrays[1].find((x: FinancialLedgerInfo) => x.ledgerReference === transactionModalContext.outstandingFund.ledgerReference);
            return [[bankAccount], [financialLedger], arrays[2]];
        }));
    }
}
