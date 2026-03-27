import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BulkQuotingService } from '@app/bulk-quoting/services/bulk-quoting.service';
import { RunDetail } from '@app/bulk-quoting/models/run-detail';
import { AgGridColumnDefinition } from '@app/finance/ledger/AgGridColumnDefinition';
import { GridApi, IDatasource, IGetRowsParams, GridOptions } from 'ag-grid';

const RUN_DETAIL_COLUMNS: any[] = [

    {
        field: "company.name",
        tooltipField: "Company Name",
        headerName: "Company Name",
        width: 50,
        headerTooltip: "Company Name",
        lockPosition: true
    },
    {
        field: "externalReference",
        tooltipField: "Broker Reference",
        headerName: "Broker Reference",
        width: 50,
        headerTooltip: "Reference",
        lockPosition: true
    },
    {
        field: "brokerEmail",
        tooltipField: "Broker Email",
        headerName: "Broker Email",
        width: 50,
        headerTooltip: "Broker Email",
        lockPosition: true
    },
    {
        field: "displayStatus",
        tooltipField: "Status",
        headerName: "Status",
        width: 50,
        headerTooltip: "Status",
        lockPosition: true
    },
    {
        field: "emailStatus",
        tooltipField: "Email Status",
        headerName: "Email Status",
        width: 50,
        headerTooltip: "Email Status",
        lockPosition: true
    }
]

@Component({
    selector: 'app-run-details',
    templateUrl: './run-details.component.html',
    styleUrls: ['./run-details.component.scss']
})
export class RunDetailsComponent implements OnInit {

    private runId: number;
    runDetail: RunDetail;
    columnDefs: AgGridColumnDefinition[];
    gridApi: GridApi;

    gridOptions: GridOptions = {
        pagination: true,
        rowModelType: 'infinite',
        cacheBlockSize: 20,
        paginationPageSize: 20,
        suppressHorizontalScroll: true
    };

    dataSource: IDatasource = {
        getRows: (params: IGetRowsParams) => {

        if (this.runDetail) {
            this.setDisplayStatuses(this.runDetail);
            this.setPageData(params);
        }

        if (!this.runDetail) {
            this.bulkQuotingService.getRunDetails(this.runId)
              .subscribe((res: RunDetail) => {
                  this.setDisplayStatuses(res);
                  this.runDetail = res;
                  this.setPageData(params);
              });
        }
      }
    };

    constructor(private route: ActivatedRoute, private bulkQuotingService: BulkQuotingService) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.runId = +params.get('id');
        });

        this.columnDefs = RUN_DETAIL_COLUMNS;
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        this.refreshGrid();
    }

    refreshGrid() {
        this.gridApi.setDatasource(this.dataSource);
    }

    private setPageData(params: IGetRowsParams) {
        const rowsThisPage = this.runDetail.risks.slice(params.startRow, params.endRow);
        params.successCallback(rowsThisPage, this.runDetail.risks.length);
    }

    setDisplayStatuses(run: RunDetail) {
        run.displayStatus = run.status === 'inProgress' ? 'In Progress' : run.status.charAt(0).toUpperCase() + run.status.slice(1);

        run.risks.forEach(risk => {
            risk.displayStatus = risk.riskStatus.charAt(0).toUpperCase() + risk.riskStatus.slice(1);
            risk.emailStatus = risk.emailStatus.charAt(0).toUpperCase() + risk.emailStatus.slice(1);
            if (risk.riskStatus === 'inProgress') {
                risk.displayStatus = 'In Progress';
            }
            if (risk.riskStatus === 'quotesComplete') {
                risk.displayStatus = 'Completed';
            }
            if (risk.emailStatus === 'NotSent') {
                risk.emailStatus = 'Not Sent';
            }
            if (risk.emailStatus === 'FailedToSend') {
                risk.emailStatus = 'Failed To Send';
            }
        });
    }

    getReportUrl() {
        if (this.runDetail) {
            return this.bulkQuotingService.reportUrl(this.runDetail.id);
        }
    }
}
