import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReplaySubject, Observable, of  } from "rxjs";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { MessageComponent } from "@app/components/message/message.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { NumberMaskDirective } from "@app/directives/number-mask.directive";
import { MaterialModule } from "@app/material/material.module";
import { CfcContact, DropDownItem, EcfReconciliationSummary } from "@app/models";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { AddReconciliationModalComponent } from "./add-reconciliation-modal.component";

describe("AddReconciliationModalComponent", () => {
    const ecfReconciliationSummary: EcfReconciliationSummary = {
        completedDateFormattedString : "01 Jan 2010",
        ecfReconciliationId: 1,
        ucr: "A000001",
        currency: {
            id: 1,
            symbol: "",
            isoCode: "",
            name: "",
            rate: 1.0
        },
        sequenceNo: 1,
        completedDate: new Date(Date.now()),
        ecfAmount: 100,
        claimFinancialItemsDifference: 100,
        financialTransactionsDifference: 100,
        reconciledGroupId: null,
        sequenceTag: ""
    };

    class MockEcfReconciliationHttpService {
        deleteEcfReconciliation = jasmine.createSpy("deleteEcfReconciliation").and.returnValue(of(new Object()));
    }

    class MockErrorMessageHandlerService {
        public handleError(error): void { return; }
        public handleWarning(warning): void {return ;}
    }

    class MockDropdownService {
        public getCurrencies(): Observable<DropDownItem[]> { return of([]); }
    }

    class MockMatDialogRef<T> {
        public close(dialogResult?: any): void { return; }
    }

    class MockUserService {
        public getData(): Observable<CfcContact> {
            const subject = new ReplaySubject<CfcContact>(1);
            subject.next(new CfcContact());
            return subject.asObservable();
        }
        public isFeatureAccessible(): boolean { return true; }
    }

    const testModuleConfiguration = {
        declarations: [
            AddReconciliationModalComponent,
            AutocompleteDropdown,
            MessageComponent,
            Datepicker,
            CurrencyComponent,
            LargeNumberMask,
            NumberMaskDirective
        ],
        imports: [
            BrowserAnimationsModule,
            FormsModule,
            MatDialogModule,
            MaterialModule,
            ReactiveFormsModule,
            ErrorModule
        ],
        providers: [
            { provide: EcfReconciliationHttpService, useClass: MockEcfReconciliationHttpService },
            { provide: MatDialogRef, useClass: MockMatDialogRef },
            { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService },
            { provide: DropdownService, useClass: MockDropdownService },
            { provide: UserService, useClass: MockUserService },
            DropDownManagerService,
            MessageService
        ]
    };

    let component: AddReconciliationModalComponent;
    let fixture: ComponentFixture<AddReconciliationModalComponent>;
    let userService: UserService;

    describe("Add a new reconciliation", () => {
        describe("With ecfFinanceUser feature Enabled", () => {
            beforeEach(async(() => {
                TestBed.configureTestingModule(testModuleConfiguration).compileComponents().then(() => {
                    fixture = TestBed.createComponent(AddReconciliationModalComponent);
                    component = fixture.componentInstance;
                    fixture.detectChanges();
                    userService = fixture.debugElement.injector.get(UserService);
                    spyOn(userService, "isFeatureAccessible").and.callFake((featureName: string) => {
                        if (featureName === "ecfFinanceAdmin") {
                            return true;
                        } else if (featureName === "ecfFinanceUser") {
                            return true;
                        }
                    });
                    component.initialEcfReconciliationSummary = null;
                });
            }));

            it("Should create the component", () => {
                // Arrange
                // Act
                // Assert
                expect(component).toBeDefined();
            });

            it("Should disable the amount if the currency is not selected", () => {
                // Arrange
                // Act
                // Assert
                expect(component.addReconciliationForm.controls.amount.disabled).toBeTruthy();
            });

            it("Should enable the amount if the currency is selected", () => {
                // Arrange
                // Act
                component.addReconciliationForm.controls.currencyId.setValue(1);

                // Assert
                expect(component.addReconciliationForm.controls.amount.enabled).toBeTruthy();
            });

            it("Should make all fields editable (except amount) when creating a new ECF reconciliation", () => {
                // Arrange
                component.initialEcfReconciliationSummary = null;

                // Act

                // Assert
                expect(component.addReconciliationForm.controls.ucr.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.currencyId.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.sequenceNo.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.completedDate.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.amount.disabled).toBeTruthy();
            });

            it("Should apply mask to the single digit amount", () => {
                // Arrange
                const sequenceNoElement = fixture.debugElement.query(By.css("#sequenceNo"));

                // Act
                component.addReconciliationForm.controls.sequenceNo.setValue(1);
                sequenceNoElement.triggerEventHandler("blur", null);

                // Assert
                expect(sequenceNoElement.nativeElement.value).toEqual("001");
            });

            it("Should apply mask to the double digit amount", () => {
                // Arrange
                const sequenceNoElement = fixture.debugElement.query(By.css("#sequenceNo"));

                // Act
                component.addReconciliationForm.controls.sequenceNo.setValue(12);
                sequenceNoElement.triggerEventHandler("blur", null);

                // Assert
                expect(sequenceNoElement.nativeElement.value).toEqual("012");
            });

            it("Should apply mask to the triple digit amount", () => {
                // Arrange
                const sequenceNoElement = fixture.debugElement.query(By.css("#sequenceNo"));

                // Act
                component.addReconciliationForm.controls.sequenceNo.setValue(123);
                sequenceNoElement.triggerEventHandler("blur", null);

                // Assert
                expect(sequenceNoElement.nativeElement.value).toEqual("123");
            });

            it("Should apply mask to the multiple digits amount", () => {
                // Arrange
                const sequenceNoElement = fixture.debugElement.query(By.css("#sequenceNo"));

                // Act
                component.addReconciliationForm.controls.sequenceNo.setValue(1234567);
                sequenceNoElement.triggerEventHandler("blur", null);

                // Assert
                expect(sequenceNoElement.nativeElement.value).toEqual("1234567");
            });
        });

        describe("With ecfFinanceUser feature disabled", () => {
            beforeEach(async(() => {
                TestBed.configureTestingModule(testModuleConfiguration).compileComponents().then(() => {
                    fixture = TestBed.createComponent(AddReconciliationModalComponent);
                    component = fixture.componentInstance;
                    fixture.detectChanges();
                    userService = fixture.debugElement.injector.get(UserService);
                    spyOn(userService, "isFeatureAccessible").and.callFake((featureName: string) => {
                        if (featureName === "ecfFinanceAdmin") {
                            return true;
                        } else if (featureName === "ecfFinanceUser") {
                            return true;
                        }
                    });
                    component.initialEcfReconciliationSummary = null;
                });
            }));

            it("Should make all fields disabled", () => {
                // Arrange
                // Act
                // Assert
                expect(component.addReconciliationForm.controls.ucr.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.currencyId.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.sequenceNo.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.completedDate.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.amount.disabled).toBeTruthy();
            });

            it("Should display a warning", () => {
                // Arrange
                // Act
                // Assert
                expect(component.isSubmitEnabled).toBeTruthy();
            });
        });
    });

    describe("Edit a reconciliation", () => {
        describe("With ecfFinanceAdmin feature disabled", () => {
            beforeEach(async(() => {
                TestBed.configureTestingModule(testModuleConfiguration).compileComponents().then(() => {
                    fixture = TestBed.createComponent(AddReconciliationModalComponent);
                    component = fixture.componentInstance;
                    fixture.detectChanges();
                    userService = fixture.debugElement.injector.get(UserService);
                    spyOn(userService, "isFeatureAccessible").and.callFake((featureName: string) => {
                        if (featureName === "ecfFinanceAdmin") {
                            return false;
                        }
                    });
                    component.initialEcfReconciliationSummary = ecfReconciliationSummary;
                });
            }));

            it("Should make all fields disabled", () => {
                // Assert
                expect(component.addReconciliationForm.controls.ucr.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.currencyId.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.sequenceNo.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.completedDate.enabled).toBeTruthy();
                expect(component.addReconciliationForm.controls.amount.disabled).toBeTruthy();
            });
        });

        describe("With ecfFinanceAdmin feature enabled", () => {
            describe("With no linked items", () => {
                beforeEach(async(() => {
                    const ecf: EcfReconciliationSummary = {
                        completedDateFormattedString : "01 Jan 2010",
                        ecfReconciliationId: 1,
                        ucr: "A000001",
                        currency: {
                            id: 1,
                            symbol: "",
                            isoCode: "",
                            name: "",
                            rate: 1.0
                        },
                        sequenceNo: 1,
                        completedDate: null,
                        ecfAmount: 100,
                        claimFinancialItemsDifference: -100,
                        financialTransactionsDifference: 100,
                        reconciledGroupId: null,
                        sequenceTag: ""
                    };
                    TestBed.configureTestingModule(testModuleConfiguration).compileComponents().then(() => {
                        fixture = TestBed.createComponent(AddReconciliationModalComponent);
                        fixture.componentInstance.initialEcfReconciliationSummary = ecf;
                        component = fixture.componentInstance;
                        fixture.detectChanges();
                        userService = fixture.debugElement.injector.get(UserService);
                        spyOn(userService, "isFeatureAccessible").and.callFake((featureName: string) => {
                            if (featureName === "ecfFinanceAdmin") {
                                return true;
                            }
                        });
                    });
                }));

                it("Should make all fields editable when there is no linked claim financial items and financial transactions", () => {
                    // Arrange
                    // Act
                    // Assert
                    expect(component.addReconciliationForm.controls.ucr.enabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.currencyId.enabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.sequenceNo.enabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.completedDate.enabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.amount.enabled).toBeTruthy();
                });

                it("Should allow the ecf to be deleted", () => {
                    // Arrange
                    // Act
                    component.onDelete();
                    // Assert
                    expect(component.displayErrorMessage).toBeFalsy();
                });
            });

            describe("With linked items", () => {
                beforeEach(async(() => {
                    TestBed.configureTestingModule(testModuleConfiguration).compileComponents().then(() => {
                        const ecf: EcfReconciliationSummary = {
                            completedDateFormattedString : "01 Jan 2010",
                            ecfReconciliationId: 1,
                            ucr: "A000001",
                            currency: {
                                id: 1,
                                symbol: "",
                                isoCode: "",
                                name: "",
                                rate: 1.0
                            },
                            sequenceNo: 1,
                            completedDate: null,
                            ecfAmount: 100,
                            claimFinancialItemsDifference: 0,
                            financialTransactionsDifference: 100,
                            reconciledGroupId: null,
                            sequenceTag: ""
                        };
                        fixture = TestBed.createComponent(AddReconciliationModalComponent);
                        fixture.componentInstance.initialEcfReconciliationSummary = ecf;
                        component = fixture.componentInstance;
                        fixture.detectChanges();
                        userService = fixture.debugElement.injector.get(UserService);
                        spyOn(userService, "isFeatureAccessible").and.callFake((featureName: string) => {
                            if (featureName === "ecfFinanceAdmin") {
                                return true;
                            }
                        });
                    });
                }));

                it("Should disable all fields except amount", () => {
                    // Arrange
                    // Act
                    // Assert
                    expect(component.addReconciliationForm.controls.ucr.disabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.currencyId.disabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.sequenceNo.disabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.completedDate.disabled).toBeTruthy();
                    expect(component.addReconciliationForm.controls.amount.enabled).toBeTruthy();
                });

                it("Should display error on delete", () => {
                    // Act
                    component.onDelete();

                    // Assert
                    expect(component.displayErrorMessage).toBeTruthy();
                });
            });

            describe("With completed ecf", () => {
                beforeEach(async(() => {
                    TestBed.configureTestingModule(testModuleConfiguration).compileComponents().then(() => {
                        const ecf: EcfReconciliationSummary = {
                            completedDateFormattedString : "01 Jan 2010",
                            ecfReconciliationId: 1,
                            ucr: "A000001",
                            currency: {
                                id: 1,
                                symbol: "",
                                isoCode: "",
                                name: "",
                                rate: 1.0
                            },
                            sequenceNo: 1,
                            completedDate: null,
                            ecfAmount: 100,
                            claimFinancialItemsDifference: 0,
                            financialTransactionsDifference: 100,
                            reconciledGroupId: 5,
                            sequenceTag: ""
                        };
                        fixture = TestBed.createComponent(AddReconciliationModalComponent);
                        fixture.componentInstance.initialEcfReconciliationSummary = ecf;
                        component = fixture.componentInstance;
                        fixture.detectChanges();
                        userService = fixture.debugElement.injector.get(UserService);
                        spyOn(userService, "isFeatureAccessible").and.callFake((featureName: string) => {
                            if (featureName === "ecfFinanceAdmin") {
                                return true;
                            }
                        });
                    });
                }));

                it("Should disable all fields", () => {
                    // Arrange
                    // Act
                    // Assert
                    expect(component.addReconciliationForm.disabled).toBeTruthy();
                });

                it("Should display error on delete", () => {
                    // Act
                    component.onDelete();

                    // Assert
                    expect(component.displayErrorMessage).toBeTruthy();
                });
            });
        });
    });
});
