import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { GridApi } from "ag-grid";
import { AgGridNg2 } from "ag-grid-angular";
import * as moment from "moment";
import { Subscription, Subject} from "rxjs";
import { distinctUntilChanged, skip, debounceTime, takeUntil } from "rxjs/operators";

import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";
import { AgGridColumnDefinition } from "@app/finance/ledger/AgGridColumnDefinition";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { EcfReconciliationFinancialTransFilters } from "@app/finance/view-models/ecf-reconciliation-financial-trans-filters";
import { EcfReconciliationFinancialTransTotals } from "@app/finance/view-models/ecf-reconciliation-financial-trans-totals";
import {
  BinderLookup,
  BinderSectionLookup,
  EcfReconciliation,
  EcfReconciliationFinancialTransaction,
  FinancialLedgerLookup,
  FinancialTransactionEcfReconciliationRequest,
  UcrLookup 
} from "@app/models";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { UserService } from "@app/services/user.service";
import { AutocompleteSelectedValidator, AutocompleteValidator } from "@app/validators/autocomplete-selected.validator";
import { FinancialTransactionsFilterHandlerService } from
    "@app/finance/ecf-reconciliation/financial-transactions/financial-transactions-filter-handler.service";

import { DialogParameters } from "@app/components/dialog/DialogParameters";
import { DialogComponent } from "@app/components/dialog/dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: "ecf-reconciliation-financial-trans",
    templateUrl: "./ecf-reconciliation-financial-trans.component.html",
    styleUrls: ["./ecf-reconciliation-financial-trans.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class EcfReconciliationFinancialTransComponent implements OnInit, OnDestroy {
    public ecfReconciliationFinancialTransForm: FormGroup;
    public ecfReconciliationFinancialTransGridColumns: AgGridColumnDefinition[];
    
    public get binderLookups$() {
        return this.filterHandlerService.binderLookups$;
    }

    public get binderSectionLookups$() {
        return this.filterHandlerService.binderSectionLookups$;
    }

    public get ucrLookups$() {
        return this.filterHandlerService.ucrLookups$;
    }

    public get ecfReconciliationLookups$() {
        return this.filterHandlerService.ecfReconciliationLookups$;
    }

    public get financialLedgerLookups$() {
        return this.filterHandlerService.financialLedgerLookups$;
    }

    public get riskCodeLookups$() {
        return this.filterHandlerService.riskCodeLookups$;
    }
    
    private readonly ecfFinanceUserFeature: string = "ecfFinanceUser";
    private isEcfFinanceUserFeatureEnabled: boolean = false;

    public multiTagRegex: string = "^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[0-9]{2}$";
    public singleTagRegex: string = "^(olf|clf)$";

    public displayErrorMessage: boolean = true;
    public defaultColumnDef;
    public ecfReconciliationFinancialTrans: EcfReconciliationFinancialTransaction[];

    public frameworkComponents: { customPinnedRowRenderer: typeof CustomPinnedRowRenderer; };
    public getRowStyle: (params: any) => { "font-weight": string; } | { "font-weight"?: undefined; };

    public isShowFilters: boolean = false;

    public ecfReconciliationFinancialTransTotals: EcfReconciliationFinancialTransTotals = {
        reconciledAmountTotal: 0,
        ecfAmountDifference: 0,
        selectedCount: 0
    };

    public ecfReconciliationFinancialTransSelectedTotals: EcfReconciliationFinancialTransTotals = {
        reconciledAmountTotal: 0,
        ecfAmountDifference: 0,
        selectedCount: 0
    };

    public ecfFilters: EcfReconciliationFinancialTransFilters;
    public hasChangedEcfReconciliations: boolean = false;
    public isEcfAlreadyReconciled: boolean = false;

    public user = this.userService.getUser();

    @ViewChild("agGrid")
    public agGrid: AgGridNg2;
    public gridApi: GridApi;
    private currentSubscription: Subscription;
    private ngUnsubscribe: Subject<any> = new Subject();
    
    /**
     *
     * @param ecfReconciliationService
     * @param appCommunicationService
     */
    constructor(
        private fb: FormBuilder,
        private ecfReconciliationService: EcfReconciliationHttpService,
        private filterContextService: FilterContextService,
        private messageErrorHandler: ErrorMessageHandlerService,
        private appCommunicationService: AppCommunicationService,
        private titleService: Title,
        private userService: UserService,
        private dialog: MatDialog,
        private filterHandlerService: FinancialTransactionsFilterHandlerService
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
        this.ecfReconciliationFinancialTransGridColumns = this.ecfReconciliationService.getFinancialTransColumns();
        this.defaultColumnDef = this.ecfReconciliationService.getDefaultFinancialTransColumn();
        this.initialisePinnedRows();
    }

    public ngOnInit() {
        this.userService.getData().subscribe(() => {
            this.checkFeatureAvailability();
        });
        this.ecfReconciliationFinancialTransForm = this.fb.group({
            ucr: [null, AutocompleteSelectedValidator],
            ecfReconciliationId: [null, AutocompleteValidator<EcfReconciliation>(x => x.ecfReconciliationId)],
            isEcfAlreadyReconciled: [{value: "", disabled: true}],
            ecfAmount: [{ value: "", disabled: true }],
            financialLedgerId: [null, AutocompleteValidator<FinancialLedgerLookup>(x => x.financialLedgerId)],
            binderId: [null, AutocompleteValidator<BinderLookup>(x => x.binderId)],
            sectionId: [null, AutocompleteValidator<BinderSectionLookup>(x => x.sectionId)],
            riskCode: [{ value: "", disabled: false }],
            tags: [[]]
        });

        // set the title to Payment Requests
        this.titleService.setTitle("ECF Reconciliation Financial Transactions");
        this.setChangeListeners();
        this.getLookups();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.appCommunicationService.removeClass();
    }

    public onGridReady(params) {
        this.gridApi = params.api;
        this.clearGridData();
    }

    //#region "CUSTOM DISPLAY METHODS"

    public checkFeatureAvailability() {
        this.isEcfFinanceUserFeatureEnabled = this.userService.isFeatureAccessible(this.ecfFinanceUserFeature);
    }

    public ucrDisplay(item: UcrLookup): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item;
            return item.reference;
        }
    }

    public sequenceDisplay(item: EcfReconciliation): string {
        if (item) {
            let sequenceNo = ("00" + item.sequenceNo);

            sequenceNo = sequenceNo.substr(sequenceNo.length - 3);

            return item.currencyIsoCode + " " + sequenceNo;
        }
    }

    public ledgerReferenceDisplay(item: FinancialLedgerLookup): string {
        if (item) {
            return item.ledgerReference;
        }
    }

    public binderDisplay(item: BinderLookup): string {
        if (item) {
            return item.binderDescription + " (" + item.binderYear + ")";
        }
    }

    public binderSectionDisplay(item: BinderSectionLookup): string {
        if (item) {
            return item.shortCode + " - " + item.sectionDescription;
        }
    }

    public riskCodeDisplay(item: string): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item;
            return item;
        }
    }

    //#endregion "CUSTOM DISPLAY METHODS"

    //#region "INITIALIZATION"
    private getLookups(): void {
        this.filterHandlerService.loadFilters().subscribe(() => {
            this.preloadValues();
        });
    }

    // TODO: MOVE TO FILTER HANDLER (STORY #16558)
    private preloadValues() {
        const ucr = this.filterContextService.ucr;
        const ecfReconciliationId = this.filterContextService.ecfReconciliationId;
        const financialLedger = this.filterContextService.financialLedger;
        const binder = this.filterContextService.binder;
        const binderSection = this.filterContextService.binderSection;
        const riskCode = this.filterContextService.riskCode;
        const tags = this.filterContextService.tags;

        this.ecfReconciliationFinancialTransForm.patchValue({
            ucr: ucr,
            financialLedgerId: financialLedger,
            binderId: binder,
            sectionId: binderSection,
            riskCode: riskCode,
            tags: tags
        }, { emitEvent: false });

        if (ecfReconciliationId) {
            this.filterHandlerService.getEcfReconciliationById(ecfReconciliationId)
                .subscribe(data => {
                    this.ecfReconciliationFinancialTransForm.controls.ecfReconciliationId.setValue(data);
                });
        }

        // filter dropdowns based on preloaded values
        this.filterHandlerService.onUcrChanged(ucr);
        this.filterHandlerService.onLedgerChanged(financialLedger);
        this.filterHandlerService.onBinderChanged(binder);
        this.filterHandlerService.onBinderSectionChanged(binderSection);
    }

    private setChangeListeners(): void {
        this.ecfReconciliationFinancialTransForm.controls.ucr
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.onUcrChange(data);
            });

        this.ecfReconciliationFinancialTransForm.controls.ecfReconciliationId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: EcfReconciliation) => {
                this.onSequenceChange(data);
            });

        this.ecfReconciliationFinancialTransForm.controls.financialLedgerId
            .valueChanges
            .pipe(debounceTime(500),
                 distinctUntilChanged(),
                 skip(1),
                 takeUntil(this.ngUnsubscribe)) // skip initial value as distinctUntilChanged does not fire for this value (known issue)
            .subscribe((data: FinancialLedgerLookup) => {
                this.onLedgerChanged(data);
            });

        this.ecfReconciliationFinancialTransForm.controls.binderId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: BinderLookup) => {
                this.onBinderChanged(data);
            });

        this.ecfReconciliationFinancialTransForm.controls.sectionId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: BinderSectionLookup) => {
                this.onBinderSectionChanged(data);
            });

        this.ecfReconciliationFinancialTransForm.controls.riskCode
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: string) => {
                this.onRiskCodeChanged(data);
            });

        this.ecfReconciliationFinancialTransForm.controls.tags
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: string[]) => {
                this.onTagsChanged(data);
            });
    }

    //#endregion "INITIALIZATION"

    //#region "ACTION HANDLERS"
    public clearGridData() {
        if (this.gridApi) {
            this.gridApi.setRowData([]);
            this.clearPinnedBottomRowData();
        }
    }

    public clearFilters() {
        if (this.gridApi) {
            this.gridApi.setFilterModel(null);
            this.gridApi.deselectAll();
        }
    }

    public fetchEcfs() {
        this.refreshEcfReconciliationFinancialTransGrid();
    }

    public toggleFiltersVisibility() {
        this.isShowFilters = !this.isShowFilters;
    }

    //#endregion "ACTION HANDLERS"

    //#region "CHANGE HANDLERS"
    public onUcrChange(selectedUcr: UcrLookup): void {
        this.clearSelections();

        if (selectedUcr) {
            const newValue = selectedUcr.reference;
            const oldValue = this.filterContextService.ucr ? this.filterContextService.ucr.reference : null;
            if (newValue !== oldValue) {
                this.filterContextService.ecfReconciliationId = null;
            }
            this.filterContextService.ucr = selectedUcr;
        } else {
            this.filterContextService.ucr = null;
            this.filterContextService.ecfReconciliationId = null;
            this.clearGridData();
        }

        this.filterHandlerService.onUcrChanged(selectedUcr);
        this.ecfReconciliationFinancialTransForm.get("ecfReconciliationId").setValue(null);
        this.ecfReconciliationFinancialTransForm.get("ecfAmount").setValue(null);
    }

    public onSequenceChange(selectedEcfReconciliation: EcfReconciliation) {
        if (selectedEcfReconciliation && this.canAutoFetch()) {
            this.filterContextService.ecfReconciliationId = selectedEcfReconciliation.ecfReconciliationId;

            this.refreshEcfReconciliationFinancialTransGrid();

            this.isEcfAlreadyReconciled = selectedEcfReconciliation.reconciledGroupId ? true : false;

            this.ecfReconciliationFinancialTransForm.get("ecfAmount").setValue(selectedEcfReconciliation.amount);
            this.ecfReconciliationFinancialTransForm.get("isEcfAlreadyReconciled").setValue(this.isEcfAlreadyReconciled);
        }
    }

    public clearSelections() {
        this.ecfReconciliationFinancialTransForm.get("financialLedgerId").setValue(null);
        this.ecfReconciliationFinancialTransForm.get("tags").setValue([]);
        this.clearGridData();
    }

    public onLedgerChanged(selectedLedger: FinancialLedgerLookup): void {
        this.filterContextService.financialLedger = selectedLedger;
        this.filterHandlerService.onLedgerChanged(selectedLedger);

        this.ecfReconciliationFinancialTransForm.patchValue({
            binderId: null,
            sectionId: null,
            riskCode: null
        });
    }

    public onBinderChanged(selectedBinder: BinderLookup): void {
        this.filterContextService.binder = selectedBinder;
        this.filterHandlerService.onBinderChanged(selectedBinder);

        this.ecfReconciliationFinancialTransForm.patchValue({
            sectionId: null,
            riskCode: null
        });
    }

    public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void {
        this.filterContextService.binderSection = selectedBinderSection;
        this.filterHandlerService.onBinderSectionChanged(selectedBinderSection);

        this.ecfReconciliationFinancialTransForm.patchValue({
            riskCode: null
        });
    }

    public onRiskCodeChanged(selectedRiskCode: string): void {
        this.filterContextService.riskCode = selectedRiskCode;
    }

    public onTagsChanged(tags: string[]): void {
        this.filterContextService.tags = tags;
    }

    private canAutoFetch(): boolean {
        const ucr = this.ecfReconciliationFinancialTransForm.controls.ucr.value;
        const ecfReconciliationId = this.ecfReconciliationFinancialTransForm.controls.ecfReconciliationId.value;

        if (ucr && ecfReconciliationId) {
            return true;
        }
        return false;
    }

    public onReconcile() {

        if (!this.isEcfFinanceUserFeatureEnabled) {
            this.displayErrorMessage = true;
            this.messageErrorHandler.handleError("User does not have authority to reconcile Financial Transactions");
        } else {
            const filters = this.getFilters();

            const ecfReconciliationRequests = new Array<FinancialTransactionEcfReconciliationRequest>();
            this.ecfReconciliationFinancialTrans.forEach((ecfReconFinTrans: EcfReconciliationFinancialTransaction) => {
                if (ecfReconFinTrans.isReconciled != ecfReconFinTrans.shouldBeReconciled) {
                    ecfReconciliationRequests.push(this.addEcfReconciliationRequest(
                        ecfReconFinTrans.financialTransactionId,
                        ecfReconFinTrans.shouldBeReconciled,
                        filters.ecfReconciliationId));
                }
            });
            this.confirmReconcile(ecfReconciliationRequests);
        }
    }

    private confirmReconcile(ecfReconciliationRequests: FinancialTransactionEcfReconciliationRequest[]) {
        const dialogParameters = new DialogParameters();
        dialogParameters.title = "Reconciliation Confirmation";
        dialogParameters.message = `Are you sure you want to reconcile?`;
        dialogParameters.positiveActionText = "Reconcile";

        const dialogRef = this.dialog.open(DialogComponent, {
            width: "400px",
            data: dialogParameters
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.updateEcfReconciliationFinancialTransGrid(ecfReconciliationRequests);
            }
        });
    }

    private addEcfReconciliationRequest(financialTransactionId : number,  shouldBeReconciled : boolean, ecfReconciliationId : number) : FinancialTransactionEcfReconciliationRequest {

        const ecfReconciliationRequest: FinancialTransactionEcfReconciliationRequest = {
            financialTransactionId : financialTransactionId,
            isReconciled : shouldBeReconciled,
            ecfReconciliationId: shouldBeReconciled ? ecfReconciliationId : null,
            reconciledByCfcContactId: this.user.cfcContactId
        };

        return ecfReconciliationRequest;
    }

    private updateEcfReconciliationFinancialTransGrid(ecfReconciliationRequests: FinancialTransactionEcfReconciliationRequest[]) {
        this.displayErrorMessage = false;
        this.clearPinnedBottomRowData();

        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }
        ecfReconciliationRequests.forEach(
            (ecfReconciliationRequest) => ecfReconciliationRequest.reconciledByCfcContactId = this.user.cfcContactId);

        this.currentSubscription = this.ecfReconciliationService
            .reconcileEcfFinancialTransactions(ecfReconciliationRequests)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(ecfFinancialTransReconRequest => {
                this.refreshEcfReconciliationFinancialTransGrid();
            }, error => {
                this.displayErrorMessage = true;
                this.messageErrorHandler.handleError(`Unable update ecf reconciliation financial transactions. ${error.error.Message}`);
            });
    }

    //#endregion "CHANGE HANDLERS"
    private refreshEcfReconciliationFinancialTransGrid() {
        const filters = this.getFilters();
        this.displayErrorMessage = false;

        if (filters.ecfReconciliationId && filters.ecfReconciliationId > 0) {
            this.clearPinnedBottomRowData();

            if (this.currentSubscription) {
                this.currentSubscription.unsubscribe();
            }

            this.currentSubscription = this.ecfReconciliationService
                .getEcfFinancialTransactions(
                    filters.ecfReconciliationId,
                    filters.financialLedgerId,
                    filters.binderId,
                    filters.sectionId,
                    filters.riskCode,
                    filters.tags
                )
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(ecfFinancialTransData => {
                    this.refreshGrid(ecfFinancialTransData);
                }, error => {
                    this.clearGridData();
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(`Unable to retrieve ecf reconciliations financial transactions. ${error.error.Message}`);
                }); 
        }
    }

    private getFilters(): EcfReconciliationFinancialTransFilters {
        const formControls = this.ecfReconciliationFinancialTransForm.controls;
        const filters: EcfReconciliationFinancialTransFilters = {
            ecfReconciliationId: null,
            financialLedgerId: null,
            binderId: null,
            sectionId: null,
            riskCode: null,
            tags: null
        };

        if (formControls.ecfReconciliationId.value && formControls.ecfReconciliationId.value.ecfReconciliationId) {
            filters.ecfReconciliationId = formControls.ecfReconciliationId.value.ecfReconciliationId;
        }
        if (formControls.financialLedgerId.value && formControls.financialLedgerId.value.financialLedgerId) {
            filters.financialLedgerId = formControls.financialLedgerId.value.financialLedgerId;
        }
        if (formControls.binderId.value && formControls.binderId.value.binderId) {
            filters.binderId = formControls.binderId.value.binderId;
        }
        if (formControls.sectionId.value && formControls.sectionId.value.sectionId) {
            filters.sectionId = formControls.sectionId.value.sectionId;
        }

        filters.riskCode = formControls.riskCode.value ? formControls.riskCode.value : null;

        if (formControls.tags &&
            Array.isArray(formControls.tags.value)) {
            filters.tags = formControls.tags.value.join(",").toUpperCase();
        }

        return filters;
    }

    private refreshGrid(ecfReconciliationFinancialTrans: EcfReconciliationFinancialTransaction[]) {
        if (ecfReconciliationFinancialTrans) {
            this.ecfReconciliationFinancialTrans = this.formatEcfReconciliationFinancialTrans(ecfReconciliationFinancialTrans);
            if (this.gridApi) {
                this.gridApi.setRowData(this.ecfReconciliationFinancialTrans);
            }
        }
        this.setPinnedBottomRowData();
        this.gridApi.sizeColumnsToFit();
    }

    private formatEcfReconciliationFinancialTrans(ecfReconciliationFinancialTrans: EcfReconciliationFinancialTransaction[]): EcfReconciliationFinancialTransaction[] {
        return ecfReconciliationFinancialTrans.map(request => {

            request.description = ((request.binderDescription) ? request.binderDescription + " " : "") +
                ((request.sectionShortCode) ? request.sectionShortCode + " " : "") +
                ((request.sectionDescription) ? request.sectionDescription + " " : "") +
                ((request.binderYearNo) ? request.binderYearNo + " " : "");

            request.entryDateFormattedString = moment(request.entryDate.toLocaleString(), "YYYY-MM-DD").locale("en-gb").format("L");
            request.paidDateFormattedString = moment(request.paidDate.toLocaleString(), "YYYY-MM-DD").locale("en-gb").format("L");
            request.isReconciled = request.shouldBeReconciled = request.ecfReconciliationId ? true : false;

            return request;
        });
    }

    //#region "PINNED BOTTOM RELATED CODE"
    public setPinnedBottomRowData() {
        if (this.gridApi) {
            const pinnedRows = [];

            if (this.ecfReconciliationFinancialTrans.length > 0) {
                this.preparePinnedBottomSelectedTotalRow(pinnedRows);
                this.preparePinnedBottomTotalRow(pinnedRows);
            }

            this.gridApi.setPinnedBottomRowData(pinnedRows);
        }
    }

    private clearPinnedBottomRowData(): void {
        if (this.gridApi) {
            this.gridApi.setPinnedBottomRowData([]);
        }
    }

    private preparePinnedBottomTotalRow(rows: any[]): void {
        this.recalculateTotals();
        rows.push(this.getPinnedRowData("FT Diff +/-", this.ecfReconciliationFinancialTransTotals));
    }

    private recalculateTotals(): void {
        const result: EcfReconciliationFinancialTransTotals = {
            reconciledAmountTotal: 0,
            ecfAmountDifference: 0,
            selectedCount : 0
        };

        this.ecfReconciliationFinancialTrans.forEach((ecfReconFinTrans: EcfReconciliationFinancialTransaction) => {
            if (ecfReconFinTrans.shouldBeReconciled) {
                result.reconciledAmountTotal += ecfReconFinTrans.bankAccountAmount;
            }
        });

        result.reconciledAmountTotal += this.ecfReconciliationFinancialTransForm.get("ecfAmount").value;

        this.ecfReconciliationFinancialTransTotals = result;
    }

    private preparePinnedBottomSelectedTotalRow(rows: any[]): void {
        this.recalculateSelectedTotals();
        const selectedCount: number = this.ecfReconciliationFinancialTransSelectedTotals.selectedCount;

        if (selectedCount > 0) {
            rows.push(this.getPinnedRowData(`Selected Total(${selectedCount})`, this.ecfReconciliationFinancialTransSelectedTotals));
        }
    }

    private recalculateSelectedTotals(): void {
        const result: EcfReconciliationFinancialTransTotals = {
            reconciledAmountTotal: 0,
            ecfAmountDifference: 0,
            selectedCount : 0
        };

        this.hasChangedEcfReconciliations = false;

        this.ecfReconciliationFinancialTrans.forEach((ecfReconFinTrans: EcfReconciliationFinancialTransaction) => {

            if (ecfReconFinTrans.shouldBeReconciled != ecfReconFinTrans.isReconciled) {
                   this.hasChangedEcfReconciliations = true;
            }

            if (ecfReconFinTrans.shouldBeReconciled) {
                result.reconciledAmountTotal += ecfReconFinTrans.bankAccountAmount;
                result.selectedCount += 1;
            }
        });

        this.ecfReconciliationFinancialTransSelectedTotals = result;
    }

    private getPinnedRowData(label: string, totals: EcfReconciliationFinancialTransTotals): any {
        const rowDataObject: any = {};
        for (const col of this.ecfReconciliationFinancialTransGridColumns) {
            switch (col.field) {
                case "shouldBeReconciled":
                    rowDataObject[col.field] = label;
                    break;
                case "bankAccountAmount":
                    rowDataObject[col.field] = totals.reconciledAmountTotal;
                    break;
                default:
                    break;
            }
        }
        return rowDataObject;
    }

    private initialisePinnedRows() {
        this.frameworkComponents = {
            customPinnedRowRenderer: CustomPinnedRowRenderer
        };

        this.getRowStyle = params => {
            if (params.node.rowPinned) {
                return { "font-weight": "bold" };
            }
            return {};
        };
    }

    //#endregion "PINNED BOTTOM RELATED CODE"
}
