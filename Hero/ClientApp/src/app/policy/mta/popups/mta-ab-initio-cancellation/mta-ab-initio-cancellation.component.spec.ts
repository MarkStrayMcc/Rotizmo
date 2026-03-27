import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { mockCfcContact } from "@app/mocks/cfc-contact.mock";
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import { CancellationMtaRequest } from "@app/policy/models/CancellationMtaRequest";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from "guid-typescript";
import { of } from "rxjs";
import { MtaAbInitioCancellationComponent } from "./mta-ab-initio-cancellation.component";
import * as cancellationMocks from "./mta-ab-initio-cancellation.component.mock";

describe("MtaCancellationComponent", () => {
    let component: MtaAbInitioCancellationComponent;
    let userService: UserService;
    let fixture: ComponentFixture<MtaAbInitioCancellationComponent>;

    const testModuleConfiguration = {
        declarations: [
            MtaAbInitioCancellationComponent,
            mtaMocks.MockSharedFormCreatorComponent,
        ],
        imports: [CommonModule, ReactiveFormsModule],
        providers: [
            { provide: MessageService, useValue: mtaMocks.mockMessageService },
            { provide: MtaService, useValue: mtaMocks.mockMtaHttpService },
            { provide: MatDialogRef, useClass: mtaMocks.MockMatDialogRef },
            { provide: UserService, useValue: mtaMocks.mockUserServiceTest },
            {
                provide: FormCreatorService,
                useValue: mtaMocks.mockCancellationFormCreatorService,
            },
            {
                provide: ModalDialogService,
                useClass: mtaMocks.MockModalDialogService,
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(MtaAbInitioCancellationComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();
        component["sendButton"] = new mtaMocks.SendButton();
        component["sendButtonProperty"] = "cancellation-send";

        component.dialogModel = cancellationMocks.mockMtaModalModel;

        mtaMocks.mockUserServiceTest.getUser.and.returnValue(
            mtaMocks.mockUserProfile
        );
    });

    it("should create Cancellation component", () => {
        expect(component).toBeDefined();
    });

    it("should call setConfig and formHandler on init", () => {
        // Arrange
        component.cancellationForm = mtaMocks.mockCancellationMtaForm;
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
        component.cancellationForm = mtaMocks.mockCancellationMtaForm;
        component.ngOnInit();

        // Assert
        fixture.detectChanges();
        expect(component.userProfile).toBeDefined();
    });

    it("should set config", () => {
        // Act
        component.cancellationForm = mtaMocks.mockCancellationMtaForm;
        component.ngOnInit();

        // Assert
        fixture.detectChanges();
        expect(component.formModalConfig).toBeDefined();
    });

    it("should handle cancellation form", () => {
        //Arrange
        const spyHandleButtonsState = spyOn(component, "handleButtonsState");

        // Act
        component.formHandler();

        // Assert
        expect(component.cancellationForm$).toBeDefined();
        expect(component.formButtonClicked$).toBeDefined();
        expect(component.cancellationForm).toEqual(
            mtaMocks.mockCancellationMtaForm
        );
        expect(spyHandleButtonsState).toHaveBeenCalled();
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

    it("should save a cancellation request", () => {
        //Arrange
        component["saveButton"].isExecuting = false;
        const mtaGuid = { mtaId: Guid.create().toString() };
        const cancellationRequest = new CancellationMtaRequest();
        cancellationRequest.cfcUserId = mockCfcContact.cfcContactUid;

        component.mtaCancellationRequestBuilder = () => cancellationRequest;

        mtaMocks.mockMtaHttpService.postCancellation.and.returnValue(
            of(mtaGuid)
        );
        component.cancellationForm = mtaMocks.mockCancellationMtaForm;

        // Act
        component.save(cancellationRequest);

        // Assert
        expect(component.mtaId).toEqual(Guid.parse(mtaGuid.mtaId));
    });

    it("should display an error when there's not mtaId in the cancellation request return", () => {
        //Arrange
        component["saveButton"].isExecuting = false;
        const cancellationMtaRequest = new CancellationMtaRequest();
        cancellationMtaRequest.cfcUserId = mockCfcContact.cfcContactUid;
        const spyHandleError = spyOn(component, "handleError");

        component.mtaCancellationRequestBuilder = () => cancellationMtaRequest;

        component.cancellationForm = mtaMocks.mockCancellationMtaForm;
        mtaMocks.mockMtaHttpService.postCancellation.and.returnValue(of({}));

        // Act
        component.save(cancellationMtaRequest);

        // Assert
        expect(spyHandleError).toHaveBeenCalled();
    });

    it("should set the confirmation modal config", () => {
        //Arrange
        const modalSpy = spyOn(component.modalDialogService, "openDialog");

        // Act
        component.openConfirmationModal(mtaMocks.mockMtaForm.form.value);

        // Assert
        expect(modalSpy).toHaveBeenCalled();
    });
});
