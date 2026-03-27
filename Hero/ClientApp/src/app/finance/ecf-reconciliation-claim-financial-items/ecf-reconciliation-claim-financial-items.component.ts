import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { GridApi } from "ag-grid";
import { AgGridNg2 } from "ag-grid-angular";
import * as moment from "moment";
import { Subscription , Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

import { BankCurrencies } from "@app/enums/BankCurrencies";
import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";
import { AgGridColumnDefinition } from "@app/finance/ledger/AgGridColumnDefinition";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { EcfReconciliationClaimFinancialItemsFilters } from "@app/finance/view-models/ecf-reconciliation-claim-financial-items-filters";
import { EcfReconciliationClaimFinancialItemsTotals } from "@app/finance/view-models/ecf-reconciliation-claim-financial-items-totals";
import {
  BinderLookup,
  BinderSectionLookup,
  ClaimFinancialItemEcfReconciliationRequest,
  EcfReconciliation,
  EcfReconciliationClaimFinancialItem,
  UcrLookup
} from "@app/models";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { UserService } from "@app/services/user.service";
import { AutocompleteSelectedValidator, AutocompleteValidator } from "@app/validators/autocomplete-selected.validator";

import { DialogParameters } from "@app/components/dialog/DialogParameters";
import { DialogComponent } from "@app/components/dialog/dialog.component";
import { MatDialog } from "@angular/material/dialog";

import { ClaimFinancialItemsFilterHandlerService } from
    "@app/finance/ecf-reconciliation/claim-financial-items/claim-financial-items-filter-handler.service";

@Component({
    selector: "ecf-reconciliation-claim-financial-items",
    templateUrl: "./ecf-reconciliation-claim-financial-items.component.html",
    styleUrls: ["./ecf-reconciliation-claim-financial-items.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class EcfReconciliationClaimFinancialItemsComponent implements OnInit, OnDestroy {
    public ecfReconciliationClaimFinancialItemsForm: FormGroup;
    public ecfReconciliationClaimFinancialItemsGridColumns: AgGridColumnDefinition[];  
    
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

    public get riskCodeLookups$() {
        return this.filterHandlerService.riskCodeLookups$;
    }

    public selectedEcfReconciliation: EcfReconciliation;

    public displayErrorMessage: boolean = true;
    public riskCodes: string[];
    public defaultColumnDef;
    public ecfReconciliationClaimFinancialItems: EcfReconciliationClaimFinancialItem[];

    public frameworkComponents: { customPinnedRowRenderer: typeof CustomPinnedRowRenderer; };
    public getRowStyle: (params: any) => { "font-weight": string; } | { "font-weight"?: undefined; };

    public isShowFilters: boolean = false;

    private readonly ecfFinanceUserFeature: string = "ecfFinanceUser";
    private isEcfFinanceUserFeatureEnabled: boolean = false;

    public ecfReconciliationClaimFinancialItemsTotals: EcfReconciliationClaimFinancialItemsTotals = {
        reconciledAmountTotal: 0,
        reconciledGBPAmountTotal: 0,
        selectedCount: 0
    };

    public ecfReconciliationClaimFinancialItemsSelectedTotals: EcfReconciliationClaimFinancialItemsTotals = {
        reconciledAmountTotal: 0,
        reconciledGBPAmountTotal: 0,
        selectedCount: 0
    };

    public ecfFilters: EcfReconciliationClaimFinancialItemsFilters;
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
        private filterHandlerService: ClaimFinancialItemsFilterHandlerService
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
        this.ecfReconciliationClaimFinancialItemsGridColumns = this.ecfReconciliationService.getClaimFinancialItemsColumns();
        this.defaultColumnDef = this.ecfReconciliationService.getDefaultClaimFinancialItemsColumn();
        this.initialisePinnedRows();
    }

    public ngOnInit() {
        this.userService.getData().subscribe(() => {
            this.checkFeatureAvailability();
        });
        this.ecfReconciliationClaimFinancialItemsForm = this.fb.group({
            ucr: [null, AutocompleteSelectedValidator],
            ecfReconciliationId: [null, AutocompleteValidator<EcfReconciliation>(x => x.ecfReconciliationId)],
            isEcfAlreadyReconciled: [{value: "", disabled: true}],
            ecfAmount: [{ value: "", disabled: true }],
            binderId: [null, AutocompleteValidator<BinderLookup>(x => x.binderId)],
            sectionId: [null, AutocompleteValidator<BinderSectionLookup>(x => x.sectionId)],
            riskCode: [{ value: "", disabled: false }],
        });

        // set the title to Payment Requests
        this.titleService.setTitle("ECF Reconciliation Claim Financial Items");
        this.setChangeListeners();
        this.getLookups();
    }

    public checkFeatureAvailability() {
        this.isEcfFinanceUserFeatureEnabled = this.userService.isFeatureAccessible(this.ecfFinanceUserFeature);
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

            sequenceNo = sequenceNo.substr(sequenceNo.length-3)

            return item.currencyIsoCode + " " + sequenceNo;
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

    private preloadValues() {
        const ucr = this.filterContextService.ucr;
        const ecfReconciliationId = this.filterContextService.ecfReconciliationId;
        const binder = this.filterContextService.binder;
        const binderSection = this.filterContextService.binderSection;
        const riskCode = this.filterContextService.riskCode;

        this.ecfReconciliationClaimFinancialItemsForm.patchValue({
            ucr: ucr,
            binderId: binder,
            sectionId: binderSection,
            riskCode: riskCode
        }, { emitEvent: false });
        
        if (ecfReconciliationId) {
            this.filterHandlerService.getEcfReconciliationById(ecfReconciliationId)
                .subscribe(data => {
                    this.ecfReconciliationClaimFinancialItemsForm.controls.ecfReconciliationId.setValue(data);
                });
        }

        // filter dropdowns based on preloaded values
        this.filterHandlerService.onUcrChanged(ucr);
        this.filterHandlerService.onBinderChanged(binder);
        this.filterHandlerService.onBinderSectionChanged(binderSection);
    }

    private setChangeListeners(): void {
        this.ecfReconciliationClaimFinancialItemsForm.controls.ucr
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.onUcrChange(data);
            });

        this.ecfReconciliationClaimFinancialItemsForm.controls.ecfReconciliationId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: EcfReconciliation) => {
                this.onSequenceChange(data);
            });

        this.ecfReconciliationClaimFinancialItemsForm.controls.binderId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: BinderLookup) => {
                this.onBinderChanged(data);
            });

        this.ecfReconciliationClaimFinancialItemsForm.controls.sectionId
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: BinderSectionLookup) => {
                this.onBinderSectionChanged(data);
            });

        this.ecfReconciliationClaimFinancialItemsForm.controls.riskCode
            .valueChanges
            .pipe(debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe((data: string) => {
                this.onRiskCodeChanged(data);
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
        this.refreshEcfReconciliationClaimFinancialItemsGrid();
    }

    public toggleFiltersVisibility() {
        this.isShowFilters = !this.isShowFilters;
    }

    //#endregion "ACTION HANDLERS"

    //#region "CHANGE HANDLERS"
    public onUcrChange(selectedUcr): void {
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
        this.ecfReconciliationClaimFinancialItemsForm.get("ecfReconciliationId").setValue(null);
        this.ecfReconciliationClaimFinancialItemsForm.get("ecfAmount").setValue(null);
    }

    public onSequenceChange(selectedEcfReconciliation: EcfReconciliation) {
        if (selectedEcfReconciliation && this.canAutoFetch()) {
            this.filterContextService.ecfReconciliationId = selectedEcfReconciliation.ecfReconciliationId;

            this.refreshEcfReconciliationClaimFinancialItemsGrid();

            this.selectedEcfReconciliation = selectedEcfReconciliation;
            this.isEcfAlreadyReconciled = selectedEcfReconciliation.reconciledGroupId ? true : false;

            this.ecfReconciliationClaimFinancialItemsForm.get("ecfAmount").setValue(selectedEcfReconciliation.amount);
            this.ecfReconciliationClaimFinancialItemsForm.get("isEcfAlreadyReconciled").setValue(this.isEcfAlreadyReconciled);
        }
    }

    public clearSelections() {
        this.ecfReconciliationClaimFinancialItemsForm.patchValue({
            binderId: null,
            sectionId: null,
            riskCode: null
        });
        this.clearGridData();
    }

    public onBinderChanged(selectedBinder: BinderLookup): void {
        this.filterContextService.financialLedger = null;
        this.filterContextService.binder = selectedBinder;
        this.filterHandlerService.onBinderChanged(selectedBinder);

        this.ecfReconciliationClaimFinancialItemsForm.patchValue({
            sectionId: null,
            riskCode: null
        });
    }

    public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void {
        this.filterContextService.binderSection = selectedBinderSection;
        this.filterHandlerService.onBinderSectionChanged(selectedBinderSection);

        this.ecfReconciliationClaimFinancialItemsForm.patchValue({
            riskCode: null
        });
    }

    public onRiskCodeChanged(selectedRiskCode: string): void {
        this.filterContextService.riskCode = selectedRiskCode;
    }

    private canAutoFetch(): boolean {
        const ucr = this.ecfReconciliationClaimFinancialItemsForm.controls.ucr.value;
        const ecfReconciliationId = this.ecfReconciliationClaimFinancialItemsForm.controls.ecfReconciliationId.value;

        if (ucr && ecfReconciliationId) {
            return true;
        }
        return false;
    }

    public onReconcile() {
        if (!this.isEcfFinanceUserFeatureEnabled) {
            this.displayErrorMessage = true;
            this.messageErrorHandler.handleError("User does not have authority to reconcile Claim Financial Items");
        } else {
            const filters = this.getFilters();
            const ecfReconciliationRequests = new Array<ClaimFinancialItemEcfReconciliationRequest>();
            this.ecfReconciliationClaimFinancialItems.forEach((ecfReconClaimFinancialItems: EcfReconciliationClaimFinancialItem) => {

                if (ecfReconClaimFinancialItems.shouldBeReconciled !== ecfReconClaimFinancialItems.isReconciled) {
                    ecfReconciliationRequests.push(this.addEcfReconciliationRequest(ecfReconClaimFinancialItems.claimFinancialItemId, ecfReconClaimFinancialItems.shouldBeReconciled, filters.ecfReconciliationId));
                }
            });
            this.confirmReconcile(ecfReconciliationRequests);
        }
    }

    private confirmReconcile(ecfReconciliationRequests: ClaimFinancialItemEcfReconciliationRequest[]) {
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
                this.updateEcfReconciliationClaimFinancialItemsGrid(ecfReconciliationRequests);
            }
        });
    }

    private addEcfReconciliationRequest(claimFinancialItemId : number,  shouldBeReconciled : boolean, ecfReconciliationId : number) : ClaimFinancialItemEcfReconciliationRequest {
        const ecfReconciliationRequest: ClaimFinancialItemEcfReconciliationRequest = {
           claimFinancialItemId : claimFinancialItemId,
            isReconciled : shouldBeReconciled,
            ecfReconciliationId: shouldBeReconciled ? ecfReconciliationId : null,
           reconciledByCfcContactId: this.user.cfcContactId
        };

        return ecfReconciliationRequest;
    }
    
    private updateEcfReconciliationClaimFinancialItemsGrid(ecfReconciliationRequests : ClaimFinancialItemEcfReconciliationRequest[]) {
        this.displayErrorMessage = false;
        this.clearPinnedBottomRowData();

        if (this.currentSubscription) {
            this.currentSubscription.unsubscribe();
        }

        ecfReconciliationRequests.forEach(
            (ecfReconciliationRequest) => ecfReconciliationRequest.reconciledByCfcContactId = this.user.cfcContactId);

        this.currentSubscription = this.ecfReconciliationService
            .reconcileEcfClaimFinancialItems(ecfReconciliationRequests)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(ecfClaimFinancialItemsReconRequest => {
                this.refreshEcfReconciliationClaimFinancialItemsGrid();
            }, error => {
                this.displayErrorMessage = true;
                this.messageErrorHandler.handleError(`Unable update ecf reconciliation claim financial items. ${error.error.Message}`);
            }); 
    }

    //#endregion "CHANGE HANDLERS"
    private refreshEcfReconciliationClaimFinancialItemsGrid() {
        const filters = this.getFilters();
        this.displayErrorMessage = false;

        if (filters.ecfReconciliationId && filters.ecfReconciliationId > 0) {
            this.clearPinnedBottomRowData();

            if (this.currentSubscription) {
                this.currentSubscription.unsubscribe();
            }

            this.currentSubscription = this.ecfReconciliationService
                .getEcfClaimFinancialItems(
                    filters.ecfReconciliationId,
                    filters.binderId,
                    filters.sectionId,
                    filters.riskCode
                )
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(ecfClaimFinancialItemsData => {
                    this.refreshGrid(ecfClaimFinancialItemsData);
                }, error => {
                    this.clearGridData();
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(`Unable to retrieve ecf reconciliations claim financial items. ${error.error.Message}`);
                });
        }
    }

    private getFilters(): EcfReconciliationClaimFinancialItemsFilters {
        const formControls = this.ecfReconciliationClaimFinancialItemsForm.controls;
        const filters: EcfReconciliationClaimFinancialItemsFilters = {
            ecfReconciliationId: null,
            binderId: null,
            sectionId: null,
            riskCode: null
        };

        if (formControls.ecfReconciliationId.value && formControls.ecfReconciliationId.value.ecfReconciliationId) {
            filters.ecfReconciliationId = formControls.ecfReconciliationId.value.ecfReconciliationId;
        }
        if (formControls.binderId.value && formControls.binderId.value.binderId) {
            filters.binderId = formControls.binderId.value.binderId;
        }
        if (formControls.sectionId.value && formControls.sectionId.value.sectionId) {
            filters.sectionId = formControls.sectionId.value.sectionId;
        }

        filters.riskCode = formControls.riskCode.value ? formControls.riskCode.value : null;

        return filters;
    }

    private refreshGrid(ecfReconciliationClaimFinancialItems: EcfReconciliationClaimFinancialItem[]) {
        if (ecfReconciliationClaimFinancialItems) {
            this.ecfReconciliationClaimFinancialItems = this.formatEcfReconciliationClaimFinancialItems(ecfReconciliationClaimFinancialItems);
            if (this.gridApi) {
                this.gridApi.setRowData(this.ecfReconciliationClaimFinancialItems);
            }
        }
        this.setPinnedBottomRowData();
        this.gridApi.sizeColumnsToFit();
    }

    private formatEcfReconciliationClaimFinancialItems(ecfReconciliationClaimFinancialItems: EcfReconciliationClaimFinancialItem[]): EcfReconciliationClaimFinancialItem[] {
        return ecfReconciliationClaimFinancialItems.map(request => {
            request.description = ((request.binderDescription) ? request.binderDescription + " " : "") +
                ((request.sectionShortCode) ? request.sectionShortCode + " " : "") +
                ((request.sectionDescription) ? request.sectionDescription + " " : "") +
                ((request.binderYearNo) ? request.binderYearNo + " " : "");

            request.accountingReferenceDateFormattedString = moment(request.accountingReferenceDate.toLocaleString(), "YYYY-MM-DD").locale("en-gb").format("L");
            request.isReconciled = request.shouldBeReconciled = request.ecfReconciliationId ? true : false;

            return request;
        });
    }

    //#region "PINNED BOTTOM RELATED CODE"
    public setPinnedBottomRowData() {
        if (this.gridApi) {
            const pinnedRows = [];

            if (this.ecfReconciliationClaimFinancialItems.length > 0) {
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
        rows.push(this.getPinnedRowData("CFI Diff +/-", this.ecfReconciliationClaimFinancialItemsTotals));
    }

    private recalculateTotals(): void {
        const result: EcfReconciliationClaimFinancialItemsTotals = {
            reconciledAmountTotal: 0,
            reconciledGBPAmountTotal: 0,
            selectedCount : 0
        };

        this.ecfReconciliationClaimFinancialItems.forEach((ecfReconClaimFinancialItems: EcfReconciliationClaimFinancialItem) => {
            if (ecfReconClaimFinancialItems.shouldBeReconciled) {
                if (this.selectedEcfReconciliation && this.selectedEcfReconciliation.currencyId === BankCurrencies.Gbp) {
                    result.reconciledGBPAmountTotal += ecfReconClaimFinancialItems.gbpAmount;
                } else {
                    result.reconciledAmountTotal += ecfReconClaimFinancialItems.amount;
                }
            }
        });

        if (this.selectedEcfReconciliation && this.selectedEcfReconciliation.currencyId === BankCurrencies.Gbp) {
            result.reconciledGBPAmountTotal -= this.ecfReconciliationClaimFinancialItemsForm.get("ecfAmount").value;
            result.reconciledAmountTotal = null;
        } else {
            result.reconciledAmountTotal -= this.ecfReconciliationClaimFinancialItemsForm.get("ecfAmount").value;
        }

        this.ecfReconciliationClaimFinancialItemsTotals = result;
    }

    private preparePinnedBottomSelectedTotalRow(rows: any[]): void {
        this.recalculateSelectedTotals();
        const selectedCount: number = this.ecfReconciliationClaimFinancialItemsSelectedTotals.selectedCount;

        if (selectedCount > 0) {
            rows.push(this.getPinnedRowData(`Selected Total(${selectedCount})`, this.ecfReconciliationClaimFinancialItemsSelectedTotals));
        }
    }

    private recalculateSelectedTotals(): void {
        const result: EcfReconciliationClaimFinancialItemsTotals = {
            reconciledAmountTotal: 0,
            reconciledGBPAmountTotal: 0,
            selectedCount : 0
        };

        this.hasChangedEcfReconciliations = false;

        this.ecfReconciliationClaimFinancialItems.forEach((ecfReconClaimFinancialItems: EcfReconciliationClaimFinancialItem) => {

            if (ecfReconClaimFinancialItems.shouldBeReconciled != ecfReconClaimFinancialItems.isReconciled ) {
                   this.hasChangedEcfReconciliations = true;
            }

            if (ecfReconClaimFinancialItems.shouldBeReconciled) {
                if (this.selectedEcfReconciliation && this.selectedEcfReconciliation.currencyId === BankCurrencies.Gbp) {
                    result.reconciledGBPAmountTotal += ecfReconClaimFinancialItems.gbpAmount;
                }
                result.reconciledAmountTotal += ecfReconClaimFinancialItems.amount;
                result.selectedCount += 1;
            }
        });

        this.ecfReconciliationClaimFinancialItemsSelectedTotals = result;
    }

    private getPinnedRowData(label: string, totals: EcfReconciliationClaimFinancialItemsTotals): any {
        const rowDataObject: any = {};
        for (const col of this.ecfReconciliationClaimFinancialItemsGridColumns) {
            switch (col.field) {
                case "shouldBeReconciled":
                    rowDataObject[col.field] = label;
                    break;
                case "amount":
                    rowDataObject["amount"] = totals.reconciledAmountTotal;
                    break;
                case "gbpAmount":
                    if (this.selectedEcfReconciliation && this.selectedEcfReconciliation.currencyId === BankCurrencies.Gbp) {
                        rowDataObject["gbpAmount"] = totals.reconciledGBPAmountTotal;
                    }
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
