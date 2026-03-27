/* tslint:disable:max-classes-per-file */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { MessageComponent } from "@app/components/message/message.component";
import { TagInputComponent } from "@app/components/tag-input/tag-input.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { CfcContact } from "@app/models";
import { AddTransactionModalComponent } from "@app/finance/add-transaction/add-transaction-modal.component";
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
import { MarketTypesHttpService } from '@app/services/market-types-http.service';
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";
import { BinderSectionParticipationHttpService } from "@app/services/binder-section-participation-http.service";


describe("AddTransactionModalComponent",
    () => {
        /*
         * Test if selecting MISC corresponding section code and riskcode fields are disabled.
         * Test when component is rendered, binder name and binder year fields are disabled.
         * Test when bankaccount field is selected, bank account currency is set automatically to the bank account's currency
         * Test if original amount is same as bank account amount when bank account currency and original currency are the same
         * Test if CR is set when amount is negative and DB is set if amount is positive
         * Test that tag field validation works as expected
         */
        let component: AddTransactionModalComponent;
        let fixture: ComponentFixture<AddTransactionModalComponent>;
        let matDialogRef: MatDialogRef<AddTransactionModalComponent>;
        let cfcBankAccountHttpService: CfcBankAccountService;
        let marketTypeService: MarketTypesHttpService;
        let ledgerReferenceHttpService: LedgerReferenceHttpService;
        let dropDownService: DropdownService;

        class MockMatDialogRef<T> {
            public close(dialogResult?: any): void { return; }
        }

        class MockFinancialTransactionHttpService {}

        class MockErrorMessageHandlerService {}

        class MockMessageService { }

        class MockUserService {
            public getUser() {
                const contact = new CfcContact();
                contact.cfcContactId = 123;
                return contact;
            }
        }

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [
                    AddTransactionModalComponent,
                    MessageComponent,
                    TagInputComponent,
                    Datepicker,
                    AutocompleteDropdown,
                    CurrencyComponent,
                    LargeNumberMask
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
                    CfcBankAccountService,
                    LedgerReferenceHttpService,
                    { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService },
                    { provide: MessageService, useClass: MockMessageService },
                    { provide: UserService, useClass: MockUserService},
                    BinderSectionParticipationLookupService,
                    BinderSectionParticipationHttpService,
                    DropdownService,
                    ConfigService,
                    FormBuilder,
                    DropDownManagerService,
                    MarketTypesHttpService
                ]
            }).compileComponents().then(() => {
                fixture = TestBed.createComponent(AddTransactionModalComponent);
                component = fixture.componentInstance;
                matDialogRef = TestBed.inject(MatDialogRef);
                cfcBankAccountHttpService = fixture.debugElement.injector.get(CfcBankAccountService);
                spyOn(cfcBankAccountHttpService, "getBankAccounts").and
                    .returnValue(of([
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
                    ]));
                ledgerReferenceHttpService = fixture.debugElement.injector.get(LedgerReferenceHttpService);
                spyOn(ledgerReferenceHttpService, "getLedgerReferences")
                    .and
                    .returnValue(of([]));
                dropDownService = fixture.debugElement.injector.get(DropdownService);
                spyOn(dropDownService, "getCurrencies").and
                    .returnValue(of([]));
                    
                marketTypeService = fixture.debugElement.injector.get(MarketTypesHttpService);
                spyOn(marketTypeService, "getMarketTypes").and.returnValue(of([]));
            });
        }));

        it("Should create component",
            () => {
                expect(component).toBeDefined();
            });

        it("Binder name and Binder year fields should be disabled when component is rendered",
            () => {
                fixture.detectChanges();
                const binderDescription = fixture.debugElement.query(By.css("#binderDescription")).nativeElement;
                const binderYear = fixture.debugElement.query(By.css("#binderYear")).nativeElement;
                expect(binderDescription.disabled).toBeTruthy();
                expect(binderYear.disabled).toBeTruthy();
            });

        it("should select bank account currency when selecting bank account",
            async(() => {
                spyOn(component, "onCfcBankAccountChanged");
                fixture.detectChanges();
                component.financialTransactionModel.cfcBankAccountId = 3;
                fixture.detectChanges();
                const bankAccountSelector = fixture.debugElement.query(By.css("#bankAccount"));
                bankAccountSelector.nativeElement.dispatchEvent(new Event("change"));
            }));

        it("should enable the original amount if the original currency is different from account currency",
            () => {
                // ASSEMBLE
                fixture.detectChanges();
                // patch the values
                component.addTransForm.patchValue({
                    originalAmountCurrencyId: 2,
                    bankAccountCurrencyId: 2
                });

                // ACT
                component.addTransForm.controls.originalAmountCurrencyId.setValue(1);

                // Assert
                expect(component.addTransForm.controls.originalAmount.enabled).toBeTruthy();
            });

        it("should disable the original amount if the original currency is the same as the account currency",
            () => {
                // ASSEMBLE
                fixture.detectChanges();
                // patch the values
                component.addTransForm.patchValue({
                    originalAmountCurrencyId: { text: "£ | GBP | pound", value: 2 },
                    bankAccountCurrencyId: 1
                });

                // ACT
                component.addTransForm.controls.originalAmountCurrencyId.setValue({ text: "$ | USD | dollars", value: 1 });

                // Assert
                expect(component.addTransForm.controls.originalAmount.disabled).toBeTruthy();
            });
    });
