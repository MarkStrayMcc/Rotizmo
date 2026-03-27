import { GridApi } from "ag-grid";
import { AgGridNg2 } from "ag-grid-angular";
import { Subject } from "rxjs";
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { AgGridColumnDefinition } from "@app/finance/ledger/AgGridColumnDefinition";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { LossFundSummaryHttpService } from "@app/services/loss-fund-summary-http.service";
import { FinanceLossFundSummary } from "@app/models";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "loss-fund-summary",
    templateUrl: "./loss-fund-summary.component.html",
    styleUrls: ["./loss-fund-summary.component.scss"],
    encapsulation: ViewEncapsulation.None
})

export class LossFundSummaryComponent implements OnInit, OnDestroy {

    public lossFundSummaryGridColumns: AgGridColumnDefinition[];
    public defaultColumnDef;
    private ngUnsubscribe: Subject<any> = new Subject();

    @ViewChild("agGrid")
    public agGrid: AgGridNg2;

    /**
     *
     * @param lossFundSummaryService
     * @param appCommunicationService
     */
    constructor(
        private lossFundSummaryService: LossFundSummaryHttpService,
        private appCommunicationService: AppCommunicationService,
        private titleService: Title
    ) {
        /**
         * This bit is necessary only to make sure that the tests work correctly
         * As there is currently no sensible way to let angular testbed know that
         * the component relies on a singleton service instance without declaring
         * the service as a provider.
         */
        if (!this.appCommunicationService) {
            this.appCommunicationService = new AppCommunicationService();
        }
        this.appCommunicationService.addClass("wide");
        this.lossFundSummaryGridColumns = this.lossFundSummaryService.getColumns();
        this.defaultColumnDef = this.lossFundSummaryService.getDefaultColumn();
    }

    public ngOnInit() {
        // this initialisation is required to not display Loading... in the AgGrid.
        this.updateLossFundSummaries();
        // set the title to Payment Requests
        this.titleService.setTitle("Loss Fund Summaries");
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.appCommunicationService.removeClass();
    }

    private updateLossFundSummaries() {
        this.lossFundSummaryService.getLossFundSummaries()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(t => {
                this.refreshGridWithPaymentRequests(t);
            }, error => {
                this.clearGridData(this.getAgGridApi(""));
            });
    }

    private refreshGridWithPaymentRequests(lossFundSummaries: FinanceLossFundSummary[]) {
        if (lossFundSummaries) {
            const gridApi = this.getAgGridApi("");
            if (gridApi) {
                gridApi.setRowData(lossFundSummaries);
            }
        }
    }

    private clearGridData(gridApi: GridApi) {
        if (gridApi) {
            gridApi.setRowData([]);
        }
    }

   public getAgGridApi(event: any): GridApi {
        if (event && event.hasOwnProperty("api")) {
            return event.api;
        }
        if (this.agGrid && this.agGrid.hasOwnProperty("api")) {
            return this.agGrid.api;
        }
        return undefined;
    }

    public clearFilters() {
        this.agGrid.api.setFilterModel(null);
        this.agGrid.api.onFilterChanged();
    }
}
