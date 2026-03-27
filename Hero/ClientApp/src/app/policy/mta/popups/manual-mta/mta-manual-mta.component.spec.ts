import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { MtaTypeEnum } from "@app/policy/enums/MtaType";
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { MtaManualChangeMtaComponent } from "./mta-manual-mta.component";
import * as manualMtaMocks from "./mta-manual-mta.component.mock";

describe("MtaManualMtaComponent", () => {
    let component: MtaManualChangeMtaComponent;
    let fixture: ComponentFixture<MtaManualChangeMtaComponent>;

    const testModuleConfiguration = {
        declarations: [
            MtaManualChangeMtaComponent,
            mtaMocks.MockSharedFormCreatorComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: MessageService, useValue: mtaMocks.mockMessageService },
            { provide: MtaService, useValue: mtaMocks.mockMtaHttpService },
            { provide: MatDialogRef, useClass: mtaMocks.MockMatDialogRef },
            { provide: UserService, useValue: mtaMocks.mockUserServiceTest },
            { provide: FormCreatorService, useValue: mtaMocks.mockManualMtaFormCreatorService }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(MtaManualChangeMtaComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();

        component.dialogModel = manualMtaMocks.mockMtaModalModel;

        mtaMocks.mockUserServiceTest.getUser.and.returnValue(mtaMocks.mockUserProfile);
        
    });
    
    it("should create Manual Mta component", () => {
        expect(component).toBeDefined();
    });

    it("should call setConfig and formHandler on init", () => {
        // Arrange
        const spyFormHandler = spyOn(component, "formHandler");
        const spySetConfig = spyOn(component, "setConfig");

        // Act
        component.ngOnInit();

        // Assert
        expect(spyFormHandler).toHaveBeenCalled();
        expect(spySetConfig).toHaveBeenCalled();
    });

    it("Should set the user profile on init", () => {
        // Act
        component.ngOnInit();

        fixture.detectChanges();
        expect(component.userProfile).toBeDefined();
    });

    it("should set config", () => {
        // Act
        component.ngOnInit();

        // Assert
        fixture.detectChanges();
        expect(component.formModalConfig).toBeDefined();
    });

    it("should not validate when the effective date is filled in and within the policy period", () => {
        // Arrange
        component.dialogModel.policy.inceptionDate = new Date('Fri May 28 2021 00:00:00').toString();
        component.dialogModel.policy.expirationDate = new Date('Wed Jun 23 2021 00:00:00').toString();
        component.manualMtaForm = mtaMocks.mockManualMtaForm;

        // Act
        component.manualMtaForm.form.get("effectiveDate").setValue(new Date('Mon May 31 2021 00:00:00'));

        // Assert
        expect(component.manualMtaForm.form.get("effectiveDate").errors).toBeNull();
    });

    it("should display an error message when the effective date is earlier than the inception date", () => {
        // Arrange
        component.dialogModel.policy.inceptionDate = new Date('Fri May 28 2021 00:00:00').toString();
        component.dialogModel.policy.expirationDate = new Date('Wed Jun 23 2021 00:00:00').toString();
        component.manualMtaForm = mtaMocks.mockManualMtaForm;

        // Act
        component.manualMtaForm.form.get("effectiveDate").setValue(new Date('Mon May 24 2021 00:00:00'));

        // Assert
        expect(component.manualMtaForm.form.get("effectiveDate").errors.beforeMinimumDate).toBeTruthy();
    });

    it("should display an error message when the effective date is later than the expiration date", () => {
        // Arrange
        component.dialogModel.policy.inceptionDate = new Date('Fri May 28 2021 00:00:00').toString();
        component.dialogModel.policy.expirationDate = new Date('Wed Jun 23 2021 00:00:00').toString();
        component.manualMtaForm = mtaMocks.mockManualMtaForm;

        // Act
        component.manualMtaForm.form.get("effectiveDate").setValue(new Date('Mon Jun 29 2021 00:00:00'));

        // Assert
        expect(component.manualMtaForm.form.get("effectiveDate").errors.afterMaximumDate).toBeTruthy();
    });

    it("should not display an error if MTA type is selected", () => {
        // Arrange

        // Act
        component.ngOnInit();
        component.manualMtaForm.form.get("manualChangeType").setValue(MtaTypeEnum.LimitChange);

        // Assert
        expect(component.manualMtaForm.form.get("manualChangeType").errors).toBeNull();
    });

    it("should display an error if no MTA type is selected", () => {
        // Arrange

        // Act
        component.ngOnInit();
        component.manualMtaForm.form.get("manualChangeType").setValue(null);

        // Assert
        expect(component.manualMtaForm.form.get("manualChangeType").errors.required).toBeTruthy();
    });

    it("should display an error if mta type Policy Correction is selected and no description is provided", () => {
        // //Arrange
        const mockForm = mtaMocks.mockManualMtaFormGroupWithDateValidator;

        // Act
        mockForm.get("description").setValue(null);
        mockForm.get("manualChangeType").setValue("PolicyCorrection");

        // Assert
        expect(component["descriptionValidation"](mockForm.controls.description)).toEqual({
            manualMtaDescription: true
        });
    });

    it("should display an error if mta type Other is selected and no description is provided", () => {
        // Arrange
        const mockForm = mtaMocks.mockManualMtaFormGroupWithDateValidator;

        // Act
        mockForm.get("description").setValue(null);
        mockForm.get("manualChangeType").setValue(MtaTypeEnum.Other);

        // Assert
        expect(component["descriptionValidation"](mockForm.controls.description)).toEqual({
            manualMtaDescription: true
        });
    });

    it("should not display an error if the description field is empty and mta type value is different than Policy Correction or Other", () => {
        // Arrange
        const mockForm = mtaMocks.mockManualMtaFormGroupWithDateValidator;

        // Act
        mockForm.get("manualChangeType").setValue(MtaTypeEnum.Extension);

        // Assert
        expect(component["descriptionValidation"](mockForm.controls.description)).toBeNull();
    });

    it("should not display an error if the description field has been filled up", () => {
        // Arrange
        const mockForm = mtaMocks.mockManualMtaFormGroupWithDateValidator;

        // Act
        mockForm.get("manualChangeType").setValue(MtaTypeEnum.Other);
        mockForm.get("description").setValue("test");

        // Assert
        expect(component["descriptionValidation"](mockForm.controls.description)).toBeNull();
    });
});
