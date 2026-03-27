import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormBuilder, NG_VALUE_ACCESSOR, FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { MtaAdditionalInsuredComponent } from "./mta-additional-insured.component";
import { mockAdditionalInsured, mockMtaModalModel } from "./mta-additional-insured.component.mock";
import { DropdownService } from "@app/services/dropdown.service";
import { ErrorModule } from "@app/shared/error.module";
import { MockMatspinnerComponent as MockMatSpinnerComponent, MockMessageComponent } from "@app/shared/form-creator/form-creator.component.mock";
import { MockDatePickerComponent } from "@app/mocks/components.mocks";
import { forwardRef } from "@angular/core";
import { of } from "rxjs";
import { Guid } from "guid-typescript/dist/guid";
import { PolicyAdditionalInsuredService } from "@app/policy/services/policy-additional-insured.service";
import { AdditionalInsuredConfigBuilder } from "@app/shared/additional-insured/additional-insured.config-builder";
import { IAdditionalInsuredDetailsList } from "../../../../shared/additional-insured/IAdditionalInsuredDetailsList";
import * as moment from "moment";

describe("MtaAdditionalInsuredComponent", () => {
    let component: MtaAdditionalInsuredComponent;
    let fixture: ComponentFixture<MtaAdditionalInsuredComponent>;

    const testPolicyNumber = "TEST";

    const testModuleConfiguration = {
        declarations: [
            MtaAdditionalInsuredComponent,
            mtaMocks.MockSharedFormCreatorComponent,
            MockDatePickerComponent,
            MockMatSpinnerComponent,
            MockMessageComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule,
            ErrorModule,
            FormsModule
        ],
        providers: [
            { provide: MessageService, useValue: mtaMocks.mockMessageService },
            { provide: MtaService, useValue: { postAdditionalInsuredMta: () => (of({ mtaId: Guid.create() })), postLossPayeeMta: () => (of({ mtaId: Guid.create() })) } },
            { provide: MatDialogRef, useClass: mtaMocks.MockMatDialogRef },
            { provide: UserService, useValue: mtaMocks.mockUserServiceTest },
            { provide: FormCreatorService, useValue: mtaMocks.mockAdditionalInsuredFormCreatorService },
            { provide: ModalDialogService, useValue: mtaMocks.MockModalDialogService },
            { provide: DropdownService, useValue: mtaMocks.mockDropDownService },
            { provide: FormBuilder, useClass: FormBuilder },
            { provide: PolicyAdditionalInsuredService, useValue: { get: () => of([]) } },
            { provide: AdditionalInsuredConfigBuilder, useValue: mtaMocks.mockAdditionalInsuredConfigBuilder },
            {
                provide: NG_VALUE_ACCESSOR,
                multi: true,
                useExisting: forwardRef(() => MtaAdditionalInsuredComponent),
            }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(MtaAdditionalInsuredComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();
        component["sendButton"] = new mtaMocks.SendButton();
        component.dialogModel = mockMtaModalModel;

        mtaMocks.mockUserServiceTest.getUser.and.returnValue(mtaMocks.mockUserProfile);
    });

    it("should create Additional Insured component", () => {
        expect(component).toBeDefined();
    });

    it("should call setConfig on addAddress", () => {
        // Act
        component.addAdditionalInsured();

        // Assert
        expect(mtaMocks.mockAdditionalInsuredConfigBuilder.setConfig).toHaveBeenCalled();
    });

    it("should handle additional insured form", () => {
        // Act
        component.formHandler();

        // Assert
        expect(component.additionalInsuredForm).toBeDefined();
        expect(component.additionalInsuredForm).toEqual(mtaMocks.mockAdditionalInsuredMtaForm);
        expect(component.addButton.disable).toBe(false);
        expect(component.isSaveDisabled).toBe(true);
    });

    it("should enable save button", () => {
        // Arrange
        const formValues: any = [mockAdditionalInsured];

        // Act
        component.addToList(formValues);

        // Assert
        expect(component.additionalInsuredList.additionalInsureds.length).toEqual(1);
        expect(component.isSaveDisabled).toBeFalsy();
        expect(component.isSendDisabled).toBeTruthy();
    });

    describe("ngOnInit", () => {
        let mockPolicyAdditionalInsuredService: PolicyAdditionalInsuredService;

        beforeEach(() => {
            mockPolicyAdditionalInsuredService = TestBed.inject(PolicyAdditionalInsuredService);
            spyOn(mockPolicyAdditionalInsuredService, "get").and.returnValue(of([mockAdditionalInsured, mockAdditionalInsured]));
        })

        it("should call formHandler on init", () => {
            // Arrange
            const spyFormHandler = spyOn(component, "formHandler");

            // Act
            component.ngOnInit();

            // Assert
            expect(spyFormHandler).toHaveBeenCalled();
        });

        it("should set the user profile on init", () => {
            // Act
            component.ngOnInit();

            // Assert
            expect(component.userProfile).toBeDefined();
        });

        it("should get existing additional insureds for a given policy", () => {
            // Arrange
            component.dialogModel.policy.reference = testPolicyNumber;

            // Act
            component.ngOnInit();

            // Assert
            expect(mockPolicyAdditionalInsuredService.get).toHaveBeenCalledTimes(1);
            expect(mockPolicyAdditionalInsuredService.get).toHaveBeenCalledWith(testPolicyNumber);
        });

        it("should load existing additional insureds", () => {
            // Act
            component.ngOnInit();

            // Assert
            expect(component.formList.length).toBe(2);
            expect(component.formList[0].additionalInsured.entityName).toBe(mockAdditionalInsured.entityName);
        });
    });

    describe("save", () => {
        let mockMtaService: MtaService;

        beforeEach(() => {
            mockMtaService = TestBed.inject(MtaService);
            component.ngOnInit();
        });

        it("should save additional insured for a given policy", () => {
            // Arrange
            const expectedEffectiveDate = moment();
            const expectedCfcUserId = Guid.create().toString();
            const expectedAdditionalInsureds = [mockAdditionalInsured];

            component.dialogModel.policy.reference = testPolicyNumber;
            component.formList = expectedAdditionalInsureds.map(ai => <IAdditionalInsuredDetailsList>{ additionalInsured: ai }),
            component.userProfile.cfcContactUid = expectedCfcUserId;
            component.effectiveDateForm.controls.effectiveDate.setValue(expectedEffectiveDate);
            
            spyOn(mockMtaService, "postAdditionalInsuredMta").and.callThrough()

            // Act
            component.save();

            // Assert
            expect(mockMtaService.postAdditionalInsuredMta).toHaveBeenCalledTimes(1);
            expect(mockMtaService.postAdditionalInsuredMta).toHaveBeenCalledWith(testPolicyNumber, {
                additionalInsureds: expectedAdditionalInsureds,
                cfcUserId: expectedCfcUserId,
                effectiveDate: expectedEffectiveDate.toDate()
            });
        });

        it("should enable send button after save", () => {
            // Act
            component.save();

            // Assert
            expect(component.isSaveDisabled).toBe(true);
            expect(component.isSendDisabled).toBe(false);
        });
    });

    it("should delete from list", () => {
        // Arrange
        const additionalInsuredToBeDeleted = { id: Guid.create(), additionalInsured: mockAdditionalInsured };

        component.isSaveDisabled = false;
        component.formList.push(<IAdditionalInsuredDetailsList>additionalInsuredToBeDeleted)
        component.formList.push(<IAdditionalInsuredDetailsList>{ id: Guid.create(), additionalInsured: mockAdditionalInsured });

        // Act
        component.deleteAdditionalInsured(additionalInsuredToBeDeleted.id);

        // Assert
        expect(component.formList.length).toEqual(1);
        expect(component.isSaveDisabled).toBeFalsy();
    });

    describe("editAdditionalInsured", () => {
        let additionalInsuredDetailsList: IAdditionalInsuredDetailsList;

        beforeEach(() => {
            additionalInsuredDetailsList = { id: Guid.create(), additionalInsured: mockAdditionalInsured, isVisible: false };

            component.formList.push(additionalInsuredDetailsList);
            component.addButton = mtaMocks.mockAdditionalInsuredFormButton;
            component.countries = [{ hidden: "US" }];
        });

        it("should disable add button when editing", () => {
            // Act
            component.editAdditionalInsured(additionalInsuredDetailsList.id);

            // Assert
            expect(component.isSaveDisabled).toBeTruthy();
            expect(component.isSendDisabled).toBeTruthy();
        });

        it("should set additional insured as visible when editing", () => {
            // Act
            component.editAdditionalInsured(additionalInsuredDetailsList.id);

            // Assert
            const additionalInsuredDetail = component.formList.find(
                additionalInsuredDetail => additionalInsuredDetail.id === additionalInsuredDetailsList.id
            );

            expect(additionalInsuredDetail).toBeTruthy();
            expect(additionalInsuredDetail.isVisible).toBeTruthy();
        });

        it("should use an additional insured copy for editing when editing", () => {
            // Act
            component.editAdditionalInsured(additionalInsuredDetailsList.id);
            component.additionalInsuredForEditing.entityName = "Test Entity";

            // Assert
            expect(component.additionalInsuredForEditing.entityName).not.toBe(additionalInsuredDetailsList.additionalInsured.entityName);
            expect(component.additionalInsuredForEditing.city).toBe(additionalInsuredDetailsList.additionalInsured.city);
        });
    });
});
