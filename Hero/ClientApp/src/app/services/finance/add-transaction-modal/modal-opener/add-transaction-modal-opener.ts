import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { InitialFormValueRetriever } from "../initial-value-retriever/initial-form-value-retriever";
import { AddTransactionModalFormDataRetriever } from "../data-retriever/add-transaction-modal-form-data-retriever";
import { AddTransactionOutstandingFundModalComponent } from "@finance/add-transaction-outstanding-fund/add-transaction-outstanding-fund-modal.component";
import { AddTransactionModalFormInitialiser } from "../form-initialiser/add-transaction-modal-form-initialiser";
import { FormBuilder } from "@angular/forms";
import { ContextualFormValueRetriever } from "../contextual-value-retriever/contextual-value-retriever";

export abstract class AddTransactionModalOpener {
    protected contextualValueRetriever: ContextualFormValueRetriever;
    protected initialValueRetriever: InitialFormValueRetriever;
    protected addTransactionModalFormDataRetriever: AddTransactionModalFormDataRetriever;
    protected addTransactionFormInitialiser: AddTransactionModalFormInitialiser;
    constructor(protected readonly modalDialogService: ModalDialogService,
                protected readonly cfcBankAccountHttpService: CfcBankAccountService,
                protected readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                protected readonly currencyService: CurrencyHttpService,
                protected readonly dropdownService: DropdownService,
                protected readonly binderSectionParticipationLookupService: BinderSectionParticipationLookupService,
                protected readonly formBuilder: FormBuilder) {
        this.initialValueRetriever = new InitialFormValueRetriever();
    }

    protected abstract setupProviders();
    public openModal(transactionModalContext: TransactionModalContext, afterClose: (obj: any) => void) {
        this.setupProviders();
        this.useDialogService(transactionModalContext, afterClose);
    }

    protected setupDialogComponent(transactionModalContext: TransactionModalContext): (T: any) => void {
        return (bindObject: AddTransactionOutstandingFundModalComponent) => {
            // set the outstandingFund input for the modal
            bindObject.transactionModalContext = transactionModalContext;
            bindObject.initialFormValueRetriever = this.initialValueRetriever;
            bindObject.formInitialiser = this.addTransactionFormInitialiser;
            bindObject.addTransactionModalFormDataRetriever = this.addTransactionModalFormDataRetriever;
            bindObject.contextualValueRetriever = this.contextualValueRetriever;
        };
    }

    protected abstract useDialogService(transactionModalContext: TransactionModalContext, afterClose: (obj: any) => void);
}
