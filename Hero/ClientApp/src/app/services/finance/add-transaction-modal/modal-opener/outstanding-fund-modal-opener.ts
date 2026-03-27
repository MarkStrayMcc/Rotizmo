import { AddTransactionModalOpener } from "./add-transaction-modal-opener";
import { AddTransactionOutstandingFundsModalDataRetriever } from "../data-retriever/add-transaction-outstanding-funds-modal-data-retriever";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { FormBuilder } from "@angular/forms";
import {
    AddTransactionOutstandingFundsModalFormInitialiserService
} from "../form-initialiser/add-transaction-outstanding-funds-modal-form-initialiser.service";
import { OutstandingFundContextValueRetriever } from "../contextual-value-retriever/outstanding-fund-context-value-retriever";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { AddTransactionOutstandingFundModalComponent } from "@finance/add-transaction-outstanding-fund/add-transaction-outstanding-fund-modal.component";
import { OutstandingFund } from "@app/finance/models/OutstandingFund";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";

export class OutstandingFundModalOpener extends AddTransactionModalOpener {
    protected useDialogService(transactionModalContext: TransactionModalContext, afterClose: (obj: any) => void) {
        this.modalDialogService.openDialog<AddTransactionOutstandingFundModalComponent, OutstandingFund>(
            AddTransactionOutstandingFundModalComponent, // componentOrTemplateRef
            ModalConfig.addTransactionModal.matDialogConfig, // config
            this.setupDialogComponent(transactionModalContext),
            afterClose);
    }
    constructor(protected readonly modalDialogService: ModalDialogService,
                protected readonly cfcBankAccountHttpService: CfcBankAccountService,
                protected readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                protected readonly currencyService: CurrencyHttpService,
                protected readonly dropdownService: DropdownService,
                protected readonly binderSectionParticipationLookupService: BinderSectionParticipationLookupService,
                protected readonly formBuilder: FormBuilder,
                protected readonly outstandingFundsHttpService: OutstandingFundsHttpService
                ) {
        super(modalDialogService,
            cfcBankAccountHttpService,
            ledgerReferenceHttpService,
            currencyService,
            dropdownService,
            binderSectionParticipationLookupService,
            formBuilder);
    }
    public setupProviders() {
        this.contextualValueRetriever = new OutstandingFundContextValueRetriever(
            this.cfcBankAccountHttpService,
            this.ledgerReferenceHttpService,
            this.currencyService,
            this.dropdownService,
            this.binderSectionParticipationLookupService,
            this.outstandingFundsHttpService
        );
        this.addTransactionModalFormDataRetriever = new AddTransactionOutstandingFundsModalDataRetriever(
            this.cfcBankAccountHttpService,
            this.ledgerReferenceHttpService,
            this.dropdownService);
        this.addTransactionFormInitialiser = new AddTransactionOutstandingFundsModalFormInitialiserService(this.formBuilder);
    }
}
