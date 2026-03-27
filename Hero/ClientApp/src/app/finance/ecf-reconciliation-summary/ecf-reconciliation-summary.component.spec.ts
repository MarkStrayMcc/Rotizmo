import { DecimalPipe } from "@angular/common";
import { Router } from "@angular/router";
import { async, ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { BrowserModule, By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AgGridComponentsModule } from "@app/ag-grid/AgGridComponentsModule.module";
import { CheckDisplayComponent } from "@app/ag-grid/check-display/check-display.component";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { DialogComponent } from "@app/components/dialog/dialog.component";
import { MessageComponent } from "@app/components/message/message.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { NumberMaskDirective } from "@app/directives/number-mask.directive";
import { AddReconciliationModalComponent } from "@app/finance/add-reconciliation/add-reconciliation-modal.component";
import {
    ECF_RECONCILIATION_SUMMARY_COLUMNS,
    ECF_RECONCILIATION_SUMMARY_DEFAULT_COLUMN
} from "@app/finance/ecf-reconciliation-summary/ecf-reconciliation-summary.columns";
import { EcfReconciliationSummaryComponent } from "@app/finance/ecf-reconciliation-summary/ecf-reconciliation-summary.component";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { LEDGER_CURRENCIES } from "@finance/shared/ledger.currencies";
import { MaterialModule } from "@app/material/material.module";
import {
  BinderLookup,
  BinderSectionLookup,
  CfcContact,
  Currency,
  EcfReconciliationSummary,
  DropDownItem,
  FinancialLedgerLookup,
  UcrLookup
} from "@app/models";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { BinderHttpService } from "@app/services/binder-http.service";
import { EcfReconciliationGroupHttpService } from "@app/services/ecf-reconciliation-group-http.service";
import { EcfReconciliationSummaryHttpService } from "@app/services/ecf-reconciliation-summary-http.service";
import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { ErrorModule } from "@app/shared/error.module";
import { AgGridModule } from "ag-grid-angular";
import { ReplaySubject, Observable , of} from "rxjs";
import { NgModule } from "@angular/core";
import { UserService } from "@app/services/user.service";
import { SummaryFilterHandlerService } from "@app/finance/ecf-reconciliation/summary/summary-filter-handler.service";

xdescribe("ecf-reconciliation-summary component",
    () => {
        // To avoid importing the whole Shared Module we use TestModule instead
        @NgModule({
            declarations: [DialogComponent],
            imports: [
                BrowserModule,
                MatDialogModule,
                MaterialModule
            ]
        })
        class TestModule {
        }

        const binderSectionTest: BinderSectionLookup = {
            binderId: 1,
            sectionId: 1,
            sectionDescription: "",
            shortCode: "",
            allowedLloydsRiskCodes: []
        };

        const binderTest: BinderLookup = {
            binderId: 1,
            binderDescription: "",
            binderYear: "2000"
        };

        const financialLedgerTest: FinancialLedgerLookup = {
            financialLedgerId: 1,
            ledgerReference: "1",
            binderId: 1,
            binderYear: "2000",
            sectionId: 1,
            binderSectionIds: [binderSectionTest.binderId],
            lloydsRiskCodes: ["RC"]
        };

        const testEuroCurrency: Currency = {
        id: 1,
        name: "Euro",
        isoCode: "EUR",
        symbol: "€"
    } as Currency;


        class MockEcfReconciliationHttpService {
            public getEcfUcrLookups() { return of(["UCR1", "UCR2"]); }
        }

        class MockEcfReconciliationSummaryHttpService {
            public getEcfReconciliationSummaries(
                ucr: string,
                currencyId: number,
                financialLedgerId: number,
                binderId: number,
                sectionId: number,
                riskCode: string,
                unreconciledOnly: boolean) {
                return of([]);
            }

            public getColumns(): any[] { return ECF_RECONCILIATION_SUMMARY_COLUMNS; }

            public getDefaultColumn() { return ECF_RECONCILIATION_SUMMARY_DEFAULT_COLUMN; }

            public getCurrencies() { return LEDGER_CURRENCIES; }
        }

        class MockEcfReconciliationGroupHttpService {
            public reconcileEcfReconciliations(reconciliationIds: number[]): Observable<number[]> {
                return of([]);
            }

            public unreconcileEcfReconciliation(reconciliationGroupIdsToDelete: number[]): Observable<number[]> {
                return of([]);
            }
        }

        class MockLedgerReferenceHttpService {
            public getLedgerReferences() { return of([]); }

            public getLedgerLookups() { return of([financialLedgerTest]); }
        }

        class MockBinderHttpService {
            public getBinderLookups() { return of([binderTest]); }

            public getBinderSectionLookups() { return of([binderSectionTest]); }
        }

        class MockUserService {
            public getData(): Observable<CfcContact> {
                const subject = new ReplaySubject<CfcContact>(1);
                subject.next(new CfcContact());
                return subject.asObservable();
            }
            public getUser() {
                const contact = new CfcContact();
                contact.cfcContactId = 123;
                return contact;
            }
            public isFeatureAccessible(): boolean { return true; }
        }

        class MockSummaryFilterHandlerService {
            public loadFilters() { return of(null); }
            public onLedgerChanged(selectedLedger: FinancialLedgerLookup): void { }
            public onBinderChanged(selectedBinder: BinderLookup): void { }
            public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void { }
        }

        let confirmationResult = true;

        class MatDialogMock {
            open() {
                return {
                    afterClosed: () => of(confirmationResult)
                };
            }
        }

        class MockModalDialogService {
            afterClosed() {
                return {
                    afterClosed: () => of(confirmationResult)
                };
            }
        }

        let component: EcfReconciliationSummaryComponent;
        let fixture: ComponentFixture<EcfReconciliationSummaryComponent>;
        let dialog: MatDialogMock;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    EcfReconciliationSummaryComponent,
                    AddReconciliationModalComponent,
                    MessageComponent,
                    Datepicker,
                    CurrencyComponent,
                    LargeNumberMask,
                    NumberMaskDirective,
                    AutocompleteDropdown
                ],
                imports: [
                    BrowserModule,
                    BrowserAnimationsModule,
                    FormsModule,
                    MatDialogModule,
                    MaterialModule,
                    MatTabsModule,
                    ReactiveFormsModule,
                    ErrorModule,
                    AgGridComponentsModule,
                    AgGridModule.withComponents([
                        CustomPinnedRowRenderer,
                        GridHeaderComponent,
                        CheckDisplayComponent,
                        FinanceNumberDisplayComponent
                    ]),
                    TestModule
                ],
                providers: [
                    { provide: ComponentFixtureAutoDetect, useValue: true },
                    { provide: EcfReconciliationSummaryHttpService, useClass: MockEcfReconciliationSummaryHttpService },
                    { provide: EcfReconciliationHttpService, useClass: MockEcfReconciliationHttpService },
                    { provide: EcfReconciliationGroupHttpService, useClass: MockEcfReconciliationGroupHttpService },
                    { provide: LedgerReferenceHttpService, useClass: MockLedgerReferenceHttpService },
                    { provide: BinderHttpService, useClass: MockBinderHttpService },
                    { provide: AppCommunicationService },
                    { provide: ModalDialogService },
                    { provide: MatDialog, useClass: MatDialogMock },
                    { provide: ModalDialogService, useClass: MockModalDialogService },
                    { provide: UserService, useClass: MockUserService },
                    { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                    { provide: SummaryFilterHandlerService, useClass: MockSummaryFilterHandlerService },
                    FilterContextService,
                    ErrorMessageHandlerService,
                    MessageService,
                    DecimalPipe
                ]
            });

            fixture = TestBed.createComponent(EcfReconciliationSummaryComponent);
            component = fixture.componentInstance;
    }));

        it("should create component",
            () => {
                expect(component).toBeDefined();
            });

        it("should trigger update grid when UCR changes",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const selectedUcr = new DropDownItem("UCR1", "UCR1", "");
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.ucr.setValue(selectedUcr);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.any()).toBeTruthy();
            }) as any);

        it("should update FilterService when UCR changes",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const selectedUcr = new UcrLookup();
                selectedUcr.reference = "UCR1";
                const ecfReconciliationFilterService = fixture.debugElement.injector.get(FilterContextService);

                // Act
                component.ecfReconciliationForm.controls.ucr.setValue(selectedUcr);
                tick(1000); // debounce

                // Assert
                expect(ecfReconciliationFilterService.ucr.reference).toBe(selectedUcr.reference);
            }) as any);

        it("should not trigger update grid when Currency changes but ucr, binder or ledger is not selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.currencyId.setValue(testEuroCurrency);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.any()).toBeFalsy();
            }) as any);

        it("should trigger update grid when Currency changes and UCR is selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const selectedUcr = new DropDownItem("UCR1", "UCR1", "");
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.ucr.setValue(selectedUcr);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.currencyId.setValue(testEuroCurrency);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.count()).toBe(2);
            }) as any);

        it("should trigger update grid when Currency changes and Binder is selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.binderId.setValue(binderTest);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.currencyId.setValue(testEuroCurrency);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.count()).toBe(1);
            }) as any);

        it("should trigger update grid when Currency changes and Financial Ledger is selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.financialLedgerId.setValue(financialLedgerTest);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.currencyId.setValue(testEuroCurrency);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.count()).toBe(1);
            }) as any);

        it("shouldn't trigger update grid when UnreconciledOnly changes but ucr, binder or ledger is not selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.unreconciledOnly.setValue(false);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.any()).toBeFalsy();
            }) as any);

        it("should trigger update grid when UnreconciledOnly changes and UCR is selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const selectedUcr = new DropDownItem("UCR1", "UCR1", "");
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.ucr.setValue(selectedUcr);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.unreconciledOnly.setValue(false);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.count()).toBe(2);
            }) as any);

        it("should trigger update grid when UnreconciledOnly changes and Binder is selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.binderId.setValue(binderTest);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.unreconciledOnly.setValue(false);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.count()).toBe(1);
            }) as any);

        it("should trigger update grid when UnreconciledOnly changes and Financial Ledger is selected",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.financialLedgerId.setValue(financialLedgerTest);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.unreconciledOnly.setValue(false);
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.count()).toBe(1);
            }) as any);

        it("should not trigger update grid when ledger, binder, binder section or risk code are changed",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();

                // Act
                component.ecfReconciliationForm.controls.financialLedgerId.setValue(financialLedgerTest);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.binderId.setValue(binderTest);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.sectionId.setValue(binderSectionTest);
                tick(1000); // debounce
                component.ecfReconciliationForm.controls.riskCode.setValue("RC");
                tick(1000); // debounce

                // Assert
                expect(getSpy.calls.any()).toBeFalsy();
            }) as any);

        it("should trigger update on fetch click",
            async(() => {
                // Arrange
                fixture.detectChanges();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .callThrough();
                component.isShowFilters = true;
                fixture.detectChanges();
                const button = fixture.debugElement.query(By.css("#fetchButton"));

                // Act
                button.triggerEventHandler("click", null);

                // Assert
                expect(getSpy.calls.any()).toBeTruthy();
            }));

        it("should calculate totals correctly",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const selectedUcr = new DropDownItem("UCR1", "UCR1", "");
                const ecfReconciliationSummaries = getEcfReconciliationSummaries();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .returnValue(
                        of(ecfReconciliationSummaries));

                // Act
                component.ecfReconciliationForm.controls.ucr.setValue(selectedUcr);
                tick(1000); // debounce

                // Assert
                expect(component.ecfReconciliationSummaryTotals.claimFinancialItemsDifferenceTotal).toBe(300);
                expect(component.ecfReconciliationSummaryTotals.financialTransactionsTotal).toBe(275);
                expect(component.ecfReconciliationSummaryTotals.ecfAmountTotal).toBe(375);
            }) as any);

        it("should calculate selected totals correctly",
            fakeAsync((): void => {
                // Arrange
                fixture.detectChanges();
                const selectedUcr = new DropDownItem("UCR1", "UCR1", "");
                const ecfReconciliationSummaries = getEcfReconciliationSummaries();
                const ecfReconciliationSummaryHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationSummaryHttpService);
                const getSpy = spyOn(ecfReconciliationSummaryHttpService, "getEcfReconciliationSummaries").and
                    .returnValue(
                    of(ecfReconciliationSummaries));

                // Act
                component.ecfReconciliationForm.controls.ucr.setValue(selectedUcr);
                tick(1000);
                component.agGrid.api.forEachNode(row => {
                    const rowNo = row.rowIndex + 1;
                    if (rowNo % 2 !== 0) {
                        row.selectThisNode(true);
                    }
                });
                component.setPinnedBottomRowData();
                tick(1000);

                // Assert
                expect(component.ecfReconciliationSummarySelectedTotals.claimFinancialItemsDifferenceTotal).toBe(200);
                expect(component.ecfReconciliationSummarySelectedTotals.financialTransactionsTotal).toBe(175);
                expect(component.ecfReconciliationSummarySelectedTotals.ecfAmountTotal).toBe(275);
            }) as any);

        it("should set up event for the action column click",
            async(() => {
                // Arrange / Act
                const columns = component.ecfReconciliationSummaryGridColumns;
                const actionsColumn = columns.find(column => {
                    return column.headerName === "Actions";
                });

                // Assert
                expect(actionsColumn.onCellClicked).not.toBeNull();
                expect(actionsColumn.onCellClicked).not.toBeUndefined();
            }));

        it("should display reconcile button only when not-reconciled items are selected",
            async(() => {
                // Arrange
                component.selectedReconciledItems = 0;
                component.selectedNotReconciledItems = 10;
                component.selectedCurrencies = [1];
                fixture.detectChanges();
                const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));
                const unreconcileButton = fixture.debugElement.query(By.css("#unreconcileButton"));

                // Assert
                expect(reconcileButton).toBeDefined();
                expect(unreconcileButton).toBeNull();
            }));

        it("should display unreconcile button only when reconciled items are selected",
            async(() => {
                // Arrange
                component.selectedReconciledItems = 10;
                component.selectedNotReconciledItems = 0;
                component.selectedCurrencies = [1];
                fixture.detectChanges();
                const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));
                const unreconcileButton = fixture.debugElement.query(By.css("#unreconcileButton"));

                // Assert
                expect(unreconcileButton).toBeDefined();
                expect(reconcileButton).toBeNull();
            }));

        it("should not display buttons when reconciled and not-reconciled items are selected",
            async(() => {
                // Arrange
                component.selectedReconciledItems = 10;
                component.selectedNotReconciledItems = 10;
                component.selectedCurrencies = [1];
                fixture.detectChanges();
                const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));
                const unreconcileButton = fixture.debugElement.query(By.css("#unreconcileButton"));

                // Assert
                expect(unreconcileButton).toBeNull();
                expect(reconcileButton).toBeNull();
            }));

        it("should not display reconcile button when more than one currency is selected",
            async(() => {
                // Arrange
                component.selectedReconciledItems = 10;
                component.selectedNotReconciledItems = 10;
                component.selectedCurrencies = [1, 2];
                fixture.detectChanges();
                const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));

                // Assert
                expect(reconcileButton).toBeNull();
            }));

        it("should open confirmation dialog on reconcile button click",
        fakeAsync(() => {
                // Arrange
                confirmationResult = true;
                const dialogInstance = fixture.debugElement.injector.get(MatDialog);
                tick(1000);
                spyOn(dialogInstance, "open").and.callThrough();
                tick(2000);
                component.selectedReconciledItems = 0;
                component.selectedNotReconciledItems = 10;

                fixture.detectChanges();
                // Act
                component.onReconcile();
                tick(2000);
                // Assert
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    tick(2000);
                    expect(dialogInstance.open).toHaveBeenCalled();
                });
            }));

        it("should open confirmation dialog on unreconcile button click",
            async(() => {
                // Arrange
                confirmationResult = true;
                const dialogInstance = fixture.debugElement.injector.get(MatDialog);
                spyOn(dialogInstance, "open").and.callThrough();
                component.selectedReconciledItems = 10;
                component.selectedNotReconciledItems = 0;
                fixture.detectChanges();

                // Act
                component.onUnreconcile();

                // Assert
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    expect(dialogInstance.open).toHaveBeenCalled();
                });
            }));

        it("should open the warning on reconcile button click when CFI+- or FT+- not equal 0",
            async(() => {
                // Arrange
                component.selectedReconciledItems = 0;
                component.selectedNotReconciledItems = 10;
                component.selectedCurrencies = [1];
                component.ecfReconciliationSummarySelectedTotals.claimFinancialItemsDifferenceTotal = 0;
                component.ecfReconciliationSummarySelectedTotals.financialTransactionsTotal = 100;
                fixture.detectChanges();

                const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));
                const matDialog = fixture.debugElement.injector.get(MatDialog);
                const getSpy = spyOn(matDialog, "open").and.callThrough();

                // Act
                reconcileButton.triggerEventHandler("click", null);

                // Assert
                expect(getSpy.calls.any()).toBeTruthy();
            }));

        it("should not call the service on reconcile button click when CFI+- or FT+- equal 0",
            async(() => {
                // Arrange
                component.selectedReconciledItems = 0;
                component.selectedNotReconciledItems = 10;
                component.selectedCurrencies = [1];
                component.ecfReconciliationSummarySelectedTotals.claimFinancialItemsDifferenceTotal = 100;
                component.ecfReconciliationSummarySelectedTotals.financialTransactionsTotal = 200;
                fixture.detectChanges();

                const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));
                const ecfReconciliationGroupHttpService =
                    fixture.debugElement.injector.get(EcfReconciliationGroupHttpService);
                const getSpy = spyOn(ecfReconciliationGroupHttpService, "reconcileEcfReconciliations").and
                    .callThrough();

                // Act
                reconcileButton.triggerEventHandler("click", null);

                // Assert
                expect(getSpy.calls.any()).toBeFalsy();
            }));

        function getEcfReconciliationSummaries(): EcfReconciliationSummary[] {
            return [
                {
                    ecfReconciliationId: 1,
                    ucr: "Test 1",
                    sequenceNo: 1,
                    ecfAmount: 200,
                    claimFinancialItemsDifference: 150,
                    financialTransactionsDifference: 100,
                    currency: {
                        id: 3,
                        isoCode: "GBP",
                        symbol: "£",
                        name: "GBP",
                        rate: 1.0
                    },
                    completedDate: new Date(Date.now()),
                    completedDateFormattedString: "",
                    reconciledGroupId: 0,
                    sequenceTag: ""
                }, {
                    ecfReconciliationId: 2,
                    ucr: "Test 1",
                    sequenceNo: 2,
                    ecfAmount: 100,
                    claimFinancialItemsDifference: 100,
                    financialTransactionsDifference: 100,
                    currency: {
                        id: 3,
                        isoCode: "GBP",
                        symbol: "£",
                        name: "GBP",
                        rate: 1.0
                    },
                    completedDate: new Date(Date.now()),
                    completedDateFormattedString: "",
                    reconciledGroupId: 0,
                    sequenceTag: ""
                }, {
                    ecfReconciliationId: 3,
                    ucr: "Test 1",
                    sequenceNo: 3,
                    ecfAmount: 75,
                    claimFinancialItemsDifference: 50,
                    financialTransactionsDifference: 75,
                    currency: {
                        id: 3,
                        isoCode: "GBP",
                        symbol: "£",
                        name: "GBP",
                        rate: 1.0
                    },
                    completedDate: new Date(Date.now()),
                    completedDateFormattedString: "",
                    reconciledGroupId: 0,
                    sequenceTag: ""
                }
            ];
        }
    });
