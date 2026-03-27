import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { DateSorterService } from "@app/services/date-sorter.service";
import { CheckDisplayComponent } from "@app/ag-grid/check-display/check-display.component";
import { CheckboxInputComponent } from "@app/ag-grid/checkbox-input/checkbox-input.component";

export const ECF_RECONCILIATION_FINANCIAL_TRANS_COLUMNS: any[] = [
    {
        field: "shouldBeReconciled",
        cellRendererFramework: CheckboxInputComponent,
        tooltipField: "shouldBeReconciled",
        sort: "desc",
        headerName: "Reconcile?",
        CheckboxInputComponent,
        width: 150,
        headerTooltip: "Should be reconciled?",
        filterParams: { newRowsAction: "keep" },
        pinnedRowCellRenderer: "customPinnedRowRenderer",
        pinnedRowCellRendererParams: { style: { color: "#01416D" } },
    },
    {
        field: "financialTransactionId",
        tooltipField: "financialTransactionId",
        sort: "asc",
        headerName: "Trans No",
        width: 90,
        headerTooltip: "Transaction No",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "entryDateFormattedString",
        tooltipField: "entryDateFormattedString",
        comparator: DateSorterService.compareDates,
        headerName: "Entry Date",
        width: 90,
        headerTooltip: "Entry Date",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "ledgerReference",
        tooltipField: "ledgerReference",
        headerName: "Ledger Reference",
        width: 120,
        headerTooltip: "Ledger Reference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "binderDescription",
        tooltipField: "description",
        headerName: "Binder Description",
        width: 169,
        headerTooltip: "Binder Description",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "transactionReference",
        tooltipField: "transactionReference",
        headerName: "Reference",
        width: 140,
        headerTooltip: "Reference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "insuredCompanyName",
        tooltipField: "insuredCompanyName",
        headerName: "Insured",
        width: 154,
        headerTooltip: "Insured",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "tags",
        tooltipField: "tags",
        headerName: "Tags",
        width: 95,
        headerTooltip: "Tags",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "bankAccountCurrencyName",
        tooltipField: "bankAccountCurrencyName",
        headerName: "Currency",
        width: 74,
        headerTooltip: "bankAccountCurrencyName",
        filterParams: { newRowsAction: "keep" }
    }, {
        field: "bankAccountAmount",
        tooltipField: "bankAccountAmount",
        headerName: "Account Amount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        width: 100,
        headerTooltip: "Amount",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "paidDateFormattedString",
        tooltipField: "paidDateFormattedString",
        comparator: DateSorterService.compareDates,
        headerName: "Paid Date",
        width: 90,
        headerTooltip: "Paid Date",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "reverseFinancialTransactionId",
        headerName: "Is Reversed",
        cellRendererFramework: CheckDisplayComponent,
        headerTooltip: "Is Reversed",
        width: 80,
        cellStyle: { "text-align": "center" },
        suppressMenu: true,
        suppressSorting: true
    },
    {
        field: "isReconciled",
        cellRendererFramework: CheckDisplayComponent,
        tooltipField: "ecfReconciliationId",
        sort: "desc",
        headerName: "Reconciled",
        CheckDisplayComponent,
        width: 100,
        cellStyle: { "text-align": "center" },
        headerTooltip: "Is Reconciled",
        filterParams: { newRowsAction: "keep" }
    }
];


export const ECF_RECONCILIATION_FINANCIAL_TRANS_DEFAULT_COLUMN = {
    cellClass: ["cell-text-align"],
    headerComponentFramework: GridHeaderComponent
};
