import { Injectable } from "@angular/core";
import { TransactionModalContext } from "./TransactionModalContext";
import { LedgerModalOpener } from "../modal-opener/ledger-modal-opener";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { FormBuilder } from "@angular/forms";

@Injectable({
    providedIn: "root"
})
export class LedgerAddTransactionModalService {
    constructor(protected readonly modalDialogService: ModalDialogService,
                protected readonly cfcBankAccountHttpService: CfcBankAccountService,
                protected readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                protected readonly currencyService: CurrencyHttpService,
                protected readonly dropdownService: DropdownService,
                protected readonly binderSectionParticipationLookupService: BinderSectionParticipationLookupService,
                protected readonly formBuilder: FormBuilder) {

    }

    public openModal(transactionModalContext: TransactionModalContext, afterClose: (obj: TransactionModalContext) => void) {
        /**
         * const opener = new OFundModalOpener(...)
         * const context = { ofund = ...} as TransactionModalContext;
         * opener.openModal(context, exististing callback used in OFund page)
         */
        const opener = new LedgerModalOpener(
            this.modalDialogService,
            this.cfcBankAccountHttpService,
            this.ledgerReferenceHttpService,
            this.currencyService,
            this.dropdownService,
            this.binderSectionParticipationLookupService,
            this.formBuilder);
        opener.openModal(transactionModalContext, afterClose);
    }
}
