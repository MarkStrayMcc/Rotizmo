import { DecimalPipe } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { AgGridColumnDefinition } from "@app/finance/ledger/AgGridColumnDefinition";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { LEDGER_CURRENCIES } from "@finance/shared/ledger.currencies";
import { LedgerFilter } from "@app/finance/view-models/ledger-filter";
import { CfcBankAccount } from "@app/models/auto-generated/CfcBankAccount";
import { FinancialLedgerInfo, FinancialTransactionDetail } from "@app/models";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { FinanceHttpService } from "@app/services/finance-http.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { RowNode } from "ag-grid";
import { AgGridNg2 } from "ag-grid-angular";
import * as moment from "moment";
import { Observable, Subject, Subscription} from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { FinancialTransactionsTotals } from "@app/finance/view-models/financial-transactions-totals";
import { LedgerAddTransactionModalService } from "@app/services/finance/add-transaction-modal/modal-service/ledger-add-transaction-modal-service";
import { TransactionModalContext } from "@app/services/finance/add-transaction-modal/modal-service/TransactionModalContext";

@Component({
    selector: "ledger-component",
    templateUrl: "ledger.component.html",
    styleUrls: ["ledger.component.scss"],
    /**
     * https://blog.thoughtram.io/angular/2015/06/29/shadow-dom-strategies-in-angular2.html
     * https://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/
     */
    encapsulation: ViewEncapsulation.None
})
export class LedgerComponent implements OnInit, OnDestroy {
    public financeTransactionsForm: FormGroup;
    private ngUnsubscribe: Subject<any> = new Subject();

    public financialTransactionAddedResult: FinancialTransactionDetail;

    public transactions: FinancialTransactionDetail[];
    public financialGridColumns: AgGridColumnDefinition[];
    public defaultColumnDef;

    public displayInformationalMessageForInputFields: boolean;

    public supportedCurrencyCodes = LEDGER_CURRENCIES;

    public cfcBankAccounts: Observable<CfcBankAccount[]>;
    private gridApi;

    public pinnedBottomRowData;
    private financialTransactionsTotals: FinancialTransactionsTotals;
    public ledgerReferences: Observable<FinancialLedgerInfo[]>;

    private selectedLedgerFilter: LedgerFilter;
    private currentUpdateTransactionsSubscription: Subscription;

    @ViewChild("agGrid", { static: true }) public agGrid: AgGridNg2;
    public frameworkComponents: { customPinnedRowRenderer: typeof CustomPinnedRowRenderer; };
    public getRowStyle: (params: any) => { "font-weight": string; } | { "font-weight"?: undefined; };
    public gridCellContext: {
        matIconText: string,
        reverseTooltip: string,
        reverseClickCallback: (data: any) => void
    };

    // Set this to something if you want the grid to scroll to it when adding it to the grid
    public scrollToDetails: FinancialTransactionDetail = null;

    constructor(
        private readonly cfcBankAccountHttpService: CfcBankAccountService,
        private readonly transactionService: FinanceHttpService,
        private readonly appCommunicationService: AppCommunicationService,
        private readonly titleService: Title,
        private readonly formBuilder: FormBuilder,
        private readonly ledgerReferenceService: LedgerReferenceHttpService,
        private readonly decimalPipe: DecimalPipe,
        private readonly ledgerModalService: LedgerAddTransactionModalService
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
        this.financialGridColumns = this.transactionService.getColumns();
        this.defaultColumnDef = this.transactionService.getDefaultColumn();
        this.financialTransactionsTotals = {
            bankAccountAmountTotal: 0,
            originalAmountTotal: 0
        };

        this.setPinnedBottomRowData();
        this.frameworkComponents = { customPinnedRowRenderer: CustomPinnedRowRenderer };
        this.getRowStyle = params => {
            if (params.node.rowPinned) {
                return { "font-weight": "bold" };
            }
            return {};
        };
        this.gridCellContext = {
            matIconText: "replay",
            reverseTooltip: "Reverse Transaction",
            reverseClickCallback: (financialTransactionDetail: any) => {
                this.onReverseTransactionClick(financialTransactionDetail, this);
            }
        };
    }

    public onReverseTransactionClick(financialTransactionDetail: FinancialTransactionDetail,
                                     ledgerComponent: LedgerComponent) {
        // show confirm and call service here
        if (confirm("Are you sure you wish to reverse Transaction: " +
            financialTransactionDetail.financialTransactionId +
            " for " +
            this.decimalPipe.transform(financialTransactionDetail.bankAccountAmount, "1.2-2") + "?")) {
            ledgerComponent.transactionService.reverseTransaction(financialTransactionDetail.financialTransactionId)
                .subscribe(reversed => {
                    ledgerComponent.scrollToDetails = reversed;
                    ledgerComponent.updateTransactions();
                });
        }
    }

    public ngOnInit() {
        this.financeTransactionsForm = this.formBuilder.group({
            cfcBankAccountName: [null],
            transactionsCurrencyId: [null],
            financialLedgerId: [null, [AutocompleteSelectedValidator]]
        });

        this.selectedLedgerFilter = new LedgerFilter();
        this.selectedLedgerFilter.bankAccountName = null;
        this.selectedLedgerFilter.ledgerReference = null;
        this.selectedLedgerFilter.bankAccountCurrencyId = null;

        // setup event handling here!
        this.financeTransactionsForm
            .controls
            .cfcBankAccountName
            .valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.scrollToDetails = null;
                this.onCfcBankAccountChanged(data);
            });

        this.financeTransactionsForm
            .controls
            .transactionsCurrencyId
            .valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
                this.scrollToDetails = null;
                this.onCurrencyChange(data);
            });

        this.financeTransactionsForm
            .controls
            .financialLedgerId
            .valueChanges
            .pipe(
                debounceTime(500),
                takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.scrollToDetails = null;
                this.onLedgerReferenceChanged();
            });

        this.ledgerReferences = this.ledgerReferenceService.getLedgerReferences();
        // this initialisation is required to not display Loading... in the AgGrid.
        this.transactions = [];
        this.cfcBankAccounts = this.cfcBankAccountHttpService
            .getBankAccounts();
        this.updateTransactions();
        // set the title to finance ledger
        this.titleService.setTitle("Financial Ledger");
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.appCommunicationService.removeClass();
    }

    private clearPinnedBottomRowData(): void {
        if (this.gridApi) {
            this.gridApi.setPinnedBottomRowData([]);
        }
    }

    public onCfcBankAccountChanged(selectedBankAccountName: string): void {
        this.clearPinnedBottomRowData();
        // only set selectedLedgerFilter.bankAccountName, if it is any different what is already selected.
        if (this.selectedLedgerFilter.bankAccountName != selectedBankAccountName) {
            this.selectedLedgerFilter.bankAccountName = selectedBankAccountName;
            this.updateTransactions();
        }
        this.displayInformationalMessageForInputFields = false;
    }

    private setSelectedBankAccountCurrencyId(selectedCurrencyId: string): void  {
        const parsedIntSelectedCurrency = parseInt(selectedCurrencyId);
        if (parsedIntSelectedCurrency) {
            if (this.selectedLedgerFilter.bankAccountCurrencyId !=
                parsedIntSelectedCurrency) {
                this.selectedLedgerFilter.bankAccountCurrencyId = parsedIntSelectedCurrency;
            }
        } else {
            this.selectedLedgerFilter.bankAccountCurrencyId = null;
        }
    }

    private toggleInputValidationErrorMessage() {
        if (
            (this.selectedLedgerFilter.ledgerReference &&
                    this.selectedLedgerFilter.bankAccountCurrencyId) ||
                (this.selectedLedgerFilter.bankAccountCurrencyId &&
                    this.selectedLedgerFilter.bankAccountName) ||
                (this.selectedLedgerFilter.bankAccountName)
        ) {
            this.displayInformationalMessageForInputFields = false;
        } else {
            this.displayInformationalMessageForInputFields = true;
        }
    }

    public onCurrencyChange(selectedCurrencyId: string): void {
        this.clearPinnedBottomRowData();
        this.setSelectedBankAccountCurrencyId(selectedCurrencyId);
        this.toggleInputValidationErrorMessage();
        this.updateTransactions();
    }

    public onLedgerReferenceChanged(): void {
        this.clearPinnedBottomRowData();
        let selectedLedgerReference = "";

        if (this.financeTransactionsForm.controls.financialLedgerId.value &&
            this.financeTransactionsForm.controls.financialLedgerId.value.ledgerReference) {
            selectedLedgerReference = this.financeTransactionsForm.controls.financialLedgerId.value.ledgerReference;
        }

        if (this.selectedLedgerFilter.ledgerReference != selectedLedgerReference) {
            this.selectedLedgerFilter.ledgerReference = selectedLedgerReference;
            this.toggleInputValidationErrorMessage();
            this.updateTransactions();
        }
    }

    public getRowNodeId(data: FinancialTransactionDetail) {
        return data.financialTransactionId.toString();
    }

    // so we can give each row its own id for help with automation
    public getBusinessKeyForNode(node: RowNode) {
        return (node.data as FinancialTransactionDetail).financialTransactionId;
    }

    // This happens when we call setRowData. The scroll details are so we know where to scroll
    public onRowDataChanged(event, scrollToDetails) {
        if (scrollToDetails) {
            const node = event.api.getRowNode(scrollToDetails.financialTransactionId.toString());
            event.api.ensureNodeVisible(node, "middle");
        }
    }

    private updateTransactions() {
        if (this.currentUpdateTransactionsSubscription) {
            this.currentUpdateTransactionsSubscription.unsubscribe();
        }

        this.currentUpdateTransactionsSubscription = this.transactionService
            .getTransactions(this.selectedLedgerFilter.bankAccountName,
                this.selectedLedgerFilter.ledgerReference,
                this.selectedLedgerFilter.bankAccountCurrencyId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(t => {
                    if (t.financialTransactionDetails) {
                        this.transactions = this.formatTransaction(t.financialTransactionDetails);
                    } else {
                        this.transactions = [];
                    }
                    this.updateTransactionGrid();
                },
                () => {
                    this.transactions = [];
                    this.updateTransactionGrid();
                });
    }

    private updateTransactionGrid() {
        if (this.gridApi) {
            this.gridApi.setRowData(this.transactions);
        }
        this.setPinnedBottomRowData();
    }

    /**
     * Updates this.bankAccountAmountSum
     * When a filter on the grid is applied, then it is updated with the sum of the filtered rows
     * Else updated with total rows.
     * @param financialTransactions
     */
    private updateAmountTotals(financialTransactions: FinancialTransactionDetail[]) {
        this.financialTransactionsTotals = {
            bankAccountAmountTotal: 0,
            originalAmountTotal: 0
        };
        const filteredNodes = this.getFilteredRowsIfFilterAppliedOnGrid();
        if (filteredNodes && filteredNodes.hasOwnProperty("length") && filteredNodes.length > 0) {
            filteredNodes.forEach((rowNode: RowNode) => {
                this.financialTransactionsTotals.bankAccountAmountTotal += rowNode.data.bankAccountAmount;
                this.financialTransactionsTotals.originalAmountTotal += rowNode.data.originalAmount;
            });
        } else {
            if (financialTransactions &&
                financialTransactions.hasOwnProperty("length") &&
                financialTransactions.length > 0) {
                financialTransactions.forEach(trans => {
                    this.financialTransactionsTotals.bankAccountAmountTotal += trans.bankAccountAmount;
                    this.financialTransactionsTotals.originalAmountTotal += trans.originalAmount;
                });
            }
        }
    }

    private formatTransaction(transactions: FinancialTransactionDetail[]): FinancialTransactionDetail[] {
        return transactions.map(t => {
            t.description = ((t.binderDescription) ? t.binderDescription + " " : "") +
                ((t.sectionShortCode) ? t.sectionShortCode + " " : "") +
                ((t.sectionDescription) ? t.sectionDescription + " " : "") +
                ((t.binderYearNo) ? t.binderYearNo + " " : "");
            t.entryDateFormattedString = moment(t.entryDate.toLocaleString(), "YYYY-MM-DD").locale("en-gb").format("L");
            t.paidDateFormattedString = moment(t.paidDate.toLocaleString(), "YYYY-MM-DD").locale("en-gb").format("L");
            return t;
        });
    }

    private getFilteredRowsIfFilterAppliedOnGrid(): RowNode[] {
        const rowsAfterFilter: RowNode[] = [];
        if (this.gridApi) {
            this.gridApi.forEachNodeAfterFilter((rowNode: RowNode) => {
                rowsAfterFilter.push(rowNode);
            });
        }
        return rowsAfterFilter;
    }

    public setPinnedBottomRowData() {
        const result = [];
        let selectedNodes: any[];
        this.updateAmountTotals(this.transactions);
        if (this.gridApi) {
            selectedNodes = this.gridApi.getSelectedNodes();
            result.push(this.getPinnedRowData("Total", this.financialTransactionsTotals));
            if (selectedNodes && selectedNodes.hasOwnProperty("length") && selectedNodes.length > 0) {
                result.push(this.getPinnedRowData("Selected Total(" + selectedNodes.length + ")", this.getSumOfSelectedRows(selectedNodes)));
            }
            this.pinnedBottomRowData = result;
            this.gridApi.setPinnedBottomRowData(this.pinnedBottomRowData);
        }
    }

    private getPinnedRowData(totalOrSelectedTotal: string, financialTransactionsTotals: FinancialTransactionsTotals): any {
        const rowDataObject: any = {};
        const bankAccountAmountRoundedToTwoDigits = Math.round(financialTransactionsTotals.bankAccountAmountTotal * 100) / 100;
        const originalAmountRoundedToTwoDigits = Math.round(financialTransactionsTotals.originalAmountTotal * 100) / 100;
        for (const col of this.financialGridColumns) {
            switch (col.field) {
                case "bankAccountName":
                    rowDataObject[col.field] = totalOrSelectedTotal;
                    break;
                case "bankAccountAmount":
                    rowDataObject[col.field] = bankAccountAmountRoundedToTwoDigits;
                    break;
                case "originalAmount":
                    rowDataObject[col.field] = originalAmountRoundedToTwoDigits;
                    break;
                default:
                    break;
            }
        }
        return rowDataObject;
    }

    /**
     * Open the Add Transaction (with Outstanding Funds "capabilities") Modal Dialog
     */
    openAddTransactionDialog() {
        const transactionModalContext = { financialTransactionDetail: this.financialTransactionAddedResult } as TransactionModalContext;
        this.ledgerModalService.openModal(
            transactionModalContext,
            updatedTransactionModalContext => {
                if (updatedTransactionModalContext.cfcBankAccount) {
                    // A transaction was successfully added so refresh grid.
                    this.scrollToDetails = updatedTransactionModalContext.financialTransactionDetail;
                    this.financeTransactionsForm.patchValue({
                        cfcBankAccountName: updatedTransactionModalContext.cfcBankAccount.bankAccountName,
                        transactionsCurrencyId: updatedTransactionModalContext.cfcBankAccount.bankAccountCurrencyId,
                        financialLedgerId: updatedTransactionModalContext.financialLedger
                    }, { emitEvent: false });
                    this.selectedLedgerFilter.bankAccountName = updatedTransactionModalContext.cfcBankAccount.bankAccountName;
                    this.selectedLedgerFilter.bankAccountCurrencyId = updatedTransactionModalContext.cfcBankAccount.bankAccountCurrencyId;
                    this.selectedLedgerFilter.ledgerReference = updatedTransactionModalContext.financialLedger.ledgerReference;
                    this.updateTransactions();
                }
            }
        );
    }

    private getSumOfSelectedRows(selectedNodes: any): FinancialTransactionsTotals {
        const selectedData = selectedNodes.map(node => node.data);
        const financialTransactionsSum = {
            bankAccountAmountTotal: 0,
            originalAmountTotal: 0
        };
        selectedData.forEach(element => {
            if (element.hasOwnProperty("bankAccountAmount")) {
                financialTransactionsSum.bankAccountAmountTotal += element.bankAccountAmount;
            }
            if (element.hasOwnProperty("originalAmount")) {
                financialTransactionsSum.originalAmountTotal += element.originalAmount;
            }
        });
        return financialTransactionsSum;
    }

    public ledgerReferenceDisplay(item: FinancialLedgerInfo): string {
        if (item) {
            // This is a hack to deal with the auto validator
            (item as any).value = item.financialLedgerId;
            return item.ledgerReference;
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
    }

    public clearFilters() {
        this.agGrid.api.deselectAll();
        this.agGrid.api.setFilterModel(null);
    }
}
