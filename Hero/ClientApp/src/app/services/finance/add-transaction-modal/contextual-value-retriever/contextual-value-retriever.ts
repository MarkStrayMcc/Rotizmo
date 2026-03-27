import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { Observable } from "rxjs";
import { AddTransactionFormValue } from "../models/AddTransactionFormValue";

export abstract class ContextualFormValueRetriever {
    public abstract getFormValue$(transactionModalContext: TransactionModalContext): Observable<AddTransactionFormValue>;
}
