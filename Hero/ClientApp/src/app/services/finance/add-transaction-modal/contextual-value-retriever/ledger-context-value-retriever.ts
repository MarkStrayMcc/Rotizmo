import { ContextualFormValueRetriever } from "./contextual-value-retriever";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { Observable, of } from "rxjs";
import { AddTransactionFormValue } from "../models/AddTransactionFormValue";
import * as moment from "moment";

export class LedgerContextValueRetriever extends ContextualFormValueRetriever {
    public getFormValue$(transactionModalContext: TransactionModalContext): Observable<AddTransactionFormValue> {
        const addTransFormValue: AddTransactionFormValue = {
            cfcBankAccountId: null,
            paidDate: moment(),
            transactionType: "",
            financialLedgerId: null,
            bankAccountCurrencyId: null,
            totalAccountAmount: null,
            entryType: "",
            binderDescription: "",
            binderYear: "",
            sectionShortCode: "",
            lloydsRiskCode: "",
            transactionReference: "",
            tags: [],
            tpaFee: false,
            // this is to be fetched from the carriers lookup api and then filtered
            // down to the ones send by the ofund-contributions
            carrier: null,
            carrierParticipationPercentage: null,
            notes: ""
        } as AddTransactionFormValue;
        return of(addTransFormValue);
    }
}
