import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { DateSorterService } from "@app/services/date-sorter.service";
import { CheckDisplayComponent } from "@app/ag-grid/check-display/check-display.component";
import { CheckboxInputComponent } from "@app/ag-grid/checkbox-input/checkbox-input.component";

export const ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_COLUMNS: any[] = [
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
        field: "claimFinancialItemId",
        tooltipField: "claimFinancialItemId",
        sort: "asc",
        headerName: "CFI Id",
        width: 50,
        headerTooltip: "Claim Financial Item Id",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "accountingReferenceDateFormattedString",
        tooltipField: "aaccountingReferenceDateFormattedString",
        comparator: DateSorterService.compareDates,
        headerName: "Accounting Ref Date",
        width: 70,
        headerTooltip: "Accounting Ref Date",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "description",
        tooltipField: "description",
        headerName: "Binder Description",
        width: 180,
        headerTooltip: "Binder Description",
        filterParams: { newRowsAction: "keep" },
    },
    {
        field: "policyCurrencyIso",
        tooltipField: "policyCurrencyIso",
        headerName: "Policy Currency",
        width: 60,
        headerTooltip: "Policy Currency Iso",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "claimReference",
        tooltipField: "claimReference",
        headerName: "Claim Reference",
        width: 120,
        headerTooltip: "Claim Reference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "insuredCompanyName",
        tooltipField: "insuredCompanyName",
        headerName: "Insured",
        width: 200,
        headerTooltip: "Insured",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "lloydsRiskCode",
        tooltipField: "lloydsRiskCode",
        headerName: "LRC",
        width: 40,
        headerTooltip: "Lloyds Risk Code",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "classification",
        tooltipField: "classification",
        headerName: "Classification",
        width: 100,
        headerTooltip: "Classification",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "claimFinancialItemCurrencyIso",
        tooltipField: "claimFinancialItemCurrencyIso",
        headerName: "CFI Currency",
        width: 60,
        headerTooltip: "Claim Financial Item Currency Iso Code",
        filterParams: { newRowsAction: "keep" }
    }, 
    {
        field: "amount",
        tooltipField: "amount",
        headerName: "Amount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        width: 100,
        headerTooltip: "Amount",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "gbpAmount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        tooltipField: "gbpAmount",
        sort: "desc",
        headerName: "GBP Amount",
        width: 100,
        headerTooltip: "GBP Amount",
        filterParams: { newRowsAction: "keep" }
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


export const ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_DEFAULT_COLUMN = {
    cellClass: ["cell-text-align"],
    headerComponentFramework: GridHeaderComponent
};
