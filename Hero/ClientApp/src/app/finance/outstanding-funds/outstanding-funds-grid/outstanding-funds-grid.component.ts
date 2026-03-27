import { Component, OnInit,  ViewChild, OnDestroy, ViewEncapsulation } from "@angular/core";
import { RowNode, GridOptions, ColDef, GridApi } from "ag-grid";
import { OutstandingFundsTransferResponse, MultipleOperationsResultProblemDetails } from "@app/models/auto-generated";
import { OutstandingFund } from "@finance/models/OutstandingFund";
import { AgGridNg2 } from "ag-grid-angular";
import { OutstandingFundsGridDataHandlerService } from "@app/services/finance/outstanding-funds/outstanding-funds-grid-data-handler.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { OutstandingFundAddTransactionModalService } from "@app/services/finance/add-transaction-modal/modal-service/outstanding-fund-add-transaction-modal-service";
import { TransactionModalContext } from "@app/services/finance/add-transaction-modal/modal-service/TransactionModalContext";
import { CustomPinnedRowRenderer } from "@finance/ledger/custom-pinned-row-renderer.component";
import { CustomPinnedRowButtonRenderer } from "@finance/payment-requests/custom-pinned-row-button-renderer.component";
import { TransferToOfficeModalService } from "@app/services/finance/transfer-to-office-modal/transfer-to-office-modal-service";
import { DeleteOutstandingFundModalService } from "@app/services/finance/delete-outstanding-fund-modal/delete-outstanding-fund-modal-service";

@Component({
    selector: "finance-outstanding-funds-grid",
    templateUrl: "./outstanding-funds-grid.component.html",
    styleUrls: ["./outstanding-funds-grid.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class OutstandingFundsGridComponent implements OnInit, OnDestroy {

    constructor(private readonly outstandingFundsGridDataHandler: OutstandingFundsGridDataHandlerService,
                private readonly outstandingFundModalService: OutstandingFundAddTransactionModalService,
                private readonly transferToOfficeModalService: TransferToOfficeModalService,
                private readonly deleteOutstandingFundModalService: DeleteOutstandingFundModalService
    ) {
    }

    outstandingFundsAgGridOptions: GridOptions;
    private readonly gridRowHeight: number = 48;
    private readonly gridHeaderHeight: number = 66;
    private scrollToOutstandingFundId: number;

    @ViewChild("agGrid") agGrid: AgGridNg2;
    // used to manage subscriptions - ensure you always takeUntil this one to avoid memory leaks
    private ngUnsubscribe: Subject<void> = new Subject();

    ngOnInit() {
        this.initialiseGridOptions();
        this.provideCallbackToPinnedButton();
        this.initialiseDeleteButtonsOnGrid();
        this.initialiseInlineGridFilterSubscription();
        this.initialiseOutstandingAmountColumnClickHandling();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private initialiseInlineGridFilterSubscription() {
        this.outstandingFundsGridDataHandler.gridInlineColumnFiltersReset$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.clearFilters();
            });
    }

    private initialiseGridOptions(): void {
        // following instructions from
        // https://www.ag-grid.com/example-angular-rxjs/#with-full-data-set-supplied-to-the-grid-with-changed-data-within
        this.outstandingFundsAgGridOptions = {
            enableRangeSelection: true, // allows copy / paste using cell ranges
            // ensures that only modified rows are rendered when updating grid data
            // https://www.ag-grid.com/javascript-grid-immutable-data/
            columnDefs: this.outstandingFundsGridDataHandler.getOutstandingFundsGridColumns(),
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            // selection parameters = https://www.ag-grid.com/javascript-grid-selection/
            rowHeight: this.gridRowHeight,
            headerHeight: this.gridHeaderHeight,
            defaultColDef: this.outstandingFundsGridDataHandler.getDefaultColumnDefinition(),
            rowMultiSelectWithClick: true,
            rowSelection: "multiple", // allow selection of multiple rows
            getRowNodeId: (outstandingFund) => this.getRowNodeId(outstandingFund),
            getBusinessKeyForNode: (rowNode) => this.getBusinessKeyForNode(rowNode),
            onRowDataChanged: (event) => this.onRowDataChanged(event),
            onSelectionChanged: () => this.setPinnedBottomRowData(),
            onGridReady: () => {
                this.outstandingFundsGridDataHandler.outstandingFundRecords$.subscribe(
                    (outstandingFundsRecords) => {
                        if (this.outstandingFundsAgGridOptions.api) {
                            this.outstandingFundsAgGridOptions.api.setRowData(outstandingFundsRecords);
                            this.outstandingFundsAgGridOptions.api.sizeColumnsToFit();
                        }
                    }
                );
            },
            isRowSelectable: (rowNode) => this.isRowSelectable(rowNode),
            frameworkComponents: { customPinnedRowRenderer: CustomPinnedRowRenderer, customPinnedRowButtonRenderer: CustomPinnedRowButtonRenderer }
        } as GridOptions;
    }

    private provideCallbackToPinnedButton() {
        const columnWithPinnedButton: ColDef = this.outstandingFundsAgGridOptions
            .columnDefs
            .find((columnDef: ColDef) =>
                columnDef.pinnedRowCellRenderer &&
                columnDef.pinnedRowCellRenderer === "customPinnedRowButtonRenderer");
        columnWithPinnedButton.pinnedRowCellRendererParams.callback  = this.openTransferToOfficeModal.bind(this);
    }

    private initialiseDeleteButtonsOnGrid() {
        const deleteColDef: ColDef = this.outstandingFundsAgGridOptions
            .columnDefs
            .find((columnDef: ColDef) => columnDef.field === "deleteOutstandingFund");
        deleteColDef.cellRendererParams = {
            matIconText: "delete",
            tooltip: "Delete",
            clickCallback: (outstandingFund: any) => this.deleteOutstandingFundRecord(outstandingFund),
            isDisabled: (params: any) => this.isDeleteButtonDisabled(params)
        };
    }

    private deleteOutstandingFundRecord(outstandingFund: OutstandingFund) {
        this.deleteOutstandingFundModalService
            .openModal(outstandingFund.outstandingFundId,
                (deleteOutstandingFundResponse: boolean) => {
                    if (deleteOutstandingFundResponse) {
                        this.outstandingFundsGridDataHandler.deleteOutstandingFund(outstandingFund.outstandingFundId);
                    }
                }
            );
    }

    private isDeleteButtonDisabled(params: OutstandingFund) {
        return (params.outstandingAmount !== params.totalAmount);
    }

    private setPinnedBottomRowData() {
        const pinnedRowData: any[] = [];
        const selectedRows: any[] = this.agGrid.api.getSelectedNodes();
        if (selectedRows && selectedRows.length && selectedRows.length > 0) {
            const rowData = new OutstandingFund();
            rowData.outstandingFundId = 0;
            rowData.cfcBankAccount = selectedRows.length + " Selected";
            rowData.totalAmount = selectedRows.reduce((totalAmountSum, selectedRow) => +totalAmountSum + +selectedRow.data.totalAmount, 0);
            rowData.currencyIsoCode =
                new Set(selectedRows.map((row) => row.data.currencyIsoCode.toString())).size > 1 ? "Warning" : selectedRows[0].data.currencyIsoCode;
            pinnedRowData.push(rowData);
        }
        this.agGrid.api.setPinnedBottomRowData(pinnedRowData);
    }

    private getRowNodeId(data: OutstandingFund) {
        return data.outstandingFundId.toString();
    }

    // so we can give each row its own id for help with automation
    private getBusinessKeyForNode(node: RowNode): string {
        return (node.data as OutstandingFund).outstandingFundId.toString();
    }

    // This happens when we call setRowData. The scroll details are so we know where to scroll
    protected onRowDataChanged(event) {
        if (this.scrollToOutstandingFundId) {
            const node = event.api.getRowNode(this.scrollToOutstandingFundId.toString());
            event.api.ensureNodeVisible(node, "middle");
        }
    }

    private clearFilters() {
        if (this.agGrid && this.agGrid.api) {
            this.agGrid.api.deselectAll();
            this.agGrid.api.setFilterModel(null);
        }
    }

    private initialiseOutstandingAmountColumnClickHandling() {
        const oFundAmountColumnDef = this.outstandingFundsGridDataHandler.getOutstandingFundsGridColumns().find((column: ColDef) => {
            return column.field === "outstandingAmount";
        });
        oFundAmountColumnDef.onCellClicked = (params) => {
            this.openAddTransactionModal(params);
        };
    }

    private openAddTransactionModal(params: { api: GridApi, data: OutstandingFund }) {
        this.scrollToOutstandingFundId = null;
        const transactionModalContext: TransactionModalContext = {
            outstandingFund: params.data
        } as TransactionModalContext;
        this.outstandingFundModalService.openModal(
            transactionModalContext,
            updatedTransactionModalContext => {
                if (updatedTransactionModalContext.financialTransactionDetail) {
                    // if financialTransactionDetail is defined on the transactionModalContext
                    // it means a transaction was added.
                    this.scrollToOutstandingFundId = updatedTransactionModalContext.financialTransactionDetail.outstandingFundId;
                    this.outstandingFundsGridDataHandler
                        .setFormFilters(
                            updatedTransactionModalContext.cfcBankAccount.bankAccountName,
                            updatedTransactionModalContext.cfcBankAccount.bankAccountCurrencyName,
                            updatedTransactionModalContext.financialLedger.ledgerReference
                        );
                }
            });
    }

    private openTransferToOfficeModal(params: any): void {
        if (this.agGrid && this.agGrid.api) {
            const selectedRows = this.agGrid.api.getSelectedNodes();
            if (selectedRows && selectedRows.length >= 1) {
                const selectedOutstandingFundIds = selectedRows.map((row) => row.data.outstandingFundId);
                if (selectedOutstandingFundIds && selectedOutstandingFundIds.length >= 1) {
                    this.transferToOfficeModalService
                        .openModal(selectedOutstandingFundIds,
                            (transferToOfficeResponse: MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse) => {
                                this.outstandingFundsGridDataHandler.handleTransferToOfficeResponse(transferToOfficeResponse);
                            }
                        );
                }
            }
        }
    }

    private isRowSelectable(rowNode: RowNode): boolean {
        return rowNode.data.category === "TPA Fee" &&
            rowNode.data.outstandingAmount === 0 &&
            (rowNode.data.currencyIsoCode === "GBP" || rowNode.data.currencyIsoCode === "USD");
    }
}
