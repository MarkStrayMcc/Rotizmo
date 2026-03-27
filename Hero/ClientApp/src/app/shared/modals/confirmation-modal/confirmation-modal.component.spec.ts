import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { FormButtonTypes } from "../../form-creator/form-creator.config";
import { ConfirmationModalComponent } from "./confirmation-modal.component";
import { ConfirmationModalModel } from "./confirmation-modal.model";

describe("MtaClientNameChangeComponent", () => {
    let component: ConfirmationModalComponent;
    let fixture: ComponentFixture<ConfirmationModalComponent>;

    const testModuleConfiguration = {
        declarations: [
            ConfirmationModalComponent,
            mtaMocks.MockSharedFormCreatorComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: MatDialogRef, useClass: mtaMocks.MockMatDialogRef },
            { provide: FormCreatorService, useValue: mtaMocks.mockFormCreatorService },
        ]
    };

    class mockConfirmationButton<FormButton> {
        public isExecuting = false;
        public disable = true;
        public label = "Yes";
        public type = FormButtonTypes.Button;
    }

    class mockCancellationButton<FormButton> {
        public isExecuting = false;
        public disable = true;
        public label = "No";
        public type = FormButtonTypes.Button;
    }

    const mockConfirmationModel: ConfirmationModalModel = {
        title: "Confirm your action",
        question: "Are you sure you want to continue?",
        confirmationButtonLabel: "Yes",
        cancellationButtonLabel: "No"
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(ConfirmationModalComponent);
        component = fixture.componentInstance;

        component["confirmationButton"] = new mockConfirmationButton();
        component["cancellationButton"] = new mockCancellationButton();

        component.dialogModel = mockConfirmationModel;
    });

    it("should create Confirmation Modal component", () => {
        expect(component).toBeDefined();
    });

    it("should set config for Confirmation Modal form", () => {
        // Act
        component.ngOnInit();

        // Assert
        fixture.detectChanges();
        expect(component.formModalConfig).toBeDefined();
    });

    it("should call setConfig and formHandler on init", () => {
        // Arrange
        component.confirmationForm = mtaMocks.mockMtaForm;
        const spyFormHandler = spyOn(component, "formHandler");
        const spySetConfig = spyOn(component, "setConfig");

        // Act
        component.ngOnInit();

        // Assert
        expect(spyFormHandler).toHaveBeenCalled();
        expect(spySetConfig).toHaveBeenCalled();
    });
});
