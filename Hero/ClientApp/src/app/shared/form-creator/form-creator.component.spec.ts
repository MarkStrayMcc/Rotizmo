import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedFormCreatorComponent } from "./form-creator.component";
import { FormCreatorService } from '../services/form-creator.service';
import * as formCreatorMocks from './form-creator.component.mock';
import { MessageService } from '@app/services/message.service';
import { ErrorMessageHandlerService } from '@app/services/error-message-handler.service';
import { SimpleChanges, SimpleChange } from '@angular/core';
import { FormButton, FormButtonTypes } from './form-creator.config';
import { OneColumnTemplateComponent } from
    "@app/shared/form-creator/templates/one-column/one-column-template.component";
import { TwoColumnsTemplateComponent } from
    "@app/shared/form-creator/templates/two-columns/two-columns-template.component";

describe("FormCreatorComponent", () => {
    let component: SharedFormCreatorComponent;
    let fixture: ComponentFixture<SharedFormCreatorComponent>;

    const testModuleConfiguration = {
        declarations: [
            SharedFormCreatorComponent,
            formCreatorMocks.MockMessageComponent,
            formCreatorMocks.MockFormFieldRendererComponent,
            formCreatorMocks.MockMatspinnerComponent,
            OneColumnTemplateComponent,
            TwoColumnsTemplateComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: FormCreatorService, useValue: formCreatorMocks.mockFormCreatorService },
            { provide: ErrorMessageHandlerService, useValue: formCreatorMocks.mockErrorMessageHandlerService },
            { provide: MessageService, useValue: formCreatorMocks.mockMessageService }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(SharedFormCreatorComponent);
        component = fixture.componentInstance;
    });

    it("should create SharedFormCreator component", () => {
        expect(component).toBeDefined();
    });

    it("should call setForm service value when the form value has been changed", () => {
        // Arrange
        component.config = formCreatorMocks.mockConfig;
        const mockSimpleChange: SimpleChanges = {
            config: new SimpleChange(null, component.config, true)
        };

        const mockFormCreatorService = fixture.debugElement.injector.get(FormCreatorService);
        spyOn(mockFormCreatorService, "setForm");

        // Act
        component.ngOnChanges(mockSimpleChange);

        // Assert
        fixture.detectChanges();
        expect(mockFormCreatorService.setForm).toHaveBeenCalledTimes(1);
    });

    it("should call formCreator to set button", () => {
        // Arrange
        const mockButton: FormButton = {
            label: "mockedButton",
            property: "mockedButton",
            type: FormButtonTypes.Submit
        };
        const mockFormCreatorService = fixture.debugElement.injector.get(FormCreatorService);
        spyOn(mockFormCreatorService, "setButtonClicked");

        // Act
        component.buttonClicked(mockButton);

        // Assert
        fixture.detectChanges();
        expect(mockFormCreatorService.setButtonClicked).toHaveBeenCalledTimes(1);
    });
});


