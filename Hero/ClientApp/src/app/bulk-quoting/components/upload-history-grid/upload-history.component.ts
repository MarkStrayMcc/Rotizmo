import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RunDetail } from '@app/bulk-quoting/models/run-detail';
import { BulkQuotingService } from '@app/bulk-quoting/services/bulk-quoting.service';
import { AgGridColumnDefinition } from '@app/finance/ledger/AgGridColumnDefinition';
import { IDatasource, IGetRowsParams, GridApi, GridOptions } from 'ag-grid';
import * as moment from 'moment';
import { RouterLinkRendererComponent, IRouterLinkRendererComponentOptions } from './router-link-renderer.component';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const BULK_UPLOAD_COLUMNS: any[] = [
  {
    field: "fileName",
    cellRendererFramework: RouterLinkRendererComponent,
    cellRendererParams: {
      routerLinkRendererComponentOptions: (param): IRouterLinkRendererComponentOptions => {
        if (param.data) {
          return {
            routerLinkParams: ['/bulk-quoting/run/', param.data.id],
            linkDescription: param.data.fileName
          };
        } else {
          return {
            textOnly: '-'
          };
        }
      }
    },
    tooltipField: "File Name",
    headerName: "File Name",
    width: 130,
    headerTooltip: "File Name",
    checkboxSelection: false,
    lockPosition: true
  },

  {
    field: "dateCreated",
    tooltipField: "Upload Date",
    headerName: "Upload Date",
    width: 50,
    headerTooltip: "Upload Date",
    checkboxSelection: false,
    valueFormatter: function (params) {
      return moment(params.value).format('DD MMM, YYYY')
    },
    lockPosition: true
  },

  {
    field: "brokerGroupName",
    tooltipField: "Broker",
    headerName: "Broker",
    width: 80,
    headerTooltip: "Broker",
    checkboxSelection: false,
    lockPosition: true
  },

  {
    field: "underwriter",
    tooltipField: "Uploaded By",
    headerName: "Uploaded By",
    width: 70,
    headerTooltip: "Uploaded By",
    checkboxSelection: false,
    lockPosition: true
  },

  {
    field: "displayStatus",
    tooltipField: "Status",
    headerName: "Status",
    width: 80,
    headerTooltip: "Status",
    checkboxSelection: false,
    lockPosition: true
  },
];

@Component({
  selector: 'upload-history',
  templateUrl: './upload-history.component.html',
  styleUrls: ['./upload-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UploadHistoryComponent implements OnInit, OnDestroy {
    private readonly _destroyed$ = new Subject<void>();

    gridOptions: GridOptions = {
      pagination: true,
      rowModelType: 'infinite',
      cacheBlockSize: 20,
      paginationPageSize: 20,
      suppressHorizontalScroll: true
    };

    public columnDefs: AgGridColumnDefinition[];
    gridApi: GridApi;

    runsInProgress: boolean;

    dataSource: IDatasource = {
      getRows: (params: IGetRowsParams) => {

          const startRow = params.startRow + 1;
          const pageNumber = Math.ceil(startRow / this.gridOptions.paginationPageSize);

          this.bulkQuotingService.getUploadHistory(pageNumber, this.gridOptions.paginationPageSize)
              .subscribe(response => {
                  const pageCount = JSON.parse(response.headers.get('x-pagination'));
                  const runs: RunDetail[] = response.body.results;
                  this.setDisplayStatuses(runs);

                  if (runs.some(this.isRunInProgress)) {
                    this.runsInProgress = true;
                  } else {
                    this.runsInProgress = false;
                  }

                  params.successCallback(runs, pageCount.totalCount
                 );
              });
       }
    };

    constructor(private bulkQuotingService: BulkQuotingService) { }

    ngOnInit() {
        this.columnDefs = BULK_UPLOAD_COLUMNS
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        this.refreshGrid();

        interval(1000 * 30)
            .pipe(takeUntil(this._destroyed$))
            .subscribe(() => {
              if (this.runsInProgress) {
                this.gridApi.purgeInfiniteCache();
              }
            });
    }

    refreshGrid() {
        this.gridApi.setDatasource(this.dataSource);
    }

    isRunInProgress(run: RunDetail) {
      // This is to prevent old runs which are "stuck" in progress from being counted as in progress
      return run.status === "inProgress" && moment(run.dateCreated).isAfter(moment().add(-5, "days"));
    }

    setDisplayStatuses(runs: RunDetail[]) {
        runs.forEach(run => {
            run.displayStatus = run.status.charAt(0).toUpperCase() + run.status.slice(1);
            const totalRisks = run.risks.length;
            const erroredRisks = run.risks.filter(risk => risk.riskStatus === "error").length;
            const completedRisks = run.risks.filter(risk => risk.riskStatus === "quotesComplete").length;
            if (run.status === "inProgress") {
                run.displayStatus = `In Progress (${erroredRisks + completedRisks}/${totalRisks})`;
            }
            if (run.status === "completed") {
                run.displayStatus = "Completed" +
                (erroredRisks ? ` (${erroredRisks} error` + (erroredRisks === 1 ? "" : "s") + ")" : "");
            }
        });
    }
}
