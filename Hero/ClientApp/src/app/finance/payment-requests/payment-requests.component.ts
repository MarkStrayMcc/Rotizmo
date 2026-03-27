import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { CustomPinnedRowButtonRenderer } from "@app/finance/payment-requests/custom-pinned-row-button-renderer.component";
import { AgGridColumnDefinition } from "@app/finance/ledger/AgGridColumnDefinition";

import { PaymentRequest, FinancialLedgerInfo } from "@app/models";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { PaymentRequestsHttpService } from "@app/services/payment-requests-http.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { GridApi, RowNode, } from "ag-grid";
import { AgGridNg2 } from "ag-grid-angular";
import * as moment from "moment";
import { Observable, Subject, Subscription} from "rxjs";
import { FinancialItemStatus } from "@app/enums/FinancialItemStatus";
import { BaseGridFilterInputComponent } from "@app/ag-grid/base-grid-filter-input/base-grid-filter-input.component";
import { ChangeStatusModalComponent } from "@app/finance/change-status-modal/change-status-modal.component";
import { BulkChangeStatusModalComponent } from "@app/finance/bulk-change-status-modal/bulk-change-status-modal.component";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { takeUntil } from "rxjs/operators";
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";

@Component({
    selector: "payment-requests",
    templateUrl: "./payment-requests.component.html",
    styleUrls: ["./payment-requests.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class PaymentRequestsComponent implements OnInit, OnDestroy {
    public paymentRequestsForm: FormGroup;
    private ngUnsubscribe: Subject<any> = new Subject();
    private currentSubscription: Subscription;
    public displayErrorMessage = false;

    public paymentRequests: PaymentRequest[];
    public paymentRequestsGridColumns: AgGridColumnDefinition[];
    public defaultColumnDef;
    public className: string;
    public statusOptions: Array<{ text: string, value: number }>;
    private showPaidRequestsOnly: boolean;

    public pinnedBottomRowData;
    public ledgerReferences: Observable<FinancialLedgerInfo[]>;

    public context;
    private numberOfSelectedRows = 0;

    @ViewChild("agGrid")
    public agGrid: AgGridNg2;

    @ViewChild("ledgerRefInput")
    public ledgerRefInput: BaseGridFilterInputComponent;
    @ViewChild("statusInput")
    public statusInput: BaseGridFilterInputComponent;
    private gridApi;

    public frameworkComponents: {
        customPinnedRowRenderer: typeof CustomPinnedRowRenderer;
        customPinnedRowButtonRenderer: typeof CustomPinnedRowButtonRenderer;
    };
    public getRowStyle: (params: any) => { "font-weight": string; } | { "font-weight"?: undefined; };

    // Set this to something if you want the grid to scroll to it when adding it to the grid
    public scrollToDetails = null;
    private defaultFilter: any = {
        ["classification.name"]: {
            type: "notContains",
            filter: "TPA Fee"
        }
    };

    /**
     *
     * @param paymentRequestsService
     * @param appCommunicationService
     */
    constructor(
        private paymentRequestsService: PaymentRequestsHttpService,
        private modalDialogService: ModalDialogService,
        private appCommunicationService: AppCommunicationService,
        private binderSectionParticipationLookupService: BinderSectionParticipationLookupService,
        private titleService: Title,
        private errorMessageHandler: ErrorMessageHandlerService
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

        this.showPaidRequestsOnly = false;
    }

    public methodOnCustomPinnedRowButtonContainer(params: any): void {
        if (this.numberOfSelectedRows > 1) {
            this.openBulkChangeStatusDialog(this, params);
        } else {
            this.openSingleChangeStatusDialog(this, { api: this.agGrid.api, data: this.agGrid.api.getSelectedRows()[0] });
        }
    }

    public ngOnInit() {
        // this initialisation is required to not display Loading... in the AgGrid.
      this.paymentRequestsGridColumns = this.paymentRequestsService.getColumns();
      const statusIdColumnDef = this.paymentRequestsGridColumns.find((column: AgGridColumnDefinition) => {
            return column.field === "itemStatusId";
        });
      statusIdColumnDef.onCellClicked = (params) => {
            this.openSingleChangeStatusDialog(this, params);
        };

      this.defaultColumnDef = this.paymentRequestsService.getDefaultColumn();

      this.context = { componentParent: this };

        this.statusOptions = [
            {
                text: FinancialItemStatus[FinancialItemStatus.Requested],
                value: FinancialItemStatus.Requested
            },
            {
                text: "Pending Approval",
                value: FinancialItemStatus.PendingApproval
            },
            {
                text: FinancialItemStatus[FinancialItemStatus.Paid],
                value: FinancialItemStatus.Paid
            },
            {
                text: "Fully Received",
                value: FinancialItemStatus.Received
            },
            {
                text: "Part Received",
                value: FinancialItemStatus.PartReceived
            },
            {
                text: "Sanctions - Referral",
                value: FinancialItemStatus.SanctionsReferral
            }
        ];

        this.getRowStyle = params => {
            if (params.node.rowPinned) {
                return { "font-weight": "bold" };
            }
            return {};
        };

      this.updatePaymentRequests();
      this.setPinnedBottomRowData("");
      this.frameworkComponents = {
            customPinnedRowRenderer: CustomPinnedRowRenderer,
            customPinnedRowButtonRenderer: CustomPinnedRowButtonRenderer,
        };
        // set the title to Payment Requests
      this.titleService.setTitle("Payment Requests");

        // load all carriers to cache
      this.binderSectionParticipationLookupService.getData();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.appCommunicationService.removeClass();
    }

    public onSelectedStatusChange(event: { target: { value: any } }) {
        const selectedFinancialItemStatus = parseInt(event.target.value);
        if (selectedFinancialItemStatus === FinancialItemStatus.Paid && this.showPaidRequestsOnly === false) {
            this.showPaidRequestsOnly = true;
            this.updatePaymentRequests();
        } else if (selectedFinancialItemStatus !== FinancialItemStatus.Paid && this.showPaidRequestsOnly) {
            this.showPaidRequestsOnly = false;
            this.updatePaymentRequests();
        }
    }

    public openSingleChangeStatusDialog(self: PaymentRequestsComponent, params: { api: GridApi, data: PaymentRequest }): void {
        if (params.data.itemStatusId !== FinancialItemStatus.Paid) {
            self.modalDialogService
                .openDialog<ChangeStatusModalComponent, PaymentRequest>(
                    ChangeStatusModalComponent, // componentOrTemplateRef
                    ModalConfig.changeStatusModal.matDialogConfig, // config
                    (bindObject: ChangeStatusModalComponent) => {
                        // set the pending payment info for the modal
                        bindObject.pendingPaymentRequest = params.data;
                    },
                    pendingPaymentRequest => {
                        if (pendingPaymentRequest) {
                            this.updatePaymentRequests();
                        }
                    });
        }
    }

    public getRowNodeId(data: PaymentRequest) {
        return data.claimFinancialItemId.toString();
    }

    // so we can give each row its own id for help with automation
    public getBusinessKeyForNode(node: RowNode) {
        return (node.data as PaymentRequest).claimFinancialItemId;
    }

    // This happens when we call setRowData. The scroll details are so we know where to scroll
    public onRowDataChanged(event, scrollDetails: PaymentRequest) {
        if (this.gridApi) {
            this.gridApi.setPinnedBottomRowData([]);
        }

        if (scrollDetails) {
            const node = event.api.getRowNode(scrollDetails.claimFinancialItemId.toString());
            event.api.ensureNodeVisible(node, "middle");
        }
    }

    private updatePaymentRequests() {
        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }

        if (this.showPaidRequestsOnly) {
            this.getPaidPaymentRequests();
        } else {
            this.getPendingPaymentRequests();
        }
    }

    private getSelectedInputFilters() {
        return {
            itemStatusId: this.statusInput.filterInstance.getModel(),
            ledgerReference: this.ledgerRefInput.filterInstance.getModel()
        };
    }

    private setDefaultFilter() {
        this.gridApi.setFilterModel(this.defaultFilter);
    }

    private getPendingPaymentRequests() {
        this.displayErrorMessage = false;
        this.currentSubscription = this.paymentRequestsService.getPendingPaymentRequests()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(t => {
                this.refreshGridWithPaymentRequests(t);
            }, error => {
                const errorMessage = `Unable to fetch payment requests! ${error.message}`;
                this.handleError(errorMessage);
            });
     }

    private handleError(errorMessage: string) {
        this.clearGridData(this.gridApi);
        this.displayErrorMessage = true;
        this.errorMessageHandler.handleError(errorMessage);
    }

    private getPaidPaymentRequests() {
        this.displayErrorMessage = false;
        this.currentSubscription = this.paymentRequestsService.getPaidPaymentRequests()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(t => {
                this.refreshGridWithPaymentRequests(t);
            }, error => {
                const errorMessage = `Unable to fetch payment requests! ${error.message}`;
                this.handleError(errorMessage);
            });
    }

    private refreshGridWithPaymentRequests(paymentRequests: PaymentRequest[]) {
        if (paymentRequests) {
            this.paymentRequests = this.formatPaymentRequests(paymentRequests);
            const gridApi = this.gridApi;
            if (gridApi) {
                gridApi.setRowData(this.paymentRequests);
                this.ledgerRefInput.setUpGridApi(gridApi);
                this.statusInput.setUpGridApi(gridApi);
            }
        }
    }

    private clearGridData(gridApi: GridApi) {
        this.paymentRequests = [];
        if (gridApi) {
            gridApi.setRowData([]);
        }
    }

    private formatPaymentRequests(pendingPaymentRequests: PaymentRequest[]): PaymentRequest[] {
        return pendingPaymentRequests.map(request => {
            request.accountingReferenceDateFormattedString = moment(request.accountingReferenceDate.toLocaleString(), "YYYY-MM-DD").locale("en-gb").format("L");
            return request;
        });
    }

    public setPinnedBottomRowData(event: any) {
        const result = [];
        let selectedNodes: any[];

        if (this.gridApi && !this.showPaidRequestsOnly) {

            selectedNodes = this.gridApi.getSelectedNodes();

            if (selectedNodes && selectedNodes.hasOwnProperty("length") && selectedNodes.length > 0) {
                const numSelectedRows = selectedNodes.length;
                this.numberOfSelectedRows = numSelectedRows;
                const selectedTotalAmount = this.getSumOfSelectedRows(selectedNodes);
                const numCurrencyWarning = this.getMultipleCurrencyErrorString(selectedNodes);
                result.push(this.getPinnedRowData(numSelectedRows + " Selected", selectedTotalAmount, numCurrencyWarning));
            }
            this.pinnedBottomRowData = result;
            this.gridApi.setPinnedBottomRowData(this.pinnedBottomRowData);
        }
    }

    private getSumOfSelectedRows(selectedNodes: any): number {
        const selectedData = selectedNodes.map(node => node.data);
        let amountSum = 0;
        selectedData.forEach(element => {
            if (element.hasOwnProperty("amount")) {
                amountSum += element.amount;
            }
        });
        return amountSum;
    }


    private getPinnedRowData(selectedRows: string, total: number, multipleCurrenciesWarning: string): any {
        const rowDataObject: any = {};
        for (const col of this.paymentRequestsGridColumns) {
            switch (col.field) {
                case "accountingReferenceDateFormattedString":
                    rowDataObject[col.field] = selectedRows;
                    break;
                case "binderSection.binderDescription":
                    rowDataObject[col.field] = "Update";
                    break;
                case "amount":
                    rowDataObject[col.field] = total;
                    break;
                case "currency.isoCode":
                    rowDataObject[col.field] = multipleCurrenciesWarning;
                    break;
                default:
                    break;
            }
        }
        return rowDataObject;
    }

    private getMultipleCurrencyErrorString(selectedNodes: any) {

        if (this.areMultipleCurrenciesSelected(selectedNodes)) {
            return "Warning";
        } else {
            return selectedNodes[0].data.currency.isoCode;
        }
    }

    private areMultipleCurrenciesSelected(selectedNodes: any) {

        const selectedData = selectedNodes.map(node => node.data);
        const initialCurrency = selectedData[0].currency.id;
        for (let i = 1; i < this.numberOfSelectedRows; i++) {
            if (selectedData[i].currency.id !== initialCurrency) {
                return true;
            }
        }
        return false;
    }

    public openBulkChangeStatusDialog(self: PaymentRequestsComponent,
                                      params: { api: GridApi, data: PaymentRequest }): void {

        const selectedPaymentRequests = this.getSelectedPaymentRequests();

        self.modalDialogService
            .openDialog<BulkChangeStatusModalComponent,
            PaymentRequest>(
                BulkChangeStatusModalComponent,
                ModalConfig.changeStatusModal.matDialogConfig,
                (bindObject: BulkChangeStatusModalComponent) => {
                    bindObject.pendingPaymentRequests = selectedPaymentRequests;
                },
                pendingPaymentRequests => {
                    if (pendingPaymentRequests) {
                        this.updatePaymentRequests();
                    }
                });
    }

    private getSelectedPaymentRequests(): any {
        let selectedNodes: any[];
        const selectedPaymentRequests = [];

        if (this.gridApi) {
            selectedNodes = this.gridApi.getSelectedNodes();
        }

        if (selectedNodes && selectedNodes.hasOwnProperty("length") && selectedNodes.length > 0) {
            for (const selectedNode of selectedNodes) {
                if (selectedNode.data) {
                    selectedPaymentRequests.push(selectedNode.data);
                }
            }
        }
        return selectedPaymentRequests;
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.setDefaultFilter();
    }

    public clearGridFilters() {
        const inputFilters = this.getSelectedInputFilters();
        for (const property in this.defaultFilter) {
            if (this.defaultFilter.hasOwnProperty(property)) {
                inputFilters[property] = this.defaultFilter[property];
            }
        }
        this.agGrid.api.deselectAll();
        this.agGrid.api.setFilterModel(inputFilters);
    }
}
