/* tslint:disable:max-classes-per-file */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { TagInputComponent } from "@app/components/tag-input/tag-input.component";
import { CfcContact } from "@app/models";
import { MaterialModule } from "@app/material/material.module";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { ConfigService } from "@app/services/config.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { FinanceHttpService } from "@app/services/finance-http.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MarketTypesHttpService } from "@app/services/market-types-http.service";
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";
import { BinderSectionParticipationHttpService } from "@app/services/binder-section-participation-http.service";
import { AddTransactionOutstandingFundModalComponent } from "./add-transaction-outstanding-fund-modal.component";
import {
    MockDatePickerComponent,
    MockCurrencyComponent,
    MockMessageComponent,
    MockLargeNumberMask,
    MockCarrierContributionsComponent,
    MockLoadingSpinnerComponent,
    MockAutocompleteDropdown,
    MockTagInputComponent,
    MockPercentageInputComponent
} from "@app/mocks/components.mocks";


class MockMatDialogRef {
    public close(): void { return; }
}

class MockFinancialTransactionHttpService { }

class MockErrorMessageHandlerService { }

class MockMessageService { }

class MockUserService {
    public getUser() {
        const contact = new CfcContact();
        contact.cfcContactId = 123;
        return contact;
    }
}

xdescribe("AddTransactionOutstandingFundModalComponent",
    () => {
        let addTransactionOFundModalComponent: AddTransactionOutstandingFundModalComponent;
        let fixture: ComponentFixture<AddTransactionOutstandingFundModalComponent>;
        let matDialogRef: MatDialogRef<AddTransactionOutstandingFundModalComponent>;

        const mockCfCBankAccounts = of([
            {
                cfcBankAccountId: 1,
                bankAccountName: "CFCUIRTA-AUDC",
                bankAccountType: "Premiums",
                bankAccountCurrencyId: 5,
                bankAccountCurrencyName: "AUD"
            },
            {
                cfcBankAccountId: 2,
                bankAccountName: "CFCUIRTA-CADC",
                bankAccountType: "Premiums",
                bankAccountCurrencyId: 4,
                bankAccountCurrencyName: "CAD"
            },
            {
                cfcBankAccountId: 3,
                bankAccountName: "CFCUIRTA-EURC",
                bankAccountType: "Premiums",
                bankAccountCurrencyId: 1,
                bankAccountCurrencyName: "EUR"
            },
            {
                cfcBankAccountId: 4,
                bankAccountName: "CFCUIRTA-USDC",
                bankAccountType: "Premiums",
                bankAccountCurrencyId: 2,
                bankAccountCurrencyName: "USD"
            },
            {
                cfcBankAccountId: 5,
                bankAccountName: "24159593",
                bankAccountType: "Premiums",
                bankAccountCurrencyId: 3,
                bankAccountCurrencyName: "GBP"
            }
        ]);

        const mockCfcBankAccountHttpService = jasmine.createSpyObj("mockCfcBankAccountHttpService", ["getBankAccounts"]);
        mockCfcBankAccountHttpService.getBankAccounts.and
            .returnValue(mockCfCBankAccounts);

        const mockLedgerRefService = jasmine.createSpyObj("mockLedgerRefService", ["getLedgerReferences"]);
        mockLedgerRefService.getLedgerReferences.and.returnValue(of([]));

        const mockDropdownService = jasmine.createSpyObj("mockDropdownService", ["getCurrencies"]);
        mockDropdownService.getCurrencies.and.returnValue(of([]));

        const mockBinderSectionParticipationLookupService = jasmine.createSpyObj("mockBinderSectionParticipationLookupService", ["getData"]);
        mockBinderSectionParticipationLookupService.getData.and.returnValue(of([]));

        const mockBinderSectionParticipationHttpService = jasmine.createSpyObj("mockBinderSectionParticipationHttpService",
            ["getBinderSectionParticipationLookups"]);
        mockBinderSectionParticipationHttpService.getBinderSectionParticipationLookups.and.returnValue(of([]));

        const mockConfigService = jasmine.createSpyObj("mockConfigService", ["nerdUrl"]);
        mockConfigService.nerdUrl.and.returnValue("http://nerd/");

        const mockMarketTypeHttpService = jasmine.createSpyObj("mockMarketTypeHttpService", ["getMarketTypes"]);
        mockMarketTypeHttpService.getMarketTypes.and.returnValue(of([]));

        const mockDropdownManagerService = jasmine.createSpyObj("mockDropdownManagerService", ["setCurrencyFromDropDownItem"]);
        mockDropdownManagerService.setCurrencyFromDropDownItem.and.returnValue({
            id: 1,
            symbol: "£",
            isoCode: "GBP",
            name: "pound",
            rate: 1.0
        });

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    AddTransactionOutstandingFundModalComponent,
                    MockMessageComponent,
                    MockTagInputComponent,
                    MockDatePickerComponent,
                    MockPercentageInputComponent,
                    MockAutocompleteDropdown,
                    MockCurrencyComponent,
                    MockLargeNumberMask,
                    MockLoadingSpinnerComponent,
                    MockCarrierContributionsComponent
                ],
                imports: [
                    FormsModule,
                    HttpClientTestingModule,
                    MatDialogModule,
                    MaterialModule,
                    BrowserAnimationsModule,
                    ReactiveFormsModule,
                    ErrorModule
                ],
                providers: [
                    { provide: MatDialogRef, useClass: MockMatDialogRef },
                    { provide: FinanceHttpService, useClass: MockFinancialTransactionHttpService },
                    { provide: CfcBankAccountService, useValue: mockCfcBankAccountHttpService },
                    { provide: LedgerReferenceHttpService, useValue: mockLedgerRefService },
                    { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService },
                    { provide: MessageService, useClass: MockMessageService },
                    { provide: UserService, useClass: MockUserService },
                    { provide: BinderSectionParticipationLookupService, useValue: mockBinderSectionParticipationLookupService },
                    { provide: BinderSectionParticipationHttpService, useValue: mockBinderSectionParticipationHttpService },
                    { provide: DropdownService, useValue: mockDropdownService },
                    {
                        provide: ConfigService, useValue: mockConfigService
                    },
                    { provide: DropDownManagerService, useValue: mockDropdownManagerService },
                    { provide: MarketTypesHttpService, useValue: mockMarketTypeHttpService },
                    FormBuilder,
                ]
            }).compileComponents().then(() => {
                fixture = TestBed.createComponent(AddTransactionOutstandingFundModalComponent);
                addTransactionOFundModalComponent = fixture.componentInstance;

                const mockAddTransactionFormInitialiser = jasmine.createSpyObj("mockAddTransactionFormInitialiser", ["initialiseForm"]);
                mockAddTransactionFormInitialiser.initialiseForm.and.returnValue({});

                const mockInitialFormValueRetriever = jasmine.createSpyObj("mockInitialFormValueRetriever", ["getInitialValue"]);
                mockInitialFormValueRetriever.getInitialValue.and.returnValue({});

                const mockAddTransactionModalFormDataRetriever = jasmine.createSpyObj("mockAddTransactionModalFormDataRetriever",
                    ["initialiseFormDropDownData", "cfcBankAccounts", "financialLedgerInfos", "getCurrencyDropDownItem"]);

                const mockContextualFormValueRetriever = jasmine.createSpyObj("mockContextualFormValueRetriever",
                    ["getFormValue$"]);

                addTransactionOFundModalComponent.formInitialiser = mockAddTransactionFormInitialiser;
                addTransactionOFundModalComponent.initialFormValueRetriever = mockInitialFormValueRetriever;
                addTransactionOFundModalComponent.addTransactionModalFormDataRetriever = mockAddTransactionModalFormDataRetriever;
                addTransactionOFundModalComponent.contextualValueRetriever = mockContextualFormValueRetriever;
                matDialogRef = TestBed.inject(MatDialogRef);
            });
        }));

        it("Should create component",
            () => {
                expect(addTransactionOFundModalComponent).toBeDefined();
            });

        it("Binder name and Binder year fields should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const binderDescription = fixture.debugElement.query(By.css("#binderDescription")).nativeElement;
                const binderYear = fixture.debugElement.query(By.css("#binderYear")).nativeElement;
                expect(binderDescription.disabled).toBeTruthy();
                expect(binderYear.disabled).toBeTruthy();
            });

        it("Carrier Participation Percentage field should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const carrierParticipationPercentage = fixture.debugElement.query(By.css("#binderDescription")).nativeElement;
                expect(carrierParticipationPercentage.disabled).toBeTruthy();
            });

        it("Bank Account Currency field should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const bankAccountCurrency = fixture.debugElement.query(By.css("#cfcBankAccountCurrency")).nativeElement;
                expect(bankAccountCurrency.disabled).toBeTruthy();
            });

        it("Entry Type field should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const entryType = fixture.debugElement.query(By.css("#entryType")).nativeElement;
                expect(entryType.disabled).toBeTruthy();
            });

        it("Section Short Code field should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const sectionShortCode = fixture.debugElement.query(By.css("#sectionShortCode")).nativeElement;
                expect(sectionShortCode.disabled).toBeTruthy();
            });

        it("Original Amount should be enabled when component is rendered",
            () => {
                fixture.detectChanges();
                const originalAmount = fixture.debugElement.query(By.css("#originalAmount")).nativeElement;
                expect(originalAmount.disabled).toBeFalsy();
            });

        it("Lloyds Risk Code field should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const lloydsRiskCode = fixture.debugElement.query(By.css("#lloydsRiskCode")).nativeElement;
                expect(lloydsRiskCode.disabled).toBeTruthy();
            });

        it("should select bank account currency when selecting bank account",
            async(() => {
                spyOn(addTransactionOFundModalComponent, "onCfcBankAccountChanged");
                fixture.detectChanges();
                addTransactionOFundModalComponent.financialTransactionModel.cfcBankAccountId = 3;
                fixture.detectChanges();
                const bankAccountSelector = fixture.debugElement.query(By.css("#bankAccount"));
                bankAccountSelector.nativeElement.dispatchEvent(new Event("change"));
            }));

        it("should select financial ledger info when selecting a different financial ledger",
            async(() => {
                spyOn(addTransactionOFundModalComponent, "onLedgerReferenceChanged");
                fixture.detectChanges();
                addTransactionOFundModalComponent.financialTransactionModel.financialLedgerId = 13;
                fixture.detectChanges();
                const financialLedgerSelector = fixture.debugElement.query(By.css("#ledgerReference"));
                financialLedgerSelector.nativeElement.dispatchEvent(new Event("change"));
            }));

        it("should set the entry type to debit if the total account amount is changed to something greater than 0",
            () => {
                fixture.detectChanges();
                addTransactionOFundModalComponent.addTransForm.controls.totalAccountAmount.setValue(500);
                expect(addTransactionOFundModalComponent.addTransForm.controls.entryType.value).toBeTruthy();
                expect(addTransactionOFundModalComponent.addTransForm.controls.entryType.value).toBe("DB");
            });

        it("should set the entry type to credit if the total account amount is changed to something less than 0",
            () => {
                fixture.detectChanges();
                addTransactionOFundModalComponent.addTransForm.controls.totalAccountAmount.setValue(-450);
                expect(addTransactionOFundModalComponent.addTransForm.controls.entryType.value).toBeTruthy();
                expect(addTransactionOFundModalComponent.addTransForm.controls.entryType.value).toBe("CR");
            });

        it("should set the bank account amount to the total account amount when the total account amount is changed and no carrier is selected",
            () => {
                fixture.detectChanges();
                addTransactionOFundModalComponent.addTransForm.controls.totalAccountAmount.setValue(500);
                expect(addTransactionOFundModalComponent.addTransForm.controls.bankAccountAmount.value).toBeTruthy();
                expect(addTransactionOFundModalComponent.addTransForm.controls.bankAccountAmount.value).toBe(500);
            });
    });
