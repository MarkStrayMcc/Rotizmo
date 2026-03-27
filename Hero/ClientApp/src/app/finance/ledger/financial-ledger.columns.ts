import { DateSorterService } from "@app/services/date-sorter.service";
import { MomentDateAdapter } from "@app/providers/momentDateAdapter";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { ReverseButtonComponent } from "@app/ag-grid/reverse-button/reverse-button.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";

export const FINANCIAL_LEDGER_COLUMNS: any[] = [
    {
        field: "bankAccountName",
        tooltipField: "bankAccountName",
        headerName: "Bank Account",
        checkboxSelection: true,
        width: 160, headerTooltip: "Bank Account", pinnedRowCellRenderer: "customPinnedRowRenderer",
        lockPosition: true,
        pinnedRowCellRendererParams: { style: { color: "#01416D" } },
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "financialTransactionId",
        tooltipField: "financialTransactionId",
        sort: "asc",
        headerName: "Transaction No",
        width: 90,
        headerTooltip: "Transaction No",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "entryType",
        tooltipField: "entryType",
        headerName: "Entry Type", width: 60, headerTooltip: "Entry Type",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "transactionType",
        tooltipField: "transactionType",
        headerName: "Transaction Type", width: 90, headerTooltip: "Transaction Type",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "entryDateFormattedString",
        tooltipField: "entryDateFormattedString",
        comparator: DateSorterService.compareDates,
        headerName: "Entry Date", width: 90, headerTooltip: "Entry Date",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "ledgerReference",
        tooltipField: "ledgerReference",
        headerName: "Ledger Reference", width: 135, headerTooltip: "Ledger Rerference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "description",
        tooltipField: "description",
        headerName: "Binder Description", width: 167, headerTooltip: "Binder Description",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "transactionReference",
        tooltipField: "transactionReference",
        headerName: "Reference", width: 140, headerTooltip: "Reference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "insuredCompanyName",
        tooltipField: "insuredCompanyName",
        headerName: "Insured", width: 140, headerTooltip: "Insured",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "tags",
        tooltipField: "tags",
        headerName: "Tags", width: 50, headerTooltip: "Tags",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "bankAccountCurrencyIsoCode",
        tooltipField: "bankAccountCurrencyIsoCode",
        headerName: "Account Currency",
        width: 90,
        headerTooltip: "Account Currency",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "bankAccountAmount",
        tooltipField: "bankAccountAmount",
        headerName: "Account Amount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        width: 100,
        headerTooltip: "Account Amount",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "originalAmountCurrencyIsoCode",
        tooltipField: "originalAmountCurrencyIsoCode",
        headerName: "Original Currency",
        width: 90,
        headerTooltip: "Original Currency",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "originalAmount",
        tooltipField: "originalAmount",
        headerName: "Original Amount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        width: 100,
        headerTooltip: "Original Amount",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "lloydsRiskCode",
        tooltipField: "lloydsRiskCode",
        headerName: "LRC",
        cellClass: ["ag-center-text"],
        width: 55,
        headerTooltip: "LRC",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "paidDateFormattedString",
        tooltipField: "paidDateFormattedString",
        comparator: DateSorterService.compareDates,
        headerName: "Paid Date", width: 90, headerTooltip: "Paid Date",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "carrier",
        tooltipField: "carrier",
        headerName: "Carrier", width: 100, headerTooltip: "Carrier",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "notes",
        tooltipField: "notes",
        headerName: "Notes", width: 76, headerTooltip: "Notes",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "financialTransactionId",
        headerName: "Reverse",
        headerTooltip: "Reverse",
        cellRendererFramework: ReverseButtonComponent,
        width: 55,
        suppressMenu: true,
        suppressSorting: true
    }
];

export const FINANCIAL_LEDGER_DEFAULT_COLUMN = {
    cellClass: ["cell-text-align"],
    headerComponentFramework: GridHeaderComponent
};
