import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { BrowserModule } from "@angular/platform-browser";

import { AgGridComponentsModule } from "@app/ag-grid/AgGridComponentsModule.module";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { CheckDisplayComponent } from "@app/ag-grid/check-display/check-display.component";
import { CheckboxInputComponent } from "@app/ag-grid/checkbox-input/checkbox-input.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { LossFundNumberDisplayComponent } from "@app/ag-grid/loss-fund-number-display/loss-fund-number-display.component";
import { ReverseButtonComponent } from "@app/ag-grid/reverse-button/reverse-button.component";
import { AddReconciliationModalComponent } from "@app/finance/add-reconciliation/add-reconciliation-modal.component";
import { AddTransactionModalComponent } from "@app/finance/add-transaction/add-transaction-modal.component";
import { BulkChangeStatusModalComponent } from "@app/finance/bulk-change-status-modal/bulk-change-status-modal.component";
import { ChangeStatusModalComponent } from "@app/finance/change-status-modal/change-status-modal.component";
import { EcfReconciliationPageComponent } from "@app/finance/ecf-reconciliation-page/ecf-reconciliation-page.component";
import { EcfReconciliationSummaryComponent } from "@app/finance/ecf-reconciliation-summary/ecf-reconciliation-summary.component";
import { EcfReconciliationFinancialTransComponent } from "@app/finance/ecf-reconciliation-financial-trans/ecf-reconciliation-financial-trans.component";
// tslint:disable-next-line: max-line-length
import { EcfReconciliationClaimFinancialItemsComponent } from "@app/finance/ecf-reconciliation-claim-financial-items/ecf-reconciliation-claim-financial-items.component";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { LedgerComponent } from "@app/finance/ledger/ledger.component";
import { LossFundSummaryComponent } from "@app/finance/loss-fund-summary/loss-fund-summary.component";
import { CustomPinnedRowButtonRenderer } from "@app/finance/payment-requests/custom-pinned-row-button-renderer.component";
import { PaymentRequestsComponent } from "@app/finance/payment-requests/payment-requests.component";
import { PartReceivedFormComponent } from "@app/finance/part-received-form/part-received-form.component";
import { PaidFormComponent } from "@app/finance/paid-form/paid-form.component";
import { BinderHttpService } from "@app/services/binder-http.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { EcfReconciliationSummaryHttpService } from "@app/services/ecf-reconciliation-summary-http.service";
import { EcfReconciliationGroupHttpService } from "@app/services/ecf-reconciliation-group-http.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { LossFundSummaryHttpService } from "@app/services/loss-fund-summary-http.service";
import { PaymentRequestsHttpService } from "@app/services/payment-requests-http.service";
import { ErrorModule } from "@app/shared/error.module";
import { SharedModule } from "@app/shared/shared.module";
import { AgGridModule } from "ag-grid-angular";

import { BinderLookupService } from "@app/finance/lookups/binder-lookup.service";
import { BinderSectionLookupService } from "@app/finance/lookups/binder-section-lookup.service";
import { CurrencyLookupService } from "@app/finance/lookups/currency-lookup.service";
import { EcfReconciliationLookupService } from "@app/finance/lookups/ecf-reconciliation-lookup.service";
import { FinancialLedgerLookupService } from "@app/finance/lookups/financial-ledger-lookup.service";
import { RiskCodeLookupService } from "@app/finance/lookups/risk-code-lookup.service";
import { UcrLookupService } from "@app/finance/lookups/ucr-lookup.service";
import { SummaryFilterHandlerService } from "@app/finance/ecf-reconciliation/summary/summary-filter-handler.service";
// tslint:disable-next-line: max-line-length
import { FinancialTransactionsFilterHandlerService } from "@app/finance/ecf-reconciliation/financial-transactions/financial-transactions-filter-handler.service";
import { ClaimFinancialItemsFilterHandlerService } from "@app/finance/ecf-reconciliation/claim-financial-items/claim-financial-items-filter-handler.service";
import { FinanceRoutingModule } from "@app/finance/finance-routing.module";
import { MarketTypesHttpService } from "app/services/market-types-http.service";
import { BinderSectionParticipationLookupService } from "./lookups/binder-section-participation-lookup.service";
import { BinderSectionParticipationHttpService } from "@app/services/binder-section-participation-http.service";
import { AddTransactionOutstandingFundModalComponent } from "@app/finance/add-transaction-outstanding-fund/add-transaction-outstanding-fund-modal.component";
import { OutstandingFundsComponent } from "@finance/outstanding-funds/outstanding-funds.component";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";
import { OutstandingFundsGridComponent } from "@finance/outstanding-funds/outstanding-funds-grid/outstanding-funds-grid.component";
import { OutstandingFundsFormComponent } from "@finance/outstanding-funds/outstanding-funds-form/outstanding-funds-form.component";
import { OFundLinkedFinanceNumberDisplay } from "@app/ag-grid/ofund-linked-finance-number-display/ofund-linked-finance-number-display";
import { LedgerAddTransactionModalService } from "@app/services/finance/add-transaction-modal/modal-service/ledger-add-transaction-modal-service";
import { OutstandingFundAddTransactionModalService } from "@app/services/finance/add-transaction-modal/modal-service/outstanding-fund-add-transaction-modal-service";
import { CarrierContributionsComponent } from "@finance/add-transaction-outstanding-fund/carrier-contributions/carrier-contributions.component";
import { TransferToOfficeModalComponent } from "@finance/outstanding-funds/transfer-to-office-modal/transfer-to-office-modal.component";
import { MatIconGridButtonComponent } from "@app/ag-grid/mat-icon-grid-button/mat-icon-grid-button.component";
import { DeleteOutstandingFundModalComponent } from "./outstanding-funds/delete-outstanding-fund-modal/delete-outstanding-fund-modal.component";

@NgModule({
    declarations: [
        PaymentRequestsComponent,
        LedgerComponent,
        LossFundSummaryComponent,
        AddTransactionModalComponent,
        AddTransactionOutstandingFundModalComponent,
        AddReconciliationModalComponent,
        ChangeStatusModalComponent,
        BulkChangeStatusModalComponent,
        EcfReconciliationPageComponent,
        EcfReconciliationSummaryComponent,
        EcfReconciliationFinancialTransComponent,
        EcfReconciliationClaimFinancialItemsComponent,
        PartReceivedFormComponent,
        PaidFormComponent,
        OutstandingFundsComponent,
        OutstandingFundsGridComponent,
        OutstandingFundsFormComponent,
        CarrierContributionsComponent,
        TransferToOfficeModalComponent,
        DeleteOutstandingFundModalComponent
    ],
    providers: [
        CfcBankAccountService,
        LedgerReferenceHttpService,
        LossFundSummaryHttpService,
        PaymentRequestsHttpService,
        MarketTypesHttpService,
        EcfReconciliationSummaryHttpService,
        EcfReconciliationGroupHttpService,
        EcfReconciliationHttpService,
        BinderSectionParticipationHttpService,
        BinderHttpService,
        BinderLookupService,
        BinderSectionLookupService,
        BinderSectionParticipationLookupService,
        CurrencyLookupService,
        EcfReconciliationLookupService,
        FinancialLedgerLookupService,
        RiskCodeLookupService,
        UcrLookupService,
        SummaryFilterHandlerService,
        FinancialTransactionsFilterHandlerService,
        ClaimFinancialItemsFilterHandlerService,
        OutstandingFundsHttpService,
        LedgerAddTransactionModalService,
        OutstandingFundAddTransactionModalService
    ],
    imports: [
        CommonModule,
        AgGridComponentsModule,
        AgGridModule.withComponents([
            CustomPinnedRowRenderer,
            CustomPinnedRowButtonRenderer,
            ReverseButtonComponent,
            FinanceNumberDisplayComponent,
            CheckDisplayComponent,
            CheckboxInputComponent,
            LossFundNumberDisplayComponent,
            OFundLinkedFinanceNumberDisplay,
            GridHeaderComponent,
            MatIconGridButtonComponent
        ]),
        FinanceRoutingModule,
        MatDialogModule,
        MatTabsModule,
        SharedModule,
        ErrorModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        LedgerComponent
    ]
})
export class FinanceModule { }
