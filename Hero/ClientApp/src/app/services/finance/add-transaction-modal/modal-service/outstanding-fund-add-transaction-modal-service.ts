import { Injectable } from "@angular/core";
import { TransactionModalContext } from "./TransactionModalContext";
import { OutstandingFundModalOpener } from "../modal-opener/outstanding-fund-modal-opener";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { FormBuilder } from "@angular/forms";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";

@Injectable({
    providedIn: "root"
})
export class OutstandingFundAddTransactionModalService {
    constructor(protected readonly modalDialogService: ModalDialogService,
                protected readonly cfcBankAccountHttpService: CfcBankAccountService,
                protected readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                protected readonly currencyService: CurrencyHttpService,
                protected readonly dropdownService: DropdownService,
                protected readonly binderSectionParticipationLookupService: BinderSectionParticipationLookupService,
                protected readonly outstandingFundsHttpService: OutstandingFundsHttpService,
                protected readonly formBuilder: FormBuilder) {

    }

    public openModal(transactionModalContext: TransactionModalContext, afterClose: (obj: TransactionModalContext) => void) {
        /**
         * const opener = new OFundModalOpener(...)
         * const context = { ofund = ...} as TransactionModalContext;
         * opener.openModal(context, exististing callback used in OFund page)
         */
        const opener = new OutstandingFundModalOpener(
            this.modalDialogService,
            this.cfcBankAccountHttpService,
            this.ledgerReferenceHttpService,
            this.currencyService,
            this.dropdownService,
            this.binderSectionParticipationLookupService,
            this.formBuilder,
            this.outstandingFundsHttpService
        );
        opener.openModal(transactionModalContext, afterClose);
    }
}
