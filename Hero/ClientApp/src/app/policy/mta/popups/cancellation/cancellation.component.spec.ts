import { getCurrencySymbol } from "@angular/common";
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { Validators } from "@angular/forms";
import { mockCfcContact } from "@app/mocks/cfc-contact.mock";
import { MessageType } from "@app/models";
import { GetCancellationPremiumResponse } from "@app/policy/models/GetCancellationPremiumResponse";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { ICurrency } from "@app/shared/form-creator/ICurrency";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { of } from "rxjs";
import { first, skip } from "rxjs/operators";
import { Shallow } from "shallow-render";
import { MtaModalModel } from "../mta-modal.model";
import { PopupsModule } from "../popups.module";
import { CancellationTypes } from "./cancellation-types.enum";
import { MtaCancellationComponent } from "./cancellation.component";

describe("MtaCancellationComponent", () => {
    let shallow: Shallow<MtaCancellationComponent>;

    const testMtaId = Guid.create().toString();
    const testPolicy = "TESTPOLICY123";
    const testGetCancellationPremiumResponse = <GetCancellationPremiumResponse>{
        currencyIsoCode: "USD",
        returnFee: 1000,
        taxRate: 0.3,
        totalReturnPremium: 5000,
    };

    beforeEach(() => {
        shallow = new Shallow(MtaCancellationComponent, PopupsModule)
            .mock(MtaService, {
                postCancellation: () => of({ mtaId: testMtaId }),
                getCancellationPremium: () => of(testGetCancellationPremiumResponse)
            })
            .mock(MessageService, { clearAllMessages: jasmine.createSpy(), sendMessage: jasmine.createSpy() })
            .mock(ModalDialogService, { openDialog: () => "confirm-button" })
            .mock(UserService, { getUser: () => mockCfcContact });
    });

    describe("constructor", () => {
        let component: MtaCancellationComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render({ detectChanges: false });
            component = instance;
        });

        it("should create component", () => {
            expect(component).toBeDefined();
        });

        it("should set is loading to true", async () => {
            expect(await component.isLoading$.pipe(first()).toPromise()).toBe(true);
        });

        it("should set is saving to false", async () => {
            expect(await component.isSaving$.pipe(first()).toPromise()).toBe(false);
        });

        it("should set is loading to true", async () => {
            expect(await component.isLoading$.pipe(first()).toPromise()).toBe(true);
        });
    });

    describe("ngOninit", () => {
        let component: MtaCancellationComponent;
        let componentFixture: ComponentFixture<MtaCancellationComponent>;

        let mockMtaService: MtaService;
        let mockMessageService: MessageService;

        const testInceptionDate = new Date(2022, 9, 6);
        const testMidTermEffectiveDate = new Date(2022, 12, 6);

        beforeEach(async () => {
            const { instance, fixture } = await shallow.render({ detectChanges: false });

            component = instance;
            componentFixture = fixture;

            mockMtaService = TestBed.inject(MtaService);
            mockMessageService = TestBed.inject(MessageService);

            component.dialogModel = <MtaModalModel>{ policy: { inceptionDate: testInceptionDate.toISOString(), reference: testPolicy } };
            componentFixture.detectChanges();
        });

        describe("formGroup", () => {
            describe("should build the cancellation form group", () => {
                it("with a cancellation reason field", () => {
                    expect(component.formGroup.controls.cancellationReason.value).toBeNull();
                    expect(component.formGroup.controls.cancellationReason.hasValidator(Validators.required)).toBe(true);
                });

                it("with an effective date field", () => {
                    expect(component.formGroup.controls.effectiveDate.value.toISOString()).toBe(testInceptionDate.toISOString());
                    expect(component.formGroup.controls.effectiveDate.hasValidator(Validators.required)).toBe(true);
                });

                it("with a return fee field", () => {
                    expect(component.formGroup.controls.returnFee).toBeDefined();
                });

                it("with a total return premium field", () => {
                    expect(component.formGroup.controls.totalReturnPremium).toBeDefined();
                });
            });
        });

        describe("type$", () => {
            it("should intially return Ab Initio", async () => {
                const cancellationType = await component.type$.pipe(first()).toPromise();
                expect(cancellationType).toBe(CancellationTypes.AbInitio);
            });

            describe("with an altered Effective Date", () => {
                it("should return Mid-Term", fakeAsync(async () => {
                    // Act
                    component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                    tick(500);

                    // Assert
                    const type = await component.type$.pipe(first()).toPromise();
                    expect(type).toBe(CancellationTypes.MidTerm);
                    discardPeriodicTasks();
                }));

                it("should observe debounce time", fakeAsync(async () => {
                    // Act
                    component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                    tick(250);

                    // Assert
                    const type = await component.type$.pipe(first()).toPromise();
                    expect(type).toBe(CancellationTypes.AbInitio);
                    discardPeriodicTasks();
                }));
            });
        });

        describe("premium$", () => {
            it("should set correct Total Return Premium value", () => {
                expect(component.formGroup.controls.totalReturnPremium.value).toBe(testGetCancellationPremiumResponse.totalReturnPremium);
            });

            it("should set correct Return Fees value", () => {
                expect(component.formGroup.controls.returnFee.value).toBe(testGetCancellationPremiumResponse.returnFee);
            });
        });

        describe("returnTax$", () => {
            it("should set correct Return Taxes value", async () => {
                const expectedReturnTaxes = testGetCancellationPremiumResponse.totalReturnPremium * testGetCancellationPremiumResponse.taxRate;
                const returnTax = await component.returnTax$.pipe(first()).toPromise();

                expect(returnTax).toBe(expectedReturnTaxes);
            });

            it("should return null when CancellationPremiumResponse is null", fakeAsync(async () => {
                //Arrange
                mockMtaService.getCancellationPremium = jasmine.createSpy().and.returnValue(of(null));

                // Act
                component.formGroup.controls.effectiveDate.setValue(new Date());
                tick(500);
                tick(250); // simulate totalReturnPremium control debounce (triggered by above).

                // Assert
                const returnTax = await component.returnTax$.pipe(first()).toPromise();
                expect(returnTax).toBe(null);
            }));

            describe("with an altered Return Premium", () => {
                it("should alter Return Tax value accordingly", fakeAsync(async () => {
                    const testEditedTotalReturnPremium = 3000;
                    const expectedReturnTaxes = testEditedTotalReturnPremium * testGetCancellationPremiumResponse.taxRate;
                    //Arrange
                    component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                    tick(500);

                    // Act
                    component.formGroup.controls.totalReturnPremium.setValue(testEditedTotalReturnPremium);
                    tick(250);

                    // Assert
                    const returnTax = await component.returnTax$.pipe(first()).toPromise();
                    expect(returnTax).toBe(expectedReturnTaxes);
                }));

                it("should alter Return Tax to zero for a null value", fakeAsync(async () => {
                    const testEditedTotalReturnPremium = null;
                    const expectedReturnTaxes = 0;
                    //Arrange
                    component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                    tick(500);

                    // Act
                    component.formGroup.controls.totalReturnPremium.setValue(testEditedTotalReturnPremium);
                    tick(250);

                    // Assert
                    const returnTax = await component.returnTax$.pipe(first()).toPromise();
                    expect(returnTax).toBe(expectedReturnTaxes);
                }));
            });
        });

        describe("currency$", () => {
            let currency: ICurrency

            beforeEach(async () => {
                currency = await component.currency$.pipe(first()).toPromise();
            });

            it("should return correct ISO code", () => {
                expect(currency.isoCode).toBe(testGetCancellationPremiumResponse.currencyIsoCode);
            });

            it("should return correct Currency symbol", () => {
                const expectedCurrencySymbol = getCurrencySymbol(testGetCancellationPremiumResponse.currencyIsoCode, "narrow");
                expect(currency.symbol).toBe(expectedCurrencySymbol);
            })
        });

        describe("effectiveDate$", () => {
            let isLoadingPromise: Promise<boolean>;

            const testGetMidTermCancellationPremiumResponse = <GetCancellationPremiumResponse>{
                currencyIsoCode: "GBP",
                returnFee: 2000,
                taxRate: 0.6,
                totalReturnPremium: 10000,
            };

            beforeEach(fakeAsync(() => {
                isLoadingPromise = component.isLoading$.pipe(skip(1), first()).toPromise();

                mockMessageService.clearAllMessages = jasmine.createSpy();
                mockMtaService.getCancellationPremium = jasmine.createSpy().and.returnValue(of(testGetMidTermCancellationPremiumResponse));

                component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                componentFixture.detectChanges();

                tick(500);
                discardPeriodicTasks();
            }));

            it("should clear messages", () => {
                expect(mockMessageService.clearAllMessages).toHaveBeenCalledTimes(1);
            });

            it("should retrieve premium", () => {
                expect(mockMtaService.getCancellationPremium).toHaveBeenCalledTimes(1);
                expect(mockMtaService.getCancellationPremium).toHaveBeenCalledWith(component.dialogModel.policy.reference, testMidTermEffectiveDate);
            });

            it("should mark the form as loading", async () => {
                expect(await isLoadingPromise).toBe(true);
            });

            it("should reset loading state", async () => {
                const isLoading = await component.isLoading$.pipe(first()).toPromise();
                expect(isLoading).toBe(false);
            });

            it("should update Total Return Premium value", () => {
                expect(component.formGroup.controls.totalReturnPremium.value).toBe(testGetMidTermCancellationPremiumResponse.totalReturnPremium);
            });

            it("should update Return Fees value", () => {
                expect(component.formGroup.controls.returnFee.value).toBe(testGetMidTermCancellationPremiumResponse.returnFee);
            });
        });

        describe("openCancelConfirmationModal", () => {
            let mockModalDialogService: ModalDialogService;

            beforeEach(() => {
                mockModalDialogService = TestBed.inject(ModalDialogService);
                component.formGroup.controls.cancellationReason.setValue("too expensive!");
            });

            describe("when the form is invalid", () => {
                beforeEach(() => {
                    component.formGroup.controls.cancellationReason.setValue(null);
                    component.openCancelConfirmationModal();
                });

                it("should NOT open dialog", () => {
                    expect(mockModalDialogService.openDialog).toHaveBeenCalledTimes(0);
                });

                it("should mark all form controls as touched", () => {
                    expect(component.formGroup.controls.cancellationReason.touched).toBe(true);
                    expect(component.formGroup.controls.effectiveDate.touched).toBe(true);
                    expect(component.formGroup.controls.returnFee.touched).toBe(true);
                    expect(component.formGroup.controls.totalReturnPremium.touched).toBe(true);
                });

                it("should disable the save button if the form is invalid", async () => {
                    expect(component.formGroup.invalid).toBe(true);
                    const isSaveButtonDisabled = await component.isSaveButtonDisabled$.pipe(first()).toPromise();
                    expect(isSaveButtonDisabled).toBe(true);
                });
            });

            it("should open dialog when the form is valid", () => {
                component.openCancelConfirmationModal();
                expect(mockModalDialogService.openDialog).toHaveBeenCalledTimes(1);
            });

            describe("when cancel confirmed", () => {
                beforeEach(() => {
                    mockModalDialogService.openDialog = jasmine
                        .createSpy().and
                        .callFake((_: any, __: any, ___: any, afterClosed: (result: string) => void) => afterClosed("confirm-button"));

                        component.openCancelConfirmationModal();
                        componentFixture.detectChanges();
                });

                it("should clear all messages", () => {
                    expect(mockMessageService.clearAllMessages).toHaveBeenCalled();
                });

                it("should POST cancellation request", () => {
                    expect(mockMtaService.postCancellation).toHaveBeenCalledTimes(1);
                });

                it("should POST cancellation with valid request", () => {
                    const expectedCancellationRequest = {
                        cfcUserId: mockCfcContact.cfcContactUid,
                        cancellationReason: component.formGroup.value.cancellationReason,
                        effectiveDate: moment(component.formGroup.value.effectiveDate),
                        returnPremium: testGetCancellationPremiumResponse.totalReturnPremium,
                        returnFee: testGetCancellationPremiumResponse.returnFee,
                    };

                    expect(mockMtaService.postCancellation).toHaveBeenCalledWith(expectedCancellationRequest, testPolicy);
                });

                it("should mark the form as saving", async () => {
                    const isSavingPromise = component.isSaving$.pipe(skip(1), first()).toPromise();
                    component.openCancelConfirmationModal();
                    expect(await isSavingPromise).toBe(true);
                });

                it("should disable the save button while saving", async () => {
                    const isSaveButtonDisabled = await component.isSaveButtonDisabled$.pipe(first()).toPromise();

                    expect(isSaveButtonDisabled).toBe(true);
                });

                describe("response valid", () => {

                    it("should return MTA ID", async () => {
                        const mtaId = await component.mtaId$.pipe(first()).toPromise();
                        expect(mtaId.toString()).toBe(testMtaId);
                    });

                    it("should reset saving state", async () => {
                        const isSaving = await component.isSaving$.pipe(first()).toPromise();
                        expect(isSaving).toBe(false);
                    });

                    it("should disable the save button after a MTA has been saved", async () => {
                        const isSaveButtonDisabled = await component.isSaveButtonDisabled$.pipe(first()).toPromise();

                        expect(isSaveButtonDisabled).toBe(true);
                    });
                });

                it("should handle missing MTA error when response is invalid", () => {
                    // Arrange
                    mockMtaService.postCancellation = jasmine.createSpy().and.returnValue(of({ mtaId: "" }));

                    // Act
                    component.openCancelConfirmationModal();

                    // Assert
                    expect(mockMessageService.sendMessage).toHaveBeenCalledTimes(1);
                    expect(mockMessageService.sendMessage).toHaveBeenCalledWith({
                        text: "An error occurred while submitting your change. Please contact IT Support.",
                        type: MessageType.Error,
                        messageList: ["MTA ID not returned."],
                    });
                });
            });
        });

        describe("isPremiumReadOnly$", () => {
            it("should allow to edit premium and fee when performing a mid term cancellation", fakeAsync(async () => {
                // Act
                component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                tick(500);

                // Assert
                const isPremiumReadOnly = await component.isPremiumReadOnly$.pipe(first()).toPromise();
                expect(isPremiumReadOnly).toBe(false);
                discardPeriodicTasks();
            }));

            it("should not allow to edit premium and fee when performing an ab initio cancellation when loading the modal and not changing the effective date", async () => {
                const isPremiumReadOnly = await component.isPremiumReadOnly$.pipe(first()).toPromise();
                expect(isPremiumReadOnly).toBe(true);
            });

            it("should not allow to edit premium and fee when performing an ab initio cancellation after changing the effective date", fakeAsync(async () => {
                // Act
                component.formGroup.controls.effectiveDate.setValue(testInceptionDate);
                tick(500);

                // Assert
                const isPremiumReadOnly = await component.isPremiumReadOnly$.pipe(first()).toPromise();
                expect(isPremiumReadOnly).toBe(true);
                discardPeriodicTasks();
            }));
        });

        describe("isSaveButtonDisabled$", () => {
            it("should disable the save button while loading", async () => {
                component.isLoading$ = of(true);
                const isSaveButtonDisabled = await component.isSaveButtonDisabled$.pipe(first()).toPromise();

                expect(isSaveButtonDisabled).toBe(true);
            });
        });

        describe("setPremiumValidators", () => {
            it("should display validation error when cancellation is mid-term and total return premium is empty", fakeAsync(() => {
                //Arrange
                component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                tick(500);

                // Act
                component.formGroup.controls.totalReturnPremium.setValue(null);
                tick(250);

                // Assert
                expect(component.formGroup.controls.totalReturnPremium.errors).toEqual({ required: true });
            }));

            it("should not display a validation error when cancellation is mid-term and total return premium is a valid number", fakeAsync(() => {
                //Arrange
                component.formGroup.controls.effectiveDate.setValue(testMidTermEffectiveDate);
                tick(500);

                // Act
                component.formGroup.controls.totalReturnPremium.setValue(12);
                tick(250);

                // Assert
                expect(component.formGroup.controls.totalReturnPremium.errors).toBeNull();
            }));

            it("should not display a validation error when premium is a valid number for an Ab Initio Cancellation", fakeAsync(() => {
                // Act
                component.formGroup.controls.totalReturnPremium.setValue(12);
                tick(250);

                // Assert
                expect(component.formGroup.controls.totalReturnPremium.errors).toBeNull();
            }));
        });
    });
});
