import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { mockCfcContact } from '@app/mocks/cfc-contact.mock';
import { NameChangeMtaRequest } from '@app/policy/models/NameChangeMtaRequest';
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from 'guid-typescript';
import { of } from 'rxjs';
import { MtaClientNameChangeComponent } from "./mta-client-name-change.component";
import * as nameChangeMocks from "./mta-client-name-change.component.mock";

describe("MtaClientNameChangeComponent", () => {
    let component: MtaClientNameChangeComponent;
    let fixture: ComponentFixture<MtaClientNameChangeComponent>;

    const testModuleConfiguration = {
        declarations: [
            MtaClientNameChangeComponent,
            mtaMocks.MockSharedFormCreatorComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: MessageService, useValue: mtaMocks.mockMessageService },
            { provide: MtaService, useValue: mtaMocks.mockMtaHttpService },
            { provide: UserService, useValue: mtaMocks.mockUserServiceTest },
            { provide: FormCreatorService, useValue: mtaMocks.mockFormCreatorService },
            { provide: ModalDialogService, useValue: { openDialog: () => {} } }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(MtaClientNameChangeComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();
        component["sendButton"] = new mtaMocks.SendButton();
        component["sendButtonProperty"] = "name-change-send";

        component.dialogModel = nameChangeMocks.mockMtaModalModel;

        mtaMocks.mockUserServiceTest.getUser.and.returnValue(mtaMocks.mockUserProfile);
    });

    it("should create Name Change component", () => {
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

    it("should handle name change form", () => {
        //Arrange
        const spyHandleButtonsState = spyOn(component, "handleButtonsState");
        const spyHandleFieldsState = spyOn(component, "handleFieldsState");
        const spyOpenSendEmailModal = spyOn(component, "openSendEmailModal").and.callFake(() => { });

        // Act
        component.formHandler();

        // Assert
        expect(component.nameChangeForm$).toBeDefined();
        expect(component.formButtonClicked$).toBeDefined();
        expect(component.nameChangeForm).toEqual(mtaMocks.mockMtaForm);
        expect(spyHandleButtonsState).toHaveBeenCalled();
        expect(spyHandleFieldsState).toHaveBeenCalled();
        expect(spyOpenSendEmailModal).toHaveBeenCalled();
    });

    it("should enable effective date when change type is endorsement", () => {
        //Arrange
        component.nameChangeForm = mtaMocks.mockMtaForm;
        component.nameChangeForm.form.get("effectiveDate").disable();
        component.nameChangeForm.form.get("changeType").setValue("Endorsement");
        component.nameChangeForm.form.enable();

        // Act
        component.handleFieldsState();

        // Assert
        expect(component.nameChangeForm.form.get("effectiveDate").enabled).toBeTruthy();
    });

    it("should disable effective date when change type is policyreissue", () => {
        //Arrange
        component.nameChangeForm = mtaMocks.mockMtaForm;
        component.nameChangeForm.form.get("changeType").setValue("PolicyReissue");

        // Act
        component.handleFieldsState();

        // Assert
        expect(component.nameChangeForm.form.get("effectiveDate").disabled).toBeTruthy();
    });

    it("should disable buttons if form invalid or button is executing", () => {
        //Arrange
        component.nameChangeForm = mtaMocks.mockMtaForm;
        const spyOnDisableBothButtons = spyOn(component, "disableBothButtons");
        component.areButtonsSet = () => true;
        component.isButtonExecuting = () => true;

        // Act
        component.handleButtonsState();

        // Assert
        expect(spyOnDisableBothButtons).toHaveBeenCalled();
    });

    it("should enable button save and disable send if form is valid and not executing", () => {
        //Arrange
        component.nameChangeForm = mtaMocks.mockMtaForm;
        const spyOnEnableSaveDisableSend = spyOn(component, "enableSaveDisableSend");
        component.areButtonsSet = () => true;
        component.isButtonExecuting = () => false;

        // Act
        component.handleButtonsState();

        // Assert
        expect(spyOnEnableSaveDisableSend).toHaveBeenCalled();
    });

    it("should disable save and send buttons", () => {
        //Arrange
        component["saveButton"].disable = false;

        // Act
        component.disableBothButtons();

        // Assert
        expect(component["saveButton"].disable).toBeTruthy();
        expect(component["sendButton"].disable).toBeTruthy();
    });

    it("should enable save and disable send button", () => {
        //Arrange
        component["saveButton"].disable = true;

        // Act
        component.enableSaveDisableSend();

        // Assert
        expect(component["saveButton"].disable).toBeFalsy();
        expect(component["sendButton"].disable).toBeTruthy();
    });

    it("should save and send buttons exist", () => {
        //Arrange
        component["saveButton"].disable = true;
        component["sendButton"].disable = true;

        // Act
        const areButtonsSet = component.areButtonsSet();

        // Assert
        expect(areButtonsSet).toBeTruthy();
    });

    it("should save button be executing", () => {
        //Arrange
        component["saveButton"].isExecuting = true;
        component.areButtonsSet = () => true;

        // Act
        const isButtonExecuting = component.isButtonExecuting();

        // Assert
        expect(isButtonExecuting).toBeTruthy();
    });

    it("should save button not be executing", () => {
        //Arrange
        component["saveButton"].isExecuting = false;
        component.areButtonsSet = () => false;

        // Act
        const isButtonExecuting = component.isButtonExecuting();

        // Assert
        expect(isButtonExecuting).toBeFalsy();
    });

    it("should call openWarningModal when validForm event", () => {
        //Arrange
        let openWarningModalMethod = spyOn(component, "openWarningModal");
        let saveMethod = spyOn(component, "save");

        // Act
        fixture.detectChanges();
        fixture.componentInstance.sharedFormCreatorComponent.validForm.emit(true);

        // Assert
        expect(openWarningModalMethod).toHaveBeenCalled();
        expect(saveMethod).not.toHaveBeenCalled();
    });

    it("should openWarningModal call save when result is true", () => {
        //Arrange
        component["saveButton"].isExecuting = false;
        component.areButtonsSet = () => false;
        let saveMethod = spyOn(component, "save");
        spyOn(
            component.modalDialogService,
            "openDialog"
        ).and.callFake((template, config, set, afterclose) => {
            afterclose(true);
        });

        // Act
        component.openWarningModal(null);

        // Assert
        expect(saveMethod).toHaveBeenCalled();
    });

    it("should openWarningModal not call save when result is false", () => {
        //Arrange
        component["saveButton"].isExecuting = false;
        component.areButtonsSet = () => false;
        let saveMethod = spyOn(component, "save");
        spyOn(
            component.modalDialogService,
            "openDialog"
        ).and.callFake((template, config, set, afterclose) => {
            afterclose(false);
        });

        // Act
        component.openWarningModal(null);

        // Assert
        expect(saveMethod).not.toHaveBeenCalled();
    });

    it("should save a name change request", () => {
        //Arrange
        component["saveButton"].isExecuting = false;
        const mtaGuid = { mtaId: "213213-ASD22-0000-0000-000033000000" };
        const nameChangeMtaRequest = new NameChangeMtaRequest();
        nameChangeMtaRequest.cfcUserId = mockCfcContact.cfcContactUid;
        nameChangeMtaRequest.policyNumber = "ES2983283";

        component.mtaNameChangeRequestBuilder = () => nameChangeMtaRequest;

        mtaMocks.mockMtaHttpService.postNameChangeMta.and.returnValue(of(mtaGuid));
        component.nameChangeForm = mtaMocks.mockMtaForm;

        // Act
        component.save(nameChangeMtaRequest);

        // Assert
        expect(component.mtaId).toEqual(Guid.parse(mtaGuid.mtaId));
    });

    it("should display an error when there's not mtaId in the request return", () => {
        //Arrange
        component["saveButton"].isExecuting = false;
        const nameChangeMtaRequest = new NameChangeMtaRequest();
        nameChangeMtaRequest.cfcUserId = mockCfcContact.cfcContactUid;
        nameChangeMtaRequest.policyNumber = "ES2983283";
        const spyHandleError = spyOn(component, "handleError");

        component.mtaNameChangeRequestBuilder = () => nameChangeMtaRequest;

        component.nameChangeForm = mtaMocks.mockMtaForm;
        mtaMocks.mockMtaHttpService.postNameChangeMta.and.returnValue(of({}));

        // Act
        component.save(nameChangeMtaRequest);

        // Assert
        expect(spyHandleError).toHaveBeenCalled();
    });
});
