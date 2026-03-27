import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { LossFundNumberDisplayComponent } from "@app/ag-grid/loss-fund-number-display/loss-fund-number-display.component";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";

export const LOSS_FUND_SUMMARY_COLUMNS: any[] = [
    {
        field: "lossFundCurrencyIsoCode",
        tooltipField: "lossFundCurrencyIsoCode",
        headerName: "Currency",
        width: 100,
        headerTooltip: "Loss Fund Currency",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "binderDescription",
        tooltipField: "binderDescription",
        headerName: "Binder",
        width: 220,
        headerTooltip: "Binder Description",
        filterParams: { newRowsAction: "keep" }
    },
    {
        valueGetter(params) {
            let sectionDescription = "";
            if (params.data.sectionShortCode != null) {
                sectionDescription = params.data.sectionShortCode + " - ";
            }
            if (params.data.sectionDescription) {
                sectionDescription += params.data.sectionDescription;
            }
            return sectionDescription;
        },
        tooltipField: "sectionDescription",
        headerName: "Section Description",
        width: 260,
        headerTooltip: "Binder Section Description",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "binderYearNo",
        tooltipField: "binderYearNo",
        headerName: "Year",
        width: 100,
        headerTooltip: "Binder Year",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "lloydsRiskCode",
        tooltipField: "lloydsRiskCode",
        headerName: "Lloyd's Risk Code",
        width: 150,
        headerTooltip: "Lloyd's Risk Code",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "ledgerReference",
        tooltipField: "ledgerReference",
        headerName: "Ledger",
        width: 180,
        headerTooltip: "Ledger Reference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "openingBalance",
        tooltipField: "openingBalance",
        headerName: "Opening Balance",
        cellRendererFramework: FinanceNumberDisplayComponent,
        cellRendererParams: {redNegatives : false},
        width: 170,
        headerTooltip: "Opening Balance",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "currentBalance",
        tooltipField: "currentBalance",
        headerName: "Current Balance",
        cellRendererFramework: LossFundNumberDisplayComponent,
        width: 170,
        headerTooltip: "Current Balance",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" },
    },
    {
        field: "numberOfPaymentRequests",
        tooltipField: "numberOfPaymentRequests",
        headerName: "Pending Payments",
        headerTooltip: "Number of Pending Approval Payments",
        cellStyle: { "text-align": "right" },
        width: 180,
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "sumPaymentRequests",
        tooltipField: "sumPaymentRequests",
        headerName: "Pending Balance",
        headerTooltip: "Number of Pending Approval Payments",
        cellRendererFramework: FinanceNumberDisplayComponent,
        cellRendererParams: { redNegatives: false },
        width: 150,
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        valueGetter(params) {
            return params.data.currentBalance - params.data.sumPaymentRequests;
        },
        headerName: "Available Balance",
        headerTooltip: "Available Balance after Pending Approval Payment Requests",
        width: 170,
        cellRendererFramework: FinanceNumberDisplayComponent,
        cellRendererParams: { redNegatives: false },
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    }
];

export const LOSS_FUND_SUMMARY_DEFAULT_COLUMN = {
    cellClass: ["cell-text-align"],
    headerComponentFramework: GridHeaderComponent
};
