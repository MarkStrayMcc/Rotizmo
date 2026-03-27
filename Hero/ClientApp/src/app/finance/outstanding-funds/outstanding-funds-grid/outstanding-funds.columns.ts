import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { ColDef } from "ag-grid";
import { OFundLinkedFinanceNumberDisplay } from "@app/ag-grid/ofund-linked-finance-number-display/ofund-linked-finance-number-display";
import { MatIconGridButtonComponent } from "@app/ag-grid/mat-icon-grid-button/mat-icon-grid-button.component";

export const OUTSTANDING_FUNDS_COLUMNS: any[] = [
    {
        field: "cfcBankAccount",
        tooltipField: "Bank Account",
        headerName: "Bank Account",
        width: 200,
        headerTooltip: "Bank Account",
        filterParams: { newRowsAction: "keep" },
        checkboxSelection: true,
        pinnedRowCellRenderer: "customPinnedRowRenderer",
        pinnedRowCellRendererParams: { style: { color: "#01416D", "font-weight": "bold" } }
    } as ColDef,
    {
        field: "transactionType",
        tooltipField: "Type",
        headerName: "Type",
        width: 215,
        headerTooltip: "Type",
        filterParams: { newRowsAction: "keep" },
        pinnedRowCellRenderer: "customPinnedRowButtonRenderer",
        pinnedRowCellRendererParams: {
            value: "Transfer to Office",
            classValue: "btn btn-primary pull-left"
        },
    },
    {
        field: "category",
        tooltipField: "Is TPA fee?",
        headerName: "Is TPA fee?",
        width: 100,
        headerTooltip: "Is TPA fee?",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "ledgerReference",
        tooltipField: "Ledger Reference",
        headerName: "Ledger Reference",
        width: 180,
        headerTooltip: "Ledger Reference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "binderDescription",
        tooltipField: "Binder Description",
        headerName: "Binder Description",
        width: 220,
        headerTooltip: "Binder Description",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "transactionReference",
        tooltipField: "Transaction Reference",
        headerName: "Reference",
        width: 180,
        headerTooltip: "Transaction Reference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "tags",
        tooltipField: "Tags",
        headerName: "Tags",
        width: 100,
        headerTooltip: "Tags",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "currencyIsoCode",
        tooltipField: "Currency ISO code of the fund",
        headerName: "Currency",
        width: 100,
        headerTooltip: "Outstanding Fund Currency",
        filterParams: { newRowsAction: "keep" },
        pinnedRowCellRenderer(params) {
            if (params.data.currencyIsoCode === "Warning") {
                return "<i class='material-icons' style='color: orange' title='Multiple Currencies Selected'>warning</i>";
            } else {
                return params.data.currencyIsoCode;
            }
        },
    },
    {
        field: "totalAmount",
        tooltipField: "100% Amount",
        headerName: "100% Amount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        cellRendererParams: { redNegatives: false },
        width: 150,
        headerTooltip: "Opening Balance",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "outstandingAmount",
        tooltipField: "Outstanding Amount",
        headerName: "Outstanding Amount",
        cellRendererFramework: OFundLinkedFinanceNumberDisplay,
        width: 150,
        headerTooltip: "Outstanding Amount",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" },
    },
    {
       field: "deleteOutstandingFund",
       tooltipField: "Delete Outstanding Fund",
       headerName: "Delete",
       cellRendererFramework: MatIconGridButtonComponent,
       width: 55,
       headerTooltip: "Delete Outstanding Fund",
       suppressMenu: true,
       suppressSorting: true
    }
];

export const OUTSTANDING_FUNDS_DEFAULT_COLUMN = {
    cellClass: ["cell-text-align"],
    headerComponentFramework: GridHeaderComponent
} as ColDef;
