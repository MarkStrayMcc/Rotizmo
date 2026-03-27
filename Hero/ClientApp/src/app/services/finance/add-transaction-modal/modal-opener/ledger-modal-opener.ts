import { AddTransactionModalOpener } from "./add-transaction-modal-opener";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { FormBuilder } from "@angular/forms";
import { AddTransactionLedgerModalDataRetriever } from "../data-retriever/add-transaction-ledger-modal-data-retriever";
import { AddTransactionLedgerModalFormInitialiserService } from "../form-initialiser/add-transaction-ledger-modal-form-initialiser.service";
import { LedgerContextValueRetriever } from "../contextual-value-retriever/ledger-context-value-retriever";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { AddTransactionOutstandingFundModalComponent } from "@finance/add-transaction-outstanding-fund/add-transaction-outstanding-fund-modal.component";
import { FinancialTransactionDetail } from "@app/models";
import { ModalConfig } from "@app/quote/popups/modal.config";

export class LedgerModalOpener extends AddTransactionModalOpener {
    protected useDialogService(transactionModalContext: TransactionModalContext, afterClose: (obj: any) => void) {
        let modalConfig = ModalConfig.addTransactionModal.matDialogConfig;
        
        this.modalDialogService
            .openDialog<AddTransactionOutstandingFundModalComponent, FinancialTransactionDetail>(
                AddTransactionOutstandingFundModalComponent, // componentOrTemplateRef
                modalConfig, // config
                this.setupDialogComponent(transactionModalContext),
                afterClose);
    }
    constructor(protected readonly modalDialogService: ModalDialogService,
                protected readonly cfcBankAccountHttpService: CfcBankAccountService,
                protected readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                protected readonly currencyService: CurrencyHttpService,
                protected readonly dropdownService: DropdownService,
                protected readonly binderSectionParticipationLookupService: BinderSectionParticipationLookupService,
                protected readonly formBuilder: FormBuilder) {
        super(modalDialogService,
            cfcBankAccountHttpService,
            ledgerReferenceHttpService,
            currencyService,
            dropdownService,
            binderSectionParticipationLookupService,
            formBuilder);
    }
    public setupProviders() {
        this.contextualValueRetriever = new LedgerContextValueRetriever();
        this.addTransactionModalFormDataRetriever = new AddTransactionLedgerModalDataRetriever(
            this.cfcBankAccountHttpService,
            this.ledgerReferenceHttpService,
            this.dropdownService
        );
        this.addTransactionFormInitialiser = new AddTransactionLedgerModalFormInitialiserService(this.formBuilder);
    }
}
