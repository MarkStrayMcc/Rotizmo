/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { DecimalPipe } from "@angular/common";
import { async, ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatTabsModule } from "@angular/material/tabs";
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
import { EcfReconciliationClaimFinancialItemsComponent } from "@app/finance/ecf-reconciliation-claim-financial-items/ecf-reconciliation-claim-financial-items.component";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { MaterialModule } from "@app/material/material.module";
import { ErrorModule } from "@app/shared/error.module";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { BinderHttpService } from "@app/services/binder-http.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { AgGridModule } from "ag-grid-angular";
import { ReplaySubject, Observable, of } from "rxjs";
import { NgModule } from "@angular/core";
import {
  BinderLookup,
  BinderSectionLookup,
  CfcContact,
  ClaimFinancialItemEcfReconciliationRequest,
  EcfReconciliation,
  EcfReconciliationClaimFinancialItem,
  UcrLookup
} from "@app/models";
import { ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_COLUMNS, ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_DEFAULT_COLUMN } from "@app/finance/ecf-reconciliation-claim-financial-items/ecf-reconciliation-claim-financial-items.columns";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { DialogComponent } from "@app/components/dialog/dialog.component";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { ClaimFinancialItemsFilterHandlerService } from
    "@app/finance/ecf-reconciliation/claim-financial-items/claim-financial-items-filter-handler.service";

xdescribe("ecf-reconciliation-claim-financial-items component", () => {
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

    class MockEcfReconciliationHttpService {
        public reconcileEcfClaimFinancialItems(ecfReconciliationRequests: ClaimFinancialItemEcfReconciliationRequest[])
            : Observable<EcfReconciliationClaimFinancialItem[]> { return of([]); }
        public getEcfUcrLookups() { return of(["UCR1", "UCR2"]); }
        public getEcfReconciliationsFromUcr() { return of([getEcfReconciliations]); }
        public getEcfClaimFinancialItems(ecfReconciliationId: number, binderId: number, sectionId: number, riskCode: string)
            { return of([])}
        public getClaimFinancialItemsColumns(): any[] { return ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_COLUMNS; }
        public getDefaultClaimFinancialItemsColumn() { return ECF_RECONCILIATION_CLAIM_FINANCIAL_ITEMS_DEFAULT_COLUMN; }
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

    class MockClaimFinancialItemsFilterHandlerService {
        public loadFilters() { return of(null); }
        public onBinderChanged(selectedBinder: BinderLookup): void { }
        public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void { }
        public onUcrChanged(selectedUcr: UcrLookup): void { }
        public getEcfReconciliationById(id: number): Observable<EcfReconciliation> {
            return of(getEcfReconciliations()[0]);
        }
    }

    const mockTitleService = jasmine.createSpyObj("mockTitleService", ["setTitle", "getTitle"]);

    let component: EcfReconciliationClaimFinancialItemsComponent;
    let fixture: ComponentFixture<EcfReconciliationClaimFinancialItemsComponent>;
    let dialog: MatDialogMock;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                EcfReconciliationClaimFinancialItemsComponent,
                LargeNumberMask,
                NumberMaskDirective,
                AutocompleteDropdown,
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
                { provide: BinderHttpService, useClass: MockBinderHttpService },
                { provide: AppCommunicationService },
                { provide: UserService, useClass: MockUserService },
                { provide: ModalDialogService, useClass: MockModalDialogService },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: ClaimFinancialItemsFilterHandlerService, useClass: MockClaimFinancialItemsFilterHandlerService },
                FilterContextService,
                ErrorMessageHandlerService,
                MessageService
            ]
        });

        fixture = TestBed.createComponent(EcfReconciliationClaimFinancialItemsComponent);
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
            component.ecfReconciliationClaimFinancialItemsForm.controls.ucr.setValue(newUcr);
            tick(2000); // debounce

            // Assert
            expect(ecfReconciliationFilterService.ucr.reference).toBe(newUcr.reference);
            expect(ecfReconciliationFilterService.ecfReconciliationId).toBe(null);
        }) as any);

    it("should trigger update to grid when ECF changes", fakeAsync((): void => {
        // Arrange
        fixture.detectChanges();
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfClaimFinancialItems").and.callThrough();
        // Act
        component.ecfReconciliationClaimFinancialItemsForm.controls.ucr.setValue({ text: "UCR_test" });
        tick(1500); // debounce

        component.ecfReconciliationClaimFinancialItemsForm.controls.ecfReconciliationId.setValue(getEcfReconciliations()[0]);
        tick(1500); // debounce

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
            component.ecfReconciliationClaimFinancialItemsForm.controls.ucr.setValue(newUcr);
            tick(1500); // debounce

            component.ecfReconciliationClaimFinancialItemsForm.controls.ecfReconciliationId.setValue(newEcf);
            tick(1500); // debounce

            // Assert
            expect(ecfReconciliationFilterService.ucr.reference).toBe(newUcr.reference);
            expect(ecfReconciliationFilterService.ecfReconciliationId).toBe(newEcf.ecfReconciliationId);
        }) as any);

    it("should not trigger update grid when binder, binder section or risk code are changed", fakeAsync((): void => {
        // Arrange
        fixture.detectChanges();
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfClaimFinancialItems").and.callThrough();

        // Act
        component.ecfReconciliationClaimFinancialItemsForm.controls.binderId.setValue(binderTest);
        tick(1000); // debounce
        component.ecfReconciliationClaimFinancialItemsForm.controls.sectionId.setValue(binderSectionTest);
        tick(1000); // debounce
        component.ecfReconciliationClaimFinancialItemsForm.controls.riskCode.setValue("RC");
        tick(1000); // debounce

        // Assert
        expect(getSpy.calls.any()).toBeFalsy();
    }) as any);

    it("should not trigger update grid on fetch click if no parameters set", async(() => {
        // Arrange
        fixture.detectChanges();
        const ecfReconciliationHttpService = fixture.debugElement.injector.get(EcfReconciliationHttpService);
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfClaimFinancialItems").and.callThrough();
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
        const getSpy = spyOn(ecfReconciliationHttpService, "getEcfClaimFinancialItems").and.callThrough();
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css("#fetchButton"));

        component.ecfReconciliationClaimFinancialItemsForm.controls.ucr.setValue({ text: "UCR_test" });
        component.ecfReconciliationClaimFinancialItemsForm.controls.ecfReconciliationId.setValue(getEcfReconciliations()[0]);

        // Act
        button.triggerEventHandler("click", null);

        // Assert
        expect(getSpy.calls.any()).toBeTruthy();
    }));

    it("should calculate GBP totals and sub totals correctly", fakeAsync((): void => {
        // Arrange
        fixture.detectChanges();

        // Act
        component.ecfReconciliationClaimFinancialItems = getEcfClaimFinancialItems();
        component.selectedEcfReconciliation = getEcfReconciliations()[3];

        component.setPinnedBottomRowData();
        tick(1000);

        // Assert
        expect(component.ecfReconciliationClaimFinancialItemsTotals.reconciledAmountTotal).toBe(null);
        expect(component.ecfReconciliationClaimFinancialItemsSelectedTotals.reconciledGBPAmountTotal).toBe(220);
        expect(component.ecfReconciliationClaimFinancialItemsSelectedTotals.selectedCount).toBe(2);
    }) as any);

    it("should calculate totals and sub totals correctly", fakeAsync((): void => {
        // Arrange
        fixture.detectChanges();

        // Act
        component.ecfReconciliationClaimFinancialItems = getEcfClaimFinancialItems();
        component.selectedEcfReconciliation = getEcfReconciliations()[0];

        component.setPinnedBottomRowData();
        tick(1000);

        // Assert
        expect(component.ecfReconciliationClaimFinancialItemsTotals.reconciledAmountTotal).toBe(200);
        expect(component.ecfReconciliationClaimFinancialItemsSelectedTotals.reconciledGBPAmountTotal).toBe(0);
        expect(component.ecfReconciliationClaimFinancialItemsSelectedTotals.selectedCount).toBe(2);
    }) as any);

    it("should calculate newly selected totals correctly", fakeAsync((): void => {
        // Arrange
        fixture.detectChanges();

        // Act
        component.ecfReconciliationClaimFinancialItems = getEcfClaimFinancialItems();
        component.selectedEcfReconciliation = getEcfReconciliations()[3];

        component.ecfReconciliationClaimFinancialItems.forEach(row => {
            row.shouldBeReconciled = true;
        });

        component.setPinnedBottomRowData();
        tick(1000);

        // Assert
        expect(component.ecfReconciliationClaimFinancialItemsSelectedTotals.reconciledAmountTotal).toBe(400);
        expect(component.ecfReconciliationClaimFinancialItemsSelectedTotals.reconciledGBPAmountTotal).toBe(420);
        expect(component.ecfReconciliationClaimFinancialItemsSelectedTotals.selectedCount).toBe(3);
    }) as any);


    it("should display reconcile button only when changed reconciliations and ecf not already reconciled (not saved)", async(() => {
        // Arrange
        component.hasChangedEcfReconciliations = true;
        component.isEcfAlreadyReconciled = false;
        fixture.detectChanges();
        const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));

        // Assert
        expect(reconcileButton).toBeDefined();
    }));

    it("should NOT display reconcile button only when no changed reconciliations", async(() => {
        // Arrange
        component.hasChangedEcfReconciliations = false;
        component.isEcfAlreadyReconciled = false;
        fixture.detectChanges();
        const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));

        // Assert
        expect(reconcileButton).toBeNull();
    }));

    it("should NOT display reconcile button only when already reconciled", async(() => {
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
        let newEcfFinancialTransactions = getEcfClaimFinancialItems();
        newEcfFinancialTransactions[1].ecfReconciliationId = 123;
        component.ecfReconciliationClaimFinancialItems = newEcfFinancialTransactions;
        const dialogInstance = fixture.debugElement.injector.get(MatDialog);
        tick(2000);
        spyOn(dialogInstance, 'open').and.callThrough();
        tick(2000);
        fixture.detectChanges();

        const reconcileButton = fixture.debugElement.query(By.css("#reconcileButton"));
        tick(2000);
        // Act
        reconcileButton.triggerEventHandler("click", null);
        tick(2000);
        // Assert
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            tick(2000);
            expect(dialogInstance.open).toHaveBeenCalled();
        });
    }));

    function getEcfClaimFinancialItems(): EcfReconciliationClaimFinancialItem[] {
        return [
        {
            accountingReferenceDateFormattedString: "01-JAN-2019",
            description: "Description",
            isReconciled: true,
            shouldBeReconciled: true,
            claimFinancialItemId: 61009,
            claimReference: "C0CLAIMREF",
            insuredCompanyName: "InsuredCompany",
            binderDescription: "BinderDesc",
            binderYear: "Binder Year",
            binderYearNo: 2016,
            sectionDescription: "Section Description",
            sectionShortCode: "A",
            lloydsRiskCode: "CY",
            claimCurrencyIso: "GBP",
            claimCurrencyId: 3,
            policyCurrencyIso: "GBP",
            policyCurrencyId: 3,
            claimFinancialItemCurrencyIso: "GBP",
            claimFinancialItemCurrencyId: 3,
            amount: 100.00,
            gbpAmount: 110.00,
            exchangeRateToGbp: 1,
            claimFinancialItemPaymentTypeId: 2,
            claimFinancialItemPaymentType: "Payment",
            classificationId: 14,
            classification: "TPA",
            accountingReferenceDate: new Date(Date.now()),
            ecfReconciliationId: 1,

        },
        {
            accountingReferenceDateFormattedString: "01-JAN-2019",
            description: "Description",
            isReconciled: true,
            shouldBeReconciled: true,
            claimFinancialItemId: 61010,
            claimReference: "C0CLAIMREF",
            insuredCompanyName: "InsuredCompany",
            binderDescription: "BinderDesc",
            binderYear: "Binder Year",
            binderYearNo: 2016,
            sectionDescription: "Section Description",
            sectionShortCode: "A",
            lloydsRiskCode: "CY",
            claimCurrencyIso: "EUR",
            claimCurrencyId: 1,
            policyCurrencyIso: "EUR",
            policyCurrencyId: 1,
            claimFinancialItemCurrencyIso: "EUR",
            claimFinancialItemCurrencyId: 1,
            amount: 100.00,
            gbpAmount: 110.00,
            exchangeRateToGbp: 0.80,
            claimFinancialItemPaymentTypeId: 2,
            claimFinancialItemPaymentType: "Payment",
            classificationId: 14,
            classification: "TPA",
            accountingReferenceDate: new Date(Date.now()),
            ecfReconciliationId: 1,
        },
        {
            accountingReferenceDateFormattedString: "01-JAN-2019",
            description: "Description",
            isReconciled: false,
            shouldBeReconciled: false,
            claimFinancialItemId: 61011,
            claimReference: "C0CLAIMREF",
            insuredCompanyName: "InsuredCompany",
            binderDescription: "BinderDesc",
            binderYear: "Binder Year",
            binderYearNo: 2016,
            sectionDescription: "Section Description",
            sectionShortCode: "A",
            lloydsRiskCode: "CY",
            claimCurrencyIso: "GBP",
            claimCurrencyId: 3,
            policyCurrencyIso: "GBP",
            policyCurrencyId: 3,
            claimFinancialItemCurrencyIso: "GBP",
            claimFinancialItemCurrencyId: 3,
            amount: 200.00,
            gbpAmount: 200.00,
            exchangeRateToGbp: 1.00,
            claimFinancialItemPaymentTypeId: 2,
            claimFinancialItemPaymentType: "Payment",
            classificationId: 14,
            classification: "TPA",
            accountingReferenceDate: new Date(Date.now()),
            ecfReconciliationId: null,

        }];
    }

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
                lastEditedOn: new Date(Date.now())
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
                addedByCfcContactId:123,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId:123,
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
                addedByCfcContactId:123,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId:123,
                lastEditedOn: new Date(Date.now())
            },
            {
                ecfReconciliationId: 1,
                ucr: "Test 1",
                currencyId: 3,
                currencyIsoCode: "GBP",
                sequenceNo: 1,
                completedDate: new Date(Date.now()),
                amount: 200,
                reconciledGroupId: null,
                addedByCfcContactId:456,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId:456,
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
                reconciledGroupId: null,
                addedByCfcContactId: 789,
                addedOn: new Date(Date.now()),
                lastEditedByCfcContactId:789,
                lastEditedOn: new Date(Date.now())
            },
        ];
    }

});
