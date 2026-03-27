import { DateSorterService } from "@app/services/date-sorter.service";
import { MomentDateAdapter } from "@app/providers/momentDateAdapter";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";

export const PAYMENT_REQUESTS_COLUMNS: any[] = [
    {
        field: "accountingReferenceDateFormattedString",
        tooltipField: "accountingReferenceDateFormattedString",
        headerName: "Date",
        comparator: DateSorterService.compareDates,
        width: 140,
        headerTooltip: "Accounting Reference Date",
        checkboxSelection: true,
        lockPosition: true,
        sort: "desc",
        pinnedRowCellRenderer: "customPinnedRowRenderer",
        pinnedRowCellRendererParams: { style: { color: "#01416D" } },
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "binderSection.binderDescription",
        tooltipField: "binderSection.binderDescription",
        headerName: "Binder",
        width: 180,
        headerTooltip: "Binder Description",
        pinnedRowCellRenderer: "customPinnedRowButtonRenderer",
        pinnedRowCellRendererParams: {
            value: "Bulk Update",
            classValue: "btn btn-primary"
        },
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "binderSection.binderSectionDescription",
        valueFormatter: function(params) {
          let sectionDescription = "";
          if (params && params.data && params.data.binderSection) {
            if (params.data.binderSection.shortCode != null) {
                sectionDescription = params.data.binderSection.shortCode + " - ";
            }
            if (params.data.binderSection.binderSectionDescription) {
                sectionDescription += params.data.binderSection.binderSectionDescription;
            }
          }
          return sectionDescription;
        },
        tooltipField: "binderSection.binderSectionDescription",
        headerName: "Binder Section",
        width: 180,
        headerTooltip: "Binder Section Description",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "binderSection.binderYearNo",
        tooltipField: "binderSection.binderYearNo",
        headerName: "Year",
        width: 60,
        headerTooltip: "Binder Year",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "lloydsRiskCode",
        tooltipField: "lloydsRiskCode",
        headerName: "Lloyd's RiskCode",
        width: 90,
        headerTooltip: "Lloyd's Risk Code",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "payeeName",
        tooltipField: "payeeName",
        headerName: "Payee",
        width: 200,
        headerTooltip: "Insured Payee",
        cellRenderer: function (params) {
            return params.value;
            // ***** TODO: Sanctions Checking on Claims/Finance Feature is not currently active. This will not be active until the sanctions check      *****
            // ***** refactoring. Once this refactor has been completed the below code block should be uncommented and the 'return params.value'  *****
            // ***** line above should be removed                                                                                                 *****
            /*if (params.value == null) {
                return params.value;
            } else if (params.data.sanctionsMatch == null){
                return "<i class='material-icons' style='color: orange' title='Could Not Perform Sanctions Check'>warning</i>"
                    + "<b style='color:orange'>" + params.value + '<b>';
            }
            if (params.data.sanctionsMatch) {
                return "<i class='material-icons' style='color: red' title='Payee Sanctions Check Failed'>warning</i>"
                    +"<b style='color:red'>" + params.value + '<b>';
            } else {
                return params.value;
            } */
        },
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "client.companyName",
        tooltipField: "client.companyName",
        headerName: "Insured",
        width: 200,
        headerTooltip: "Insured Company",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "client.primaryLocation.stateProvinceCode",
        tooltipField: "client.primaryLocation.stateProvinceCode",
        headerName: "Province State",
        width: 80,
        headerTooltip: "Province/State",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "claimReference",
        tooltipField: "claimReference",
        headerName: "Claim Reference",
        width: 150,
        headerTooltip: "ClaimReference",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "currency.isoCode",
        tooltipField: "currency.isoCode",
        headerName: "CCY",
        width: 50,
        headerTooltip: "Currency",
        pinnedRowCellRenderer: function (params) {
            if (params.data["currency.isoCode"] === "Warning") {
                return "<i class='material-icons' style='color: orange' title='Multiple Currencies Selected'>warning</i>";
            } else {
                return params.data["currency.isoCode"];
            }
        },
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "amount",
        tooltipField: "amount",
        headerName: "Amount",
        cellRendererFramework: FinanceNumberDisplayComponent,
        width: 90,
        headerTooltip: "Amount",
        filter: "agNumberColumnFilter",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "classification.name",
        tooltipField: "classification.name",
        headerName: "Payment Type",
        width: 154,
        headerTooltip: "Payment Type",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "paymentType",
        tooltipField: "paymentType",
        headerName: "Pay From",
        width: 70,
        headerTooltip: "From Cash Call or Loss Fund",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "itemStatusId",
        valueFormatter: (params) => {
            return params.data.itemStatusName;
        },
        cellClass: ["cell-text-align","link-cell"],
        valueGetter: (params) => {
            return params.data.itemStatusId;
        },
        suppressMenu: true,
        suppressSorting: false,
        tooltipField: "itemStatusName",
        headerName: "Status",
        width: 134,
        headerTooltip: "Payment Request Status",
        filterParams: { newRowsAction: "keep" }
    },
    {
        field: "ledgerReference",
        suppressMenu: true,
        suppressSorting: false,
        tooltipField: "ledgerReference",
        headerName: "Ledger Reference",
        width: 125,
        headerTooltip: "Ledger Reference",
        filterParams: { newRowsAction: "keep" }
    }
];

export const PAYMENT_REQUESTS_DEFAULT_COLUMN = {
    cellClass: ["cell-text-align"],
    headerComponentFramework: GridHeaderComponent
};
