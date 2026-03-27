import { DecimalPipe } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { GridApi, RowNode } from "ag-grid";
import { AgGridNg2 } from "ag-grid-angular";
import * as moment from "moment";
import { Subscription, Subject } from "rxjs";
import { distinctUntilChanged, skip, debounceTime, takeUntil, take } from "rxjs/operators";

import { DialogComponent } from "@app/components/dialog/dialog.component";
import { DialogParameters } from "@app/components/dialog/DialogParameters";
import { DialogTypes } from "@app/components/dialog/DialogTypes";
import { AddReconciliationModalComponent } from "@app/finance/add-reconciliation/add-reconciliation-modal.component";
import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";
import { AgGridColumnDefinition } from "@app/finance/ledger/AgGridColumnDefinition";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { EcfReconciliationSummaryFilters } from "@app/finance/view-models/ecf-reconciliation-summary-filters";
import { EcfReconciliationSummaryTotals } from "@app/finance/view-models/ecf-reconciliation-summary-totals";
import {
  BinderLookup,
  BinderSectionLookup,
  Currency,
  EcfReconciliation,
  EcfReconciliationSummary,
  FinancialLedgerLookup,
  UcrLookup
} from "@app/models";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { EcfReconciliationGroupHttpService } from "@app/services/ecf-reconciliation-group-http.service";
import { EcfReconciliationSummaryHttpService } from "@app/services/ecf-reconciliation-summary-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { AutocompleteSelectedValidator, AutocompleteValidator } from "@app/validators/autocomplete-selected.validator";
import { EcfReconciliationGroupRequest } from "@app/models/auto-generated/EcfReconciliationGroupRequest";

import { SummaryFilterHandlerService } from "@app/finance/ecf-reconciliation/summary/summary-filter-handler.service";

@Component({
    selector: "ecf-reconciliation-summary",
    templateUrl: "./ecf-reconciliation-summary.component.html",
    styleUrls: ["./ecf-reconciliation-summary.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class EcfReconciliationSummaryComponent implements OnInit, OnDestroy {
    public ecfReconciliationForm: FormGroup;
    public ecfReconciliationSummaryGridColumns: AgGridColumnDefinition[];

    public get binderLookups$() {
        return this.filterHandlerService.binderLookups$;
    }

    public get binderSectionLookups$() {
        return this.filterHandlerService.binderSectionLookups$;
    }

    public get currencyLookups$() {
        return this.filterHandlerService.currencyLookups$;
    }

    public get financialLedgerLookups$() {
        return this.filterHandlerService.financialLedgerLookups$;
    }

    public get ucrLookups$() {
        return this.filterHandlerService.ucrLookups$;
    }

    public get riskCodeLookups$() {
        return this.filterHandlerService.riskCodeLookups$;
    }

    public displayErrorMessage: boolean = true;

    public defaultColumnDef;
    public ecfReconciliationSummary: EcfReconciliationSummary[];

    public frameworkComponents: { customPinnedRowRenderer: typeof CustomPinnedRowRenderer; };
    public getRowStyle: (params: any) => { "font-weight": string; } | { "font-weight"?: undefined; };

    public isShowFilters: boolean = false;

    public selectedReconciledItems: number = 0;
    public selectedNotReconciledItems: number = 0;
    public selectedCurrencies: number[] = [];

    public get canReconcile(): boolean {
        return this.selectedReconciledItems === 0
            && this.selectedNotReconciledItems > 0
            && this.selectedCurrencies.length === 1
            && this.isEcfFinanceAdminFeatureEnabled;
    }

    public get canUnreconcile(): boolean {
        return this.selectedReconciledItems > 0 &&
            this.selectedNotReconciledItems === 0 &&
            this.isEcfFinanceAdminFeatureEnabled;
    }

    public ecfReconciliationSummaryTotals: EcfReconciliationSummaryTotals = {
        claimFinancialItemsDifferenceTotal: 0,
        financialTransactionsTotal: 0,
        ecfAmountTotal: 0
    };

    public ecfReconciliationSummarySelectedTotals: EcfReconciliationSummaryTotals = {
        claimFinancialItemsDifferenceTotal: 0,
        financialTransactionsTotal: 0,
        ecfAmountTotal: 0
    };

    private readonly ecfFinanceAdminFeature: string = "ecfFinanceAdmin";
    private readonly ecfFinanceUserFeature: string = "ecfFinanceUser";
    public isEcfFinanceAdminFeatureEnabled: boolean = false;
    public isEcfFinanceUserFeatureEnabled: boolean = false;

    @ViewChild("agGrid")
    public agGrid: AgGridNg2;
    private gridApi: GridApi;
    private currentSubscription: Subscription;
    private ngUnsubscribe: Subject<any> = new Subject();

    /**
     *
     * @param ecfReconciliationSummaryService
     * @param appCommunicationService
     */
    constructor(
        private fb: FormBuilder,
        private ecfReconciliationSummaryService: EcfReconciliationSummaryHttpService,
        private ecfReconciliationGroupHttpService: EcfReconciliationGroupHttpService,
        private filterContextService: FilterContextService,
        private messageErrorHandler: ErrorMessageHandlerService,
        private appCommunicationService: AppCommunicationService,
        private titleService: Title,
        private modalDialogService: ModalDialogService,
        private numberPipe: DecimalPipe,
        private dialog: MatDialog,
        private router: Router,
        private userService: UserService,
        private filterHandlerService: SummaryFilterHandlerService
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
        this.ecfReconciliationSummaryGridColumns = this.ecfReconciliationSummaryService.getColumns();
        this.defaultColumnDef = this.ecfReconciliationSummaryService.getDefaultColumn();
        this.initialiseActionColumn();
        this.initialiseLinkColumns();
        this.initialisePinnedRows();
    }

    public ngOnInit() {
        this.userService.getData().subscribe(() => {
            this.checkFeatureAvailability();
        });
        this.ecfReconciliationForm = this.fb.group({
            ucr: [null, AutocompleteSelectedValidator],
            currencyId: [null, AutocompleteValidator<Currency>(x => x.id)],
            financialLedgerId: [null, AutocompleteValidator<FinancialLedgerLookup>(x => x.financialLedgerId)],
            binderId: [null, AutocompleteValidator<BinderLookup>(x => x.binderId)],
            sectionId: [null, AutocompleteValidator<BinderSectionLookup>(x => x.sectionId)],
            binderDescription: [{ value: "", disabled: true }],
            riskCode: [null, AutocompleteValidator<string>(x => x)],
            unreconciledOnly: [{ value: true, disabled: false }],
            tag: [[]]
        });

        // set the title to Payment Requests
        this.titleService.setTitle("ECF Reconciliation Summary");
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
        this.isEcfFinanceAdminFeatureEnabled = this.userService.isFeatureAccessible(this.ecfFinanceAdminFeature);
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

    public ucrDisplay(item: UcrLookup): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item;
            return item.reference;
        }
    }

    public currencyDisplay(item: Currency): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item;
            return item.isoCode;
        }
    }

    //#endregion "CUSTOM DISPLAY METHODS"

    //#region "INITIALIZATION"

    private initialiseActionColumn(): void {
        const actionsColumnDef = this.ecfReconciliationSummaryGridColumns.find((column: AgGridColumnDefinition) => {
            return column.headerName === "Actions";
        });

        actionsColumnDef.onCellClicked = params => {
            this.openUpdateReconciliationDialog(params.data);
        };
    }

    private initialiseLinkColumns(): void {
        const ftDiffColumnDef = this.ecfReconciliationSummaryGridColumns.find((column: AgGridColumnDefinition) => {
            return column.field === "financialTransactionsDifference";
        });

        const cfiDiffColumnDef = this.ecfReconciliationSummaryGridColumns.find((column: AgGridColumnDefinition) => {
            return column.field === "claimFinancialItemsDifference";
        });

        ftDiffColumnDef.onCellClicked = params => {
            if (!params.rowPinned) {
                const ecfReconciliationSummary = params.data as EcfReconciliationSummary;
                this.filterContextService.ecfReconciliationId = ecfReconciliationSummary.ecfReconciliationId;
                this.router.navigate(["/finance/ecf-reconciliation/financial-transactions"]);
            }
        };

        cfiDiffColumnDef.onCellClicked = params => {
            if (!params.rowPinned) {
                const ecfReconciliationSummary = params.data as EcfReconciliationSummary;
                this.filterContextService.ecfReconciliationId = ecfReconciliationSummary.ecfReconciliationId;
                this.router.navigate(["/finance/ecf-reconciliation/claim-financial-items"]);
            }
        };
    }

    private getLookups(): void {
        this.filterHandlerService.loadFilters().subscribe(() => {
            this.preloadValues();

            if (this.canAutoFetch()) {
                this.updateEcfReconciliationSummary();
            }
        });
    }

    // TODO: MOVE TO FILTER HANDLER (STORY #16558)
    private preloadValues() {
        const ucr = this.filterContextService.ucr;
        const currency = this.filterContextService.currency;
        const unreconciledOnly = this.filterContextService.unreconciledOnly;
        const financialLedger = this.filterContextService.financialLedger;
        const binder = this.filterContextService.binder;
        const binderSection = this.filterContextService.binderSection;
        const riskCode = this.filterContextService.riskCode;

        this.ecfReconciliationForm.patchValue({
            ucr: ucr,
            currencyId: currency,
            unreconciledOnly: unreconciledOnly,
            financialLedgerId: financialLedger,
            binderId: binder,
            sectionId: binderSection,
            riskCode: riskCode
        }, { emitEvent: false });

        // filter dropdowns based on preloaded values
        this.filterHandlerService.onLedgerChanged(financialLedger);
        this.filterHandlerService.onBinderChanged(binder);
        this.filterHandlerService.onBinderSectionChanged(binderSection);

        // expand filters if any of them is selected
        if (financialLedger || binder || binderSection || riskCode) {
            this.isShowFilters = true;
        }
    }

    private setChangeListeners(): void {
        this.ecfReconciliationForm.controls.ucr
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.onUcrChange(data);
            });

        this.ecfReconciliationForm.controls.currencyId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.onCurrencyChange(data);
            });

        this.ecfReconciliationForm.controls.unreconciledOnly
            .valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.onUnreconciledOnlyChange(data);
            });

        this.ecfReconciliationForm.controls.financialLedgerId
            .valueChanges
            .pipe(debounceTime(500),
                  distinctUntilChanged(),
                  skip(1), // skip initial value as distinctUntilChanged does not fire for this value (known issue)
                  takeUntil(this.ngUnsubscribe))
            .subscribe((data: FinancialLedgerLookup) => {
                this.onLedgerChanged(data);
            });

        this.ecfReconciliationForm.controls.binderId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: BinderLookup) => {
                this.onBinderChanged(data);
            });

        this.ecfReconciliationForm.controls.sectionId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: BinderSectionLookup) => {
                this.onBinderSectionChanged(data);
            });

        this.ecfReconciliationForm.controls.riskCode
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: string) => {
                this.onRiskCodeChanged(data);
            });
    }

    //#endregion "INITIALIZATION"

    //#region "ACTION HANDLERS"

    public onReconcile() {
        const cfiDiff = this.ecfReconciliationSummarySelectedTotals.claimFinancialItemsDifferenceTotal;
        const ftDiff = this.ecfReconciliationSummarySelectedTotals.financialTransactionsTotal;
        const reconciliationIds = this.getSelectedRecordIds("reconciliationId");

        this.handleReconciliation(cfiDiff, ftDiff, reconciliationIds);
    }

    private handleReconciliation(cfiDiff: number, ftDiff: number, reconciliationIds: number[]) {
        if (cfiDiff !== 0 && ftDiff !== 0) {
            this.handleUnableToReconcile();
            return;
        }
        if (cfiDiff === 0 && ftDiff === 0) {
            this.confirmReconcile(reconciliationIds);
        } else if (cfiDiff === 0 || ftDiff === 0) {
            this.handleReconciliationIncomplete(ftDiff, cfiDiff, reconciliationIds);
        }
    }

    private handleUnableToReconcile() {
        const dialogParameters = new DialogParameters();
        dialogParameters.title = "Unable to reconcile";
        dialogParameters.message = "Reconciliation requires FT+/- or CFI +/- to equal zero";
        dialogParameters.type = DialogTypes.Error;

        this.dialog.open(DialogComponent, {
            width: "400px",
            data: dialogParameters
        });
    }

    private handleReconciliationIncomplete(ftDifference: number, cfiDifference: number, reconciliationIds: number[]) {
        const cfiDiffText = this.numberPipe.transform(cfiDifference, "1.2-2");
        const ftDiffText = this.numberPipe.transform(ftDifference, "1.2-2");

        const dialogParameters = new DialogParameters();
        dialogParameters.title = "Reconciliation incomplete";
        dialogParameters.message = `FT+/- is ${ftDiffText}<br/>CFI+/- is ${cfiDiffText}<br/><br/>Do you still want to reconcile?`;
        dialogParameters.positiveActionText = "Reconcile";

        this.reconcileRecordsAfterConfirmaton(dialogParameters, reconciliationIds);
    }

    private confirmReconcile(reconciliationIds: number[]) {
        const dialogParameters = new DialogParameters();
        dialogParameters.title = "Reconciliation Confirmation";
        dialogParameters.message = `Are you sure you want to reconcile?`;
        dialogParameters.positiveActionText = "Reconcile";

        this.reconcileRecordsAfterConfirmaton(dialogParameters, reconciliationIds);
    }

    private reconcileRecordsAfterConfirmaton(dialogParameters, reconciliationIds: number[]) {
        const dialogRef = this.popupConfirmationDialog(dialogParameters);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.reconcileRecords(reconciliationIds);
            }
        });
    }

    private popupConfirmationDialog(dialogParameters) {
        const dialogRef = this.dialog.open(DialogComponent, {
            width: "400px",
            data: dialogParameters
        });
        return dialogRef;
    }

    public onUnreconcile() {
        const dialogParameters = new DialogParameters();
        dialogParameters.title = "Unreconciliation Confirmation";
        dialogParameters.message = `Are you sure you want to unreconcile?`;
        dialogParameters.positiveActionText = "Unreconcile";

        const dialogRef = this.popupConfirmationDialog(dialogParameters);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.unreconcileRecords();
            }
        });
    }

    private unreconcileRecords() {
        const groupIds = this.getSelectedRecordIds("groupId");
        this.ecfReconciliationGroupHttpService.unreconcileEcfReconciliation(groupIds)
            .pipe(takeUntil(this.ngUnsubscribe),
                take(1))
            .subscribe(x => {
                    this.displayErrorMessage = false;
                    this.updateEcfReconciliationSummary();
                },
            err => {
                this.displayErrorMessage = true;
                this.messageErrorHandler.handleError(`Unable to save reconciliation. ${err.error.Message}`);
            });
    }

    public openAddReconciliationDialog() {
        this.modalDialogService
            .openDialog<AddReconciliationModalComponent,
            EcfReconciliation>(
                AddReconciliationModalComponent,
                ModalConfig.addEcfReconciliationModal.matDialogConfig,
                (bindObject: AddReconciliationModalComponent) => {
                    bindObject.initialEcfReconciliationSummary = null;
                    bindObject.ucrLookups$ = this.ucrLookups$;
                },
                (ecfReconciliationAddResult) => {
                    this.getLookups();
                });
    }

    public openUpdateReconciliationDialog(ecfReconciliationSummary: EcfReconciliationSummary) {
        this.modalDialogService
            .openDialog<AddReconciliationModalComponent,
            EcfReconciliation>(
                AddReconciliationModalComponent,
                ModalConfig.addEcfReconciliationModal.matDialogConfig,
                (bindObject: AddReconciliationModalComponent) => {
                    bindObject.initialEcfReconciliationSummary = ecfReconciliationSummary;
                    bindObject.ucrLookups$ = this.ucrLookups$;
                },
            (ecfReconciliationAddResult) => {
                    this.getLookups();
                });
    }

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
        this.updateEcfReconciliationSummary();
    }

    public toggleFiltersVisibility() {
        this.isShowFilters = !this.isShowFilters;
    }

    private reconcileRecords(reconciliationIds: number[]) {
        const user = this.userService.getUser();
        const ecfReconciliations = new EcfReconciliationGroupRequest();
        ecfReconciliations.ecfReconciliationIds = reconciliationIds;
        ecfReconciliations.reconciledByCfcContactId = user.cfcContactId;

        this.ecfReconciliationGroupHttpService.reconcileEcfReconciliations(ecfReconciliations)
            .pipe(takeUntil(this.ngUnsubscribe),
                take(1))
            .subscribe(x => {
                    this.displayErrorMessage = false;
                    this.updateEcfReconciliationSummary();
                },
                err => {
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(`Unable to save reconciliation. ${err.error.Message}`);
                });
    }

    private getSelectedRecordIds(type: "groupId" | "reconciliationId" = "reconciliationId"): number[] {
        let result: number[] = [];

        if (this.gridApi) {
            const selectedNodes = this.gridApi.getSelectedNodes();
            selectedNodes.forEach(node => {
                const element = node.data as EcfReconciliationSummary;

                switch (type) {
                case "groupId":
                    result.push(element.reconciledGroupId);
                    break;
                case "reconciliationId":
                    result.push(element.ecfReconciliationId);
                    break;
                default:
                    break;
                }
            });
        }

        // remove duplicates
        result = result.filter((elem, index, self) => index === self.indexOf(elem));
        return result;
    }

    //#endregion "ACTION HANDLERS"

    //#region "CHANGE HANDLERS"

    public onUcrChange(selectedUcr: UcrLookup): void {
        const oldUcr = this.filterContextService.ucr;
        this.filterContextService.ucr = selectedUcr;

        if (selectedUcr) {
            const newValue = selectedUcr.reference;
            const oldValue = oldUcr ? oldUcr.reference : null;
            if (newValue !== oldValue) {
                this.filterContextService.ecfReconciliationId = null;
            }
        } else {
            this.filterContextService.ecfReconciliationId = null;
            this.clearGridData();
        }

        if (this.canAutoFetch()) {
            this.updateEcfReconciliationSummary();
        }
    }

    public onCurrencyChange(currency: Currency) {
        this.filterContextService.currency = currency;

        if (this.canAutoFetch()) {
            this.updateEcfReconciliationSummary();
        }
    }

    public onUnreconciledOnlyChange(unreconciledOnly: boolean) {
        this.filterContextService.unreconciledOnly = unreconciledOnly;

        if (this.canAutoFetch()) {
            this.updateEcfReconciliationSummary();
        }
    }

    public onLedgerChanged(selectedLedger: FinancialLedgerLookup): void {
        this.filterContextService.financialLedger = selectedLedger;
        this.filterHandlerService.onLedgerChanged(selectedLedger);

        this.ecfReconciliationForm.patchValue({
            binderId: null,
            sectionId: null,
            riskCode: null
        });
    }

    public onBinderChanged(selectedBinder: BinderLookup): void {
        this.filterContextService.binder = selectedBinder;
        this.filterHandlerService.onBinderChanged(selectedBinder);

        this.ecfReconciliationForm.patchValue({
            sectionId: null,
            riskCode: null
        });
    }

    public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void {
        this.filterContextService.binderSection = selectedBinderSection;
        this.filterHandlerService.onBinderSectionChanged(selectedBinderSection);

        this.ecfReconciliationForm.patchValue({
            riskCode: null
        });
    }

    public onRiskCodeChanged(selectedRiskCode: string): void {
        this.filterContextService.riskCode = selectedRiskCode;
    }

    private canAutoFetch(): boolean {
        const ucr = this.ecfReconciliationForm.controls.ucr.value;
        const ucrIsValid = ucr ? this.ecfReconciliationForm.controls.ucr.valid : false;
        const financialLedgerId = this.ecfReconciliationForm.controls.financialLedgerId.value;
        const binderId = this.ecfReconciliationForm.controls.binderId.value;

        if (ucrIsValid || financialLedgerId || binderId) {
            return true;
        }
        return false;
    }

    //#endregion "CHANGE HANDLERS"

    private updateEcfReconciliationSummary() {
        const filters = this.getFilters();
        this.displayErrorMessage = false;
        this.clearPinnedBottomRowData();

        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }

        this.currentSubscription = this.ecfReconciliationSummaryService
            .getEcfReconciliationSummaries(
                filters.ucr,
                filters.currencyId,
                filters.financialLedgerId,
                filters.binderId,
                filters.sectionId,
                filters.riskCode,
                filters.unreconciledOnly
            )
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(ecfSummaryData => {
                this.refreshGrid(ecfSummaryData);
            }, error => {
                this.clearGridData();
                this.displayErrorMessage = true;
                this.messageErrorHandler.handleError(`Unable to retrieve reconciliations. ${error.error.Message}`);
            });
    }

    private getFilters(): EcfReconciliationSummaryFilters {
        const formControls = this.ecfReconciliationForm.controls;
        const filters: EcfReconciliationSummaryFilters = {
            ucr: null,
            currencyId: null,
            financialLedgerId: null,
            binderId: null,
            sectionId: null,
            riskCode: null,
            unreconciledOnly: null
        };

        filters.ucr = formControls.ucr.value ? formControls.ucr.value.reference : null;
        filters.currencyId = formControls.currencyId.value ? formControls.currencyId.value.id : null;
        filters.unreconciledOnly = formControls.unreconciledOnly.value ? formControls.unreconciledOnly.value : false;
        filters.riskCode = formControls.riskCode.value ? formControls.riskCode.value : null;

        if (formControls.financialLedgerId.value && formControls.financialLedgerId.value.financialLedgerId) {
            filters.financialLedgerId = formControls.financialLedgerId.value.financialLedgerId;
        }
        if (formControls.binderId.value && formControls.binderId.value.binderId) {
            filters.binderId = formControls.binderId.value.binderId;
        }
        if (formControls.sectionId.value && formControls.sectionId.value.sectionId) {
            filters.sectionId = formControls.sectionId.value.sectionId;
        }

        return filters;
    }

    private refreshGrid(ecfReconciliationSummary: EcfReconciliationSummary[]) {
        if (ecfReconciliationSummary) {
            this.ecfReconciliationSummary = this.formatEcfReconciliationSummary(ecfReconciliationSummary);
            if (this.gridApi) {
                this.gridApi.setRowData(this.ecfReconciliationSummary);
            }
        }

        this.setPinnedBottomRowData();
        this.gridApi.sizeColumnsToFit();
    }

    private formatEcfReconciliationSummary(ecfReconciliationSummary: EcfReconciliationSummary[]): EcfReconciliationSummary[] {
        return ecfReconciliationSummary.map(request => {
            if (request.completedDate) {
                request.completedDateFormattedString = moment(request.completedDate.toLocaleString(), "YYYY-MM-DD").locale("en-gb").format("L");
            }
            return request;
        });
    }

    //#region "PINNED BOTTOM RELATED CODE"

    public setPinnedBottomRowData() {
        if (this.gridApi) {
            const pinnedRows = [];

            if (this.ecfReconciliationSummary.length > 0) {
                this.preparePinnedBottomTotalRow(pinnedRows);
                this.preparePinnedBottomSelectedTotalRow(pinnedRows);
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
        rows.push(this.getPinnedRowData("Total", this.ecfReconciliationSummaryTotals));
    }

    private recalculateTotals(): void {
        const result: EcfReconciliationSummaryTotals = {
            claimFinancialItemsDifferenceTotal: 0,
            financialTransactionsTotal: 0,
            ecfAmountTotal: 0
        };

        this.gridApi.forEachNodeAfterFilter((node: RowNode) => {
            const element = node.data as EcfReconciliationSummary;
            result.claimFinancialItemsDifferenceTotal += element.claimFinancialItemsDifference;
            result.financialTransactionsTotal += element.financialTransactionsDifference;
            result.ecfAmountTotal += element.ecfAmount;
        });

        this.ecfReconciliationSummaryTotals = result;
    }

    private preparePinnedBottomSelectedTotalRow(rows: any[]): void {
        const selectedNodes = this.gridApi.getSelectedNodes();
        this.recalculateSelectedTotals(selectedNodes);

        if (selectedNodes && selectedNodes.hasOwnProperty("length") && selectedNodes.length > 0) {
            rows.push(this.getPinnedRowData(`Selected Total(${selectedNodes.length})`, this.ecfReconciliationSummarySelectedTotals));
        }
    }

    private recalculateSelectedTotals(selectedNodes: RowNode[]): void {
        const result: EcfReconciliationSummaryTotals = {
            claimFinancialItemsDifferenceTotal: 0,
            financialTransactionsTotal: 0,
            ecfAmountTotal: 0
        };

        let reconciled = 0;
        let unreconciled = 0;
        let currencies: number[] = [];
        selectedNodes.forEach(node => {
            const element = node.data as EcfReconciliationSummary;
            result.claimFinancialItemsDifferenceTotal += element.claimFinancialItemsDifference;
            result.financialTransactionsTotal += element.financialTransactionsDifference;
            result.ecfAmountTotal += element.ecfAmount;
            reconciled += element.reconciledGroupId > 0 ? 1 : 0;
            unreconciled += element.reconciledGroupId > 0 ? 0 : 1;
            if (currencies.indexOf(element.currency.id) < 0) {
                currencies.push(element.currency.id);
            }
        });

        this.ecfReconciliationSummarySelectedTotals = result;
        this.selectedReconciledItems = reconciled;
        this.selectedNotReconciledItems = unreconciled;
        this.selectedCurrencies = currencies;
    }

    private getPinnedRowData(label: string, totals: EcfReconciliationSummaryTotals): any {
        const rowDataObject: any = {};
        for (const col of this.ecfReconciliationSummaryGridColumns) {
            switch (col.field) {
                case "ucr":
                    rowDataObject[col.field] = label;
                    break;
                case "ecfAmount":
                    rowDataObject[col.field] = totals.ecfAmountTotal;
                    break;
                case "financialTransactionsDifference":
                    rowDataObject[col.field] = totals.financialTransactionsTotal;
                    break;
                case "claimFinancialItemsDifference":
                    rowDataObject[col.field] = totals.claimFinancialItemsDifferenceTotal;
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
