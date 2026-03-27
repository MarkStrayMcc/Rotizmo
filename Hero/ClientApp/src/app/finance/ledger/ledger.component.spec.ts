import { CommonModule } from "@angular/common";
import { DecimalPipe } from "@angular/common";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { Title, By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";

import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { FINANCIAL_LEDGER_COLUMNS } from "@app/finance/ledger/financial-ledger.columns";
import { LedgerComponent } from "@app/finance/ledger/ledger.component";

import { MaterialModule } from "@app/material/material.module";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { ConfigService } from "@app/services/config.service";
import { FinanceHttpService } from "@app/services/finance-http.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { TRANSACTIONS } from "@app/test/financial-transactions-mock-data";
import { AgGridModule } from "ag-grid-angular";
import { of } from "rxjs";
import { ReverseButtonComponent } from "@app/ag-grid/reverse-button/reverse-button.component";
import { AgGridComponentsModule } from "@app/ag-grid/AgGridComponentsModule.module";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ErrorModule } from "@app/shared/error.module";
import { ActivatedRoute } from "@angular/router";
import { DropdownService } from "@app/services/dropdown.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { LedgerAddTransactionModalService } from "@app/services/finance/add-transaction-modal/modal-service/ledger-add-transaction-modal-service";

/**
 * Testing ActivatedRoutes are unlike regular tests.
 * Refer - https://remypenchenat.blogspot.com/2018/02/angular-testing-activatedroute.html for an insight into
 * what has to be done for this.
 */
xdescribe("LedgerComponent", () => {
    let component: LedgerComponent;
    let fixture: ComponentFixture<LedgerComponent>;
    let financialTransactionHttpService: FinanceHttpService;
    let cfcBankAccountHttpService: CfcBankAccountService;
    let appCommunicationService: AppCommunicationService;
    let ledgerReferenceHttpService: LedgerReferenceHttpService;

    const mockCfCBankAccounts = of([
        {
            cfcBankAccountId: 1,
            bankAccountName: "CFCUIRTA-AUDC",
            bankAccountType: "Premiums",
            bankAccountCurrencyId: 5,
            bankAccountCurrencyName: "AUD",
        },
        {
            cfcBankAccountId: 2,
            bankAccountName: "CFCUIRTA-CADC",
            bankAccountType: "Premiums",
            bankAccountCurrencyId: 4,
            bankAccountCurrencyName: "CAD",
        },
        {
            cfcBankAccountId: 3,
            bankAccountName: "CFCUIRTA-EURC",
            bankAccountType: "Premiums",
            bankAccountCurrencyId: 1,
            bankAccountCurrencyName: "EUR",
        },
        {
            cfcBankAccountId: 4,
            bankAccountName: "CFCUIRTA-USDC",
            bankAccountType: "Premiums",
            bankAccountCurrencyId: 2,
            bankAccountCurrencyName: "USD",
        },
        {
            cfcBankAccountId: 5,
            bankAccountName: "24159593",
            bankAccountType: "Premiums",
            bankAccountCurrencyId: 3,
            bankAccountCurrencyName: "GBP",
        },
    ]);

    xdescribe("Isolated Unit Tests", () => {
        const mockCfcBankAccountHttpService = jasmine.createSpyObj(
            "mockCfcBankAccountHttpService",
            ["getBankAccounts"]
        );
        mockCfcBankAccountHttpService.getBankAccounts.and.returnValue(
            mockCfCBankAccounts
        );
        const mockFinTransService = jasmine.createSpyObj(
            "mockFinTransService",
            [
                "getTransactions",
                "getColumns",
                "getTotal",
                "addTransaction",
                "getDefaultColumn",
            ]
        );
        mockFinTransService.getTransactions.and.returnValue(of(TRANSACTIONS));
        mockFinTransService.getColumns.and.returnValue(
            FINANCIAL_LEDGER_COLUMNS
        );
        mockFinTransService.getDefaultColumn.and.returnValue({});
        const mockTitleService = jasmine.createSpyObj("mockTitleService", [
            "setTitle",
            "getTitle",
        ]);
        const mockAppCommunicationService = jasmine.createSpyObj(
            "mockAppCommunicationService",
            ["addClass"]
        );
        const mockFormBuilder = jasmine.createSpyObj("mockFormBuilder", [
            "group",
        ]);
        mockFormBuilder.group.and.returnValue(
            new FormGroup({
                cfcBankAccountName: new FormControl(""),
                transactionsCurrencyId: new FormControl(""),
                financialLedgerId: new FormControl(""),
            })
        );
        const mockDecimalPipe = jasmine.createSpyObj("mockDecimalPipe", [
            "transform",
        ]);
        const mockLedgerRefService = jasmine.createSpyObj(
            "mockLedgerRefService",
            ["getLedgerReferences"]
        );
        const mockLedgerModalService = {
            openModal: (x: any, afterClose: (obj: any) => void) => {},
        } as LedgerAddTransactionModalService;

        const component = new LedgerComponent(
            mockCfcBankAccountHttpService,
            mockFinTransService,
            mockAppCommunicationService,
            mockTitleService,
            mockFormBuilder,
            mockLedgerRefService,
            mockDecimalPipe,
            mockLedgerModalService
        );

        describe("ngOnInit", () => {
            component.ngOnInit();
            it("should have called CfcBankAccountHttpService.getBankAccounts", () => {
                expect(
                    mockCfcBankAccountHttpService.getBankAccounts
                ).toHaveBeenCalled();
            });
            it("should have initialised component's cfcBankAccounts", () => {
                component.cfcBankAccounts.subscribe((subBankAccounts) => {
                    expect(subBankAccounts.length).toBe(5);
                });
            });
            it("should have called FinancialTransactionHttpService.getTransactions", () => {
                expect(mockFinTransService.getTransactions).toHaveBeenCalled();
            });
            it("should have initialised component's transactions", () => {
                expect(component.transactions.length).toBe(4);
            });
            it("Should have set title", () => {
                expect(mockTitleService.setTitle).toHaveBeenCalledTimes(1);
            });
            it("Should have got default column def", () => {
                expect(
                    mockFinTransService.getDefaultColumn
                ).toHaveBeenCalledTimes(1);
            });
        });
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LedgerComponent, AutocompleteDropdown],
            imports: [
                FormsModule,
                CommonModule,
                HttpClientTestingModule,
                AgGridComponentsModule,
                AgGridModule.withComponents([
                    CustomPinnedRowRenderer,
                    GridHeaderComponent,
                    ReverseButtonComponent,
                ]),
                MatDialogModule,
                MaterialModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                ErrorModule,
            ],
            providers: [
                FinanceHttpService,
                AppCommunicationService,
                CfcBankAccountService,
                LedgerReferenceHttpService,
                FormBuilder,
                Title,
                ConfigService,
                DecimalPipe,
                DropdownService,
                CurrencyHttpService,
                BinderSectionParticipationLookupService,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(LedgerComponent);
                component = fixture.componentInstance;
                cfcBankAccountHttpService = fixture.debugElement.injector.get(
                    CfcBankAccountService
                );
                spyOn(
                    cfcBankAccountHttpService,
                    "getBankAccounts"
                ).and.returnValue(mockCfCBankAccounts);
                financialTransactionHttpService =
                    fixture.debugElement.injector.get(FinanceHttpService);
                spyOn(
                    financialTransactionHttpService,
                    "getTransactions"
                ).and.returnValue(of(TRANSACTIONS));
                appCommunicationService = fixture.debugElement.injector.get(
                    AppCommunicationService
                );
                spyOn(appCommunicationService, "addClass").and.callThrough();
                ledgerReferenceHttpService = fixture.debugElement.injector.get(
                    LedgerReferenceHttpService
                );
                spyOn(
                    ledgerReferenceHttpService,
                    "getLedgerReferences"
                ).and.returnValue(of([]));
            });
    }));

    it("Should create component", () => {
        expect(component).toBeDefined();
    });
    it("grid API is not available until  `detectChanges`", () => {
        expect(component.agGrid.api).not.toBeTruthy();
    });
    it("grid API is available after `detectChanges`", () => {
        fixture.detectChanges();
        expect(component.agGrid.api).toBeTruthy();
    });
    it("openAddTransactionDialog is called when Add Transaction button is clicked", () => {
        spyOn(component, "openAddTransactionDialog");
        component.ngOnInit();
        const addTransactionButton = fixture.debugElement.query(
            By.css("#addTransactionBtn")
        );
        addTransactionButton.nativeElement.click();
        expect(component.openAddTransactionDialog).toHaveBeenCalled();
    });
    it("modalDialogService open dialog is called once when Add Transaction button is clicked", () => {
        spyOn(mockLedgerModalService, "openModal");
        component.ngOnInit();
        const addTransactionButton = fixture.debugElement.query(
            By.css("#addTransactionBtn")
        );
        addTransactionButton.nativeElement.click();
        expect(mockLedgerModalService.openModal).toHaveBeenCalledTimes(1);
    });
});
const mockLedgerModalService = {
    openModal: (x: any, afterClose: (obj: any) => void) => {},
} as LedgerAddTransactionModalService;
