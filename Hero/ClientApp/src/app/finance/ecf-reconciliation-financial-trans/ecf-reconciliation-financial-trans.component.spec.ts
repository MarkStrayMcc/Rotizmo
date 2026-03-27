/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { DecimalPipe } from "@angular/common";
import { async, ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { BrowserModule, By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AgGridComponentsModule } from "@app/ag-grid/AgGridComponentsModule.module";
import { CheckDisplayComponent } from "@app/ag-grid/check-display/check-display.component";
import { CheckboxInputComponent } from "@app/ag-grid/checkbox-input/checkbox-input.component";
import { MessageComponent } from "@app/components/message/message.component";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { NumberMaskDirective } from "@app/directives/number-mask.directive";
import { EcfReconciliationFinancialTransComponent } from "@app/finance/ecf-reconciliation-financial-trans/ecf-reconciliation-financial-trans.component";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { MaterialModule } from "@app/material/material.module";
import { ErrorModule } from "@app/shared/error.module";
import { TagInputComponent } from "@app/components/tag-input/tag-input.component";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { BinderHttpService } from "@app/services/binder-http.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { AgGridModule } from "ag-grid-angular";
import { ReplaySubject, Observable, of } from "rxjs";
import { NgModule } from "@angular/core";
import {
  BinderLookup,
  BinderSectionLookup,
  CfcContact,
  EcfReconciliation,
  EcfReconciliationFinancialTransaction,
  FinancialLedgerLookup,
  FinancialTransactionEcfReconciliationRequest,
  UcrLookup
} from "@app/models";
import { ECF_RECONCILIATION_FINANCIAL_TRANS_COLUMNS, ECF_RECONCILIATION_FINANCIAL_TRANS_DEFAULT_COLUMN } from "@app/finance/ecf-reconciliation-financial-trans/ecf-reconciliation-financial-trans.columns";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { DialogComponent } from "@app/components/dialog/dialog.component";
import { FinancialTransactionsFilterHandlerService } from
    "@app/finance/ecf-reconciliation/financial-transactions/financial-transactions-filter-handler.service";

xdescribe("ecf-reconciliation-financial-trans component", () => {
    // To avoid importing the whole Shared Module we use TestModule instead
    @NgModule({
        declarations: [DialogComponent],
        imports: [
            BrowserModule,
            MatDialogModule,
            MaterialModule
        ]
    })
    class TestModule { }

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

    const ecfFinancialTransactions: EcfReconciliationFinancialTransaction[] = [
        {
            entryDateFormattedString: "",
            paidDateFormattedString: "",
            description: "BINDER 1 - A - CY",
            isReconciled: true,
            shouldBeReconciled: true,
            financialTransactionId: 10001,
            entryType: "DB",
            entryDate: new Date(Date.now()),
            transactionType: "LF",
            ledgerReference: "BA930123a",
            binderReference: "BINDER 1",
            binderDescription: "BINDER 1 - A - CY",
            binderYearNo: 2018,
            binderYear: "a",
            sectionDescription: "Row",
            sectionShortCode: "A",
            lloydsRiskCode: "CY",
            tags: "JUN98",
            transactionReference: "C092183928AD",
            insuredCompanyName: "Insured Company Name",
            bankAccountCurrencyName: "GBP",
            bankAccountAmount: 200,
            originalAmountCurrencyName: "ZAR",
            originalAmount: 300,
            paidDate: new Date(Date.now()),
            reverseFinancialTransactionId: 1,
            ecfReconciliationId: 123,
        },
        {
            entryDateFormattedString: "",
            paidDateFormattedString: "",
            description: "BINDER 1 - A - CY",
            isReconciled: false,
            shouldBeReconciled: false,
            financialTransactionId: 10001,
            entryType: "DB",
            entryDate: new Date(Date.now()),
            transactionType: "LF",
            ledgerReference: "BA930123a",
            binderReference: "BINDER 1",
            binderDescription: "BINDER 1 - A - CY",
            binderYearNo: 2018,
            binderYear: "a",
            sectionDescription: "Row",
            sectionShortCode: "A",
            lloydsRiskCode: "CY",
            tags: "JUN98",
            transactionReference: "C092183928AD",
            insuredCompanyName: "Insured Company Name",
            bankAccountCurrencyName: "GBP",
            bankAccountAmount: 200,
            originalAmountCurrencyName: "ZAR",
            originalAmount: 300,
            paidDate: new Date(Date.now()),
            reverseFinancialTransactionId: 1,
            ecfReconciliationId: null,
        }
    ];

    class MockEcfReconciliationHttpService {
        public getEcfUcrLookups() { return of(["UCR1", "UCR2"]); }
        public getEcfReconciliationsFromUcr() { return of([getEcfReconciliations]); }
        public getEcfFinancialTransactions(ecfReconciliationId: number, financialLedgerId: number, binderId: number, sectionId: number, riskCode: string, tags: string) { return of(ecfFinancialTransactions); }
        public reconcileEcfFinancialTransactions(ecfReconciliationRequests: FinancialTransactionEcfReconciliationRequest[])
            : Observable<EcfReconciliationFinancialTransaction[]> { return of([]); }
        public getFinancialTransColumns(): any[] { return ECF_RECONCILIATION_FINANCIAL_TRANS_COLUMNS; }
        public getDefaultFinancialTransColumn() { return ECF_RECONCILIATION_FINANCIAL_TRANS_DEFAULT_COLUMN; }
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

    class MockFinancialTransactionsFilterHandlerService {
        public loadFilters() { return of(null); }
        public onLedgerChanged(selectedLedger: FinancialLedgerLookup): void { }
        public onBinderChanged(selectedBinder: BinderLookup): void { }
        public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void { }
        public onUcrChanged(selectedUcr: UcrLookup): void { }
        public getEcfReconciliationById(id: number): Observable<EcfReconciliation> {
             return of(getEcfReconciliations()[0]);
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

    const mockTitleService = jasmine.createSpyObj("mockTitleService", ["setTitle", "getTitle"]);

    let component: EcfReconciliationFinancialTransComponent;
    let fixture: ComponentFixture<EcfReconciliationFinancialTransComponent>;
    let dialog: MatDialogMock;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                EcfReconciliationFinancialTransComponent,
                LargeNumberMask,
                NumberMaskDirective,
                AutocompleteDropdown,
                TagInputComponent,
                MessageComponent
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
                    CheckboxInputComponent,
                    FinanceNumberDisplayComponent
                ]),
                TestModule
            ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                { provide: EcfReconciliationHttpService, useClass: MockEcfReconciliationHttpService },
                { provide: LedgerReferenceHttpService, useClass: MockLedgerReferenceHttpService },
                { provide: BinderHttpService, useClass: MockBinderHttpService },
                { provide: AppCommunicationService },
                { provide: UserService, useClass: MockUserService },
                { provide: ModalDialogService, useClass: MockModalDialogService },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: FinancialTransactionsFilterHandlerService, useClass: MockFinancialTransactionsFilterHandlerService },
                FilterContextService,
                ErrorMessageHandlerService,
                MessageService
            ]
        });

        fixture = TestBed.createComponent(EcfReconciliationFinancialTransComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
    }));

    it("should create component", () => {
        expect(component).toBeDefined();
    });

     it("should update FilterService when UCR changes",
         fakeAsync((): void => {
             // Arrange
             fixture.detectChanges();
             const ecfReconciliationFilterService = fixture.debugElement.injector.get(FilterContextService);
             const newUcr = new UcrLookup();
             newUcr.reference = "UCR_test";

             // Act
             component.ecfReconciliationFinancialTransForm.controls.ucr.setValue(newUcr);
             tick(1500); // debounce

             // Assert
             expect(ecfReconciliationFilterService.ucr.reference).toBe(newUcr.reference);
             expect(ecfReconciliationFilterService.ecfReconciliationId).toBe(null);
         }) as any);

    it("should trigger update to grid when ECF changes", fakeAsync((): void => {

        // Arrange
        fixture.detectChanges();
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfFinancialTransactions").and.callThrough();

        // Act
        component.ecfReconciliationFinancialTransForm.controls.ucr.setValue({ text: "UCR_test" });
        tick(1000); // debounce

        component.ecfReconciliationFinancialTransForm.controls.ecfReconciliationId.setValue(getEcfReconciliations()[0]);
        tick(1000); // debounce

        // Assert
        expect(getSpy.calls.any()).toBeTruthy();
     }) as any);

     it("should update FilterService when ECF changes",
         fakeAsync((): void => {
             // Arrange
             fixture.detectChanges();
             const ecfReconciliationFilterService = fixture.debugElement.injector.get(FilterContextService);
             const newUcr = new UcrLookup();
             newUcr.reference = "UCR_test";
             const newEcf = getEcfReconciliations()[0];

             // Act
             component.ecfReconciliationFinancialTransForm.controls.ucr.setValue(newUcr);
             tick(1000); // debounce

             component.ecfReconciliationFinancialTransForm.controls.ecfReconciliationId.setValue(newEcf);
             tick(1000); // debounce

             // Assert
             expect(ecfReconciliationFilterService.ucr.reference).toBe(newUcr.reference);
             expect(ecfReconciliationFilterService.ecfReconciliationId).toBe(newEcf.ecfReconciliationId);
         }) as any);

    it("should not trigger update grid when ledger, binder, binder section or risk code are changed", fakeAsync((): void => {
        // Arrange
        fixture.detectChanges();
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfFinancialTransactions").and.callThrough();

        // Act
        component.ecfReconciliationFinancialTransForm.controls.financialLedgerId.setValue(financialLedgerTest);
        tick(1000); // debounce
        component.ecfReconciliationFinancialTransForm.controls.binderId.setValue(binderTest);
        tick(1000); // debounce
        component.ecfReconciliationFinancialTransForm.controls.sectionId.setValue(binderSectionTest);
        tick(1000); // debounce
        component.ecfReconciliationFinancialTransForm.controls.riskCode.setValue("RC");
        tick(1000); // debounce
        component.ecfReconciliationFinancialTransForm.controls.tags.setValue({ value : "JAN18"});
        tick(1000); // debounce

        // Assert
        expect(getSpy.calls.any()).toBeFalsy();
    }) as any);

    it("should not trigger update grid on fetch click if no parameters set", async(() => {
        // Arrange
        fixture.detectChanges();
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfFinancialTransactions").and.callThrough();
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("#fetchButton"));

        // Act
        button.triggerEventHandler("click", null);

        // Assert
        expect(getSpy.calls.any()).toBeFalsy();
    }));

    it("should trigger update grid on fetch click", async(() => {
        // Arrange
        fixture.detectChanges();
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfFinancialTransactions").and.callThrough();
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("#fetchButton"));

        component.ecfReconciliationFinancialTransForm.controls.ucr.setValue({ text: "UCR_test" });
        component.ecfReconciliationFinancialTransForm.controls.ecfReconciliationId.setValue(getEcfReconciliations()[0]);

        // Act
        button.triggerEventHandler("click", null);

        // Assert
        expect(getSpy.calls.any()).toBeTruthy();
    }));

    it("should calculate newly selected totals correctly", fakeAsync((): void => {
        // Arrange
        fixture.detectChanges();
        const ecfReconciliationFinTrans = ecfFinancialTransactions;
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfFinancialTransactions").and.returnValue(
            of(ecfReconciliationFinTrans));

        // Act
        component.ecfReconciliationFinancialTransForm.controls.ucr.setValue({ text: "UCR_test" });
        tick(1000); // debounce

        component.ecfReconciliationFinancialTransForm.controls.ecfReconciliationId.setValue(getEcfReconciliations()[0]);
        tick(1000); // debounce

        component.ecfReconciliationFinancialTrans.forEach(row => {
            row.shouldBeReconciled = true;
        });

        component.setPinnedBottomRowData();
        tick(1000);

        // Assert
        expect(component.ecfReconciliationFinancialTransSelectedTotals.reconciledAmountTotal).toBe(400);
        expect(component.ecfReconciliationFinancialTransSelectedTotals.ecfAmountDifference).toBe(0);
        expect(component.ecfReconciliationFinancialTransSelectedTotals.selectedCount).toBe(2);
    }) as any);


    it("should display reconcile button only when changed reconciliatons and ecf not already reconciled (not saved)", async(() => {
        // Arrange
        component.hasChangedEcfReconciliations = true;
        component.isEcfAlreadyReconciled = false;
        fixture.detectChanges();
        const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));

        // Assert
        expect(reconcileButton).toBeDefined();
    }));

    it("should NOT display reconcile button only when no changed reconciliations", fakeAsync(() => {
        // Arrange
        component.hasChangedEcfReconciliations = false;
        component.isEcfAlreadyReconciled = false;
        fixture.detectChanges();
        const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));

        // Assert
        expect(reconcileButton).toBeNull();
    }));

    it("should NOT display reconcile button only when already reconciled", fakeAsync(() => {
        // Arrange
        component.hasChangedEcfReconciliations = true;
        component.isEcfAlreadyReconciled = true;
        fixture.detectChanges();
        const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));

        // Assert
        expect(reconcileButton).toBeNull();
    }));

     it("should open confirmation dialog on reconcile button click", fakeAsync(() => {
         // Arrange
         component.hasChangedEcfReconciliations = true;
         component.isEcfAlreadyReconciled = false;
         let newEcfFinancialTransactions = ecfFinancialTransactions;

         newEcfFinancialTransactions[1].ecfReconciliationId = 123;

         component.ecfReconciliationFinancialTrans = newEcfFinancialTransactions;

         const dialogInstance = fixture.debugElement.injector.get(MatDialog);
         tick(1000);
         spyOn(dialogInstance, 'open').and.callThrough();
         tick(2000);
         fixture.detectChanges();
         tick(2000);
         const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));

         // Act
         reconcileButton.triggerEventHandler("click", null);
         tick(2000); // debounce

         // Assert
         fixture.whenStable().then(() => {
             fixture.detectChanges();
             tick(2000);
             expect(dialogInstance.open).toHaveBeenCalled();
         });
     }));

    function getEcfReconciliations(): EcfReconciliation[] {
        return [
            {
                ecfReconciliationId: 1,
                ucr: "Test 1",
                currencyId: 1,
                currencyIsoCode: "EUR",
                sequenceNo: 1,
                completedDate: new Date(Date.now()),
                amount: 200,
                reconciledGroupId: 0,
                addedByCfcContactId:111,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId:111,
                lastEditedOn: new Date(Date.now()),
            },
            {
                ecfReconciliationId: 2,
                ucr: "Test 1",
                currencyId: 1,
                currencyIsoCode: "EUR",
                sequenceNo: 2,
                completedDate: new Date(Date.now()),
                amount: 200,
                reconciledGroupId: 123,
                addedByCfcContactId: 123,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId: 123,
                lastEditedOn: new Date(Date.now())
            },
            {
                ecfReconciliationId: 3,
                ucr: "Test 1",
                currencyId: 1,
                currencyIsoCode: "EUR",
                sequenceNo: 3,
                completedDate: new Date(Date.now()),
                amount: 200,
                reconciledGroupId: 123,
                addedByCfcContactId: 456,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId: 456,
                lastEditedOn: new Date(Date.now())
            },
            {
                ecfReconciliationId: 4,
                ucr: "Test 1",
                currencyId: 3,
                currencyIsoCode: "GBP",
                sequenceNo: 1,
                completedDate: new Date(Date.now()),
                amount: 200,
                reconciledGroupId: 0,
                addedByCfcContactId: 789,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId: 789,
                lastEditedOn: new Date(Date.now())
            },
            {
                ecfReconciliationId: 5,
                ucr: "Test 1",
                currencyId: 2,
                currencyIsoCode: "USD",
                sequenceNo: 1,
                completedDate: new Date(Date.now()),
                amount: 200,
                reconciledGroupId: 0,
                addedByCfcContactId: 222,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId: 222,
                lastEditedOn: new Date(Date.now())
            },
        ];
    }

});
