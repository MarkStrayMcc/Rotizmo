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
import { MtaLossPayeeComponent } from "./mta-loss-payee.component";
import * as lossPayeeMocks from "./mta-loss-payee.component.mock";
import { DropdownService } from "@app/services/dropdown.service";
import { ErrorModule } from "@app/shared/error.module";
import { MockMatspinnerComponent as MockMatSpinnerComponent, MockMessageComponent } from "@app/shared/form-creator/form-creator.component.mock";
import { MockDatePickerComponent } from "@app/mocks/components.mocks";
import { forwardRef } from "@angular/core";
import mockLossPayee = lossPayeeMocks.mockLossPayee;
import { of } from "rxjs";
import { Guid } from "guid-typescript/dist/guid";
import { Country } from "@app/models/auto-generated/Country";
import { PolicyLossPayeeService } from "@app/policy/services/policy-loss-payee.service";
import { LossPayeeConfigBuilder } from "@app/shared/loss-payee/loss-payee.config-builder";
import { InterestOfEntity } from "@app/models/InterestOfEntity";
import { ILossPayeeDetails } from "../../../../shared/loss-payee/ILossPayeeDetails";

describe("MtaLossPayeeComponent", () => {
    let component: MtaLossPayeeComponent;
    let fixture: ComponentFixture<MtaLossPayeeComponent>;

    const testModuleConfiguration = {
        declarations: [
            MtaLossPayeeComponent,
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
            { provide: MtaService, useValue: mtaMocks.mockMtaHttpService },
            { provide: MatDialogRef, useClass: mtaMocks.MockMatDialogRef },
            { provide: UserService, useValue: mtaMocks.mockUserServiceTest },
            { provide: FormCreatorService, useValue: mtaMocks.mockLossPayeeFormCreatorService },
            { provide: ModalDialogService, useValue: mtaMocks.MockModalDialogService },
            { provide: DropdownService, useValue: mtaMocks.mockDropDownService },
            { provide: FormBuilder, useClass: FormBuilder },
            { provide: PolicyLossPayeeService, useValue: mtaMocks.mockPolicyLossPayeeService },
            { provide: LossPayeeConfigBuilder, useValue: mtaMocks.mockLossPayeeConfigBuilder },
            {
                provide: NG_VALUE_ACCESSOR,
                multi: true,
                useExisting: forwardRef(() => MtaLossPayeeComponent),
            }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(MtaLossPayeeComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();
        component["sendButton"] = new mtaMocks.SendButton();

        mtaMocks.mockUserServiceTest.getUser.and.returnValue(mtaMocks.mockUserProfile);
    });

    it("should create Loss Payee component", () => {
        expect(component).toBeDefined();
    });

    it("should call formHandler on init", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        const spyFormHandler = spyOn(component, "formHandler");
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));
        mtaMocks.mockPolicyLossPayeeService.getLossPayees.and.returnValue(of([mockLossPayee, mockLossPayee]));

        // Act
        component.ngOnInit();

        // Assert
        expect(spyFormHandler).toHaveBeenCalled();
    });

    it("should call setConfig on addAddress", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;

        // Act
        component.addLossPayee();

        // Assert
        expect(mtaMocks.mockLossPayeeConfigBuilder.setConfig).toHaveBeenCalled();
    });

    it("Should set the user profile on init", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));
        mtaMocks.mockPolicyLossPayeeService.getLossPayees.and.returnValue(of([mockLossPayee, mockLossPayee]));

        // Act
        component.ngOnInit();

        expect(component.userProfile).toBeDefined();
    });

    it("should handle loss payee form", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;

        // Act
        component.formHandler();

        // Assert
        expect(component.lossPayeeForm).toBeDefined();
        expect(component.lossPayeeForm).toEqual(mtaMocks.mockLossPayeeMtaForm);
        expect(component.addButton.disable).toBeFalsy();
        expect(component.isSaveDisabled).toBeTruthy();
    });

    it("should enable save button", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        let formValues: any = [mockLossPayee];

        // Act
        component.addToList(formValues);

        // Assert
        expect(component.lossPayeeDetails.length).toEqual(1);
        expect(component.isSaveDisabled).toBeFalsy();
        expect(component.isSendDisabled).toBeTruthy();
    });

    it("should enable send button after save", () => {
        // Arrange
        component["saveButton"] = new mtaMocks.SaveButton();
        component["sendButton"] = new mtaMocks.SendButton();
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        const mtaGuid = { mtaId: "213213-ASD22-0000-0000-000033000000" };
        mtaMocks.mockMtaHttpService.postLossPayeeMta.and.returnValue(of(mtaGuid));
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));
        mtaMocks.mockPolicyLossPayeeService.getLossPayees.and.returnValue(of([mockLossPayee, mockLossPayee]));
        component.ngOnInit();

        // Act
        component.save();

        // Assert
        expect(mtaMocks.mockMtaHttpService.postLossPayeeMta).toHaveBeenCalled();
        expect(component.isSaveDisabled).toBeTruthy();
        expect(component.isSendDisabled).toBeFalsy();
    });

    it("should delete from list", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        let lossPayeeId1 = Guid.create();
        let lossPayeeId2 = Guid.create();

        // add 2 loss payees to the list
        let lossPayeeDetails1 = {} as any;
        lossPayeeDetails1.id = lossPayeeId1;
        lossPayeeDetails1.lossPayee = mockLossPayee;
        component.lossPayeeDetails.push(lossPayeeDetails1);

        let lossPayeeDetails2 = {} as any;
        lossPayeeDetails2.id = lossPayeeId2;
        lossPayeeDetails2.lossPayee = mockLossPayee;
        component.lossPayeeDetails.push(lossPayeeDetails2);

        component.isSaveDisabled = false;

        // Act
        component.deleteLossPayee(lossPayeeId2);

        // Assert
        expect(component.lossPayeeDetails.length).toEqual(1);
        expect(component.isSaveDisabled).toBeFalsy();
    });

    it("should disable add button when editing", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        var id = Guid.create();

        let lossPayeeDetails = {} as any;
        lossPayeeDetails.id = id;
        lossPayeeDetails.lossPayee = mockLossPayee;
        component.lossPayeeDetails.push(lossPayeeDetails);
        component.addButton = mtaMocks.mockLossPayeeFormButton;
        component.countries = [{ hidden: "US" }];

        // Act
        component.editLossPayee(id);

        // Assert
        expect(component.isSaveDisabled).toBeTruthy();
        expect(component.isSendDisabled).toBeTruthy();
    });

    it("should set loss payee as visible when editing", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        var id = Guid.create();

        let lossPayeeDetails = {} as any;
        lossPayeeDetails.id = id;
        lossPayeeDetails.lossPayee = mockLossPayee;
        component.lossPayeeDetails.push(lossPayeeDetails);
        component.addButton = mtaMocks.mockLossPayeeFormButton;
        component.countries = [{ hidden: "US" }];

        // Act
        component.editLossPayee(id);

        // Assert
        let lossPayeeDetail = component.lossPayeeDetails.find(lossPayeeDetail => lossPayeeDetail.id === id);
        expect(lossPayeeDetail).toBeTruthy();
        expect(lossPayeeDetail.isVisible).toBeTruthy();
    });

    it("should set the interest of entity when editing", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        var id = Guid.create();

        let lossPayeeDetails = {} as ILossPayeeDetails;
        lossPayeeDetails.id = id;
        lossPayeeDetails.lossPayee = mockLossPayee;
        component.lossPayeeDetails.push(lossPayeeDetails);
        component.addButton = mtaMocks.mockLossPayeeFormButton;
        component.countries = [{ hidden: "US" }];

        // Act
        component.editLossPayee(id);

        // Assert
        let interestOfEntityField = component.formModalConfig.groups[0].fields.find(field => field.property === "interestOfEntity");
        expect(interestOfEntityField).toBeTruthy();
        expect(interestOfEntityField.value).toBeDefined();
        expect(interestOfEntityField.value).toBe(InterestOfEntity.Landlord);
    });

    it("should use a loss payee copy for editing when editing", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        var id = Guid.create();

        let lossPayeeDetails = {} as ILossPayeeDetails;
        lossPayeeDetails.id = id;
        lossPayeeDetails.lossPayee = mockLossPayee;
        component.lossPayeeDetails.push(lossPayeeDetails);
        component.addButton = mtaMocks.mockLossPayeeFormButton;
        component.countries = [{ hidden: "US" }];

        // Act
        component.editLossPayee(id);
        component.lossPayeeForEditing.entityName = "Test Entity";

        // Assert
        expect(component.lossPayeeForEditing.entityName).not.toBe(lossPayeeDetails.lossPayee.entityName);
        expect(component.lossPayeeForEditing.city).toBe(lossPayeeDetails.lossPayee.city);
    });

    it("should load existing loss payees on init", () => {
        // Arrange
        component.dialogModel = lossPayeeMocks.mockMtaModalModel;
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));
        mtaMocks.mockPolicyLossPayeeService.getLossPayees.and.returnValue(of([mockLossPayee, mockLossPayee]));

        // Act
        component.ngOnInit();

        // Assert
        expect(mtaMocks.mockPolicyLossPayeeService.getLossPayees).toHaveBeenCalled();
        expect(component.lossPayeeDetails.length).toBe(2);
        expect(component.lossPayeeDetails[0].lossPayee.entityName).toBe(mockLossPayee.entityName);
    });
});
