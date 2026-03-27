import { AddTransactionModalFormDataRetriever } from "./add-transaction-modal-form-data-retriever";
import { Observable, forkJoin } from "rxjs";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { DropdownService } from "@app/services/dropdown.service";
import { Injectable } from "@angular/core";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";

/***
 * https://angular.io/guide/dependency-injection-providers#creating-tree-shakable-providers
 */
@Injectable({
    providedIn: "root",
    useFactory: (cbas: CfcBankAccountService, lrhs: LedgerReferenceHttpService, dds: DropdownService) =>
        new AddTransactionLedgerModalDataRetriever(cbas, lrhs, dds),
        deps: [CfcBankAccountService, LedgerReferenceHttpService, DropdownService]
})
export class AddTransactionLedgerModalDataRetriever extends AddTransactionModalFormDataRetriever {

    constructor(cfcBankAccountHttpService: CfcBankAccountService,
                ledgerReferenceHttpService: LedgerReferenceHttpService,
                dropDownService: DropdownService,
    ) {
        super(cfcBankAccountHttpService, ledgerReferenceHttpService, dropDownService);
    }

    public initialiseFormDropDownData(transactionModalContext: TransactionModalContext): Observable<[any, any, any]> {
        return forkJoin(this.getArrayOfSubscriptions());
    }
}
