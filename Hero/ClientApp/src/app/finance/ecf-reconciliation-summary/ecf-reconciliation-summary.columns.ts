import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { CheckDisplayComponent } from "@app/ag-grid/check-display/check-display.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";

export const ECF_RECONCILIATION_SUMMARY_COLUMNS: any[] = [
    {
        field: "ucr",
        tooltipField: "UCR",
        headerName: "UCR",
        width: 200,
        headerTooltip: "UCR",
        checkboxSelection: true,
        lockPosition: true,
        pinnedRowCellRenderer: "customPinnedRowRenderer",
        pinnedRowCellRendererParams: { style: { color: "#01416D" } },
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "currency.isoCode",
        tooltipField: "Currency IsoCode",
        headerName: "Currency",
        width: 100,
        headerTooltip: "Currency",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "sequenceTag",
        tooltipField: "sequenceTag",
        headerName: "Sequence No",
        width: 120,
        headerTooltip: "Sequence No",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "completedDateFormattedString",
        tooltipField: "completedDateFormattedString",
        headerName: "Completed Date",
        width: 150,
        headerTooltip: "Completed Date",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "ecfAmount",
        tooltipField: "ecfAmount",
        headerName: "ECF Amount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        cellRendererParams: { redNegatives: true },
        width: 170,
        headerTooltip: "ECF Amount",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "financialTransactionsDifference",
        tooltipField: "financialTransactionsDifference",
        headerName: "FT Diff +/-",
        cellClass: ["link-cell-diff"],
        cellRendererFramework: FinanceNumberDisplayComponent,
        cellRendererParams: { redNegatives: true },
        width: 170,
        headerTooltip: "Diff between ECF and Financial Transactions",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "claimFinancialItemsDifference",
        tooltipField: "claimFinancialItemsDifference",
        headerName: "CFI Diff +/-",
        cellClass: ["link-cell-diff"],
        cellRendererFramework: FinanceNumberDisplayComponent,
        cellRendererParams: { redNegatives: true },
        width: 170,
        headerTooltip: "Diff between ECF and Claim Financial Items",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "reconciledGroupId",
        tooltipField: "Reconciled",
        headerName: "Reconciled",
        cellRendererFramework: CheckDisplayComponent,
        width: 120,
        headerTooltip: "Reconciled",
        suppressMenu: true,
    },
    {
        field: "reconciledGroupId",
        tooltipField: "Reconciled Group",
        headerName: "Reconciled Group",
        width: 120,
        headerTooltip: "Reconciled Group",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "ecfReconciliationId",
        valueFormatter: params => {
            return params.data.ecfReconciliationId ? "Edit" : null;
        },
        cellClass: ["link-cell", "link-cell-actions"],
        suppressMenu: true,
        suppressSorting: true,
        suppressSizeToFit: true,
        tooltipField: "Edit ECF reconciliation",
        headerName: "Actions",
        width: 90,
        headerTooltip: "Actions",
        filterParams: { newRowsAction: "keep" }
    }
];

export const ECF_RECONCILIATION_SUMMARY_DEFAULT_COLUMN = {
    cellClass: ["cell-text-align"],
    headerComponentFramework: GridHeaderComponent
};
