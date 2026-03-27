import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed, fakeAsync } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { DropdownService } from '@app/services/dropdown.service';
import { MockMatspinnerComponent as MockMatSpinnerComponent } from "@app/shared/form-creator/form-creator.component.mock";
import { QuoteAdditionalInsuredComponent } from
    "@app/quote/popups/quote-additional-insured-modal/quote-additional-insured.component";
import { Country } from "@app/models/auto-generated/Country";
import { of } from 'rxjs';
import { mockAdditionalInsured, mockAdditionalInsuredConfigBuilder } from
    "@app/quote/popups/quote-additional-insured-modal/quote-additional-insured.component.mock";
import { Guid } from 'guid-typescript';
import { Quote } from "@app/models/auto-generated/Quote";
import { AdditionalInsuredConfigBuilder } from "@app/shared/additional-insured/additional-insured.config-builder";
import { AdditionalInsured } from '../../../models/auto-generated';

describe("QuoteAdditionalInsuredComponent", () => {
    let component: QuoteAdditionalInsuredComponent;
    let fixture: ComponentFixture<QuoteAdditionalInsuredComponent>;

    const testModuleConfiguration = {
        declarations: [
            QuoteAdditionalInsuredComponent,
            mtaMocks.MockSharedFormCreatorComponent,
            MockMatSpinnerComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule,
            FormsModule
        ],
        providers: [
            { provide: MatDialogRef, useClass: mtaMocks.MockMatDialogRef },
            { provide: UserService, useValue: mtaMocks.mockUserServiceTest },
            { provide: FormCreatorService, useValue: mtaMocks.mockAdditionalInsuredFormCreatorService },
            { provide: ModalDialogService, useValue: mtaMocks.MockModalDialogService },
            { provide: DropdownService, useValue: mtaMocks.mockDropDownService },
            { provide: AdditionalInsuredConfigBuilder, useValue: mockAdditionalInsuredConfigBuilder }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(QuoteAdditionalInsuredComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();
        component.quote = new Quote;
        mtaMocks.mockUserServiceTest.getUser.and.returnValue(mtaMocks.mockUserProfile);
    });

    it("should create Additional Insured component", () => {
        expect(component).toBeDefined();
    });

    it("should call formHandler on init", () => {
        // Arrange
        const spyFormHandler = spyOn(component, "formHandler");
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));
      
        // Act
        component.ngOnInit();

        // Assert
        expect(spyFormHandler).toHaveBeenCalled();
    });

    it("should call setConfig on addAdditionalInsured", () => {
        // Act
        component.addAdditionalInsured();

        // Assert
        expect(mockAdditionalInsuredConfigBuilder.setConfig).toHaveBeenCalled();
    });

    it("Should set the user profile on init", () => {
        // Arrange
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));

        // Act
        component.ngOnInit();

        expect(component.userProfile).toBeDefined();
    });

    it("should handle additional insured form", () => {
        // Act
        component.formHandler();

        // Assert
        expect(component.additionalInsuredForm).toBeDefined();
        expect(component.additionalInsuredForm).toEqual(mtaMocks.mockAdditionalInsuredMtaForm);
        expect(component.addButton.disable).toBeFalsy();
        expect(component.isSaveDisabled).toBeTruthy();
    });

    it("should enable save button", () => {
        // Arrange
        let formValues: any = [mockAdditionalInsured];

        // Act
        component.addToList(formValues);

        // Assert
        expect(component.additionalInsuredList.additionalInsureds.length).toEqual(1);
        expect(component.isSaveDisabled).toBeFalsy();
    });

    it("should delete from list", () => {
        // Arrange
        let additionalInsuredId1 = Guid.create();
        let additionalInsuredId2 = Guid.create();

        // add 2 additional insureds to the list
        let additionalInsuredDetails1 = {} as any;
        additionalInsuredDetails1.id = additionalInsuredId1;
        additionalInsuredDetails1.additionalInsured = [mockAdditionalInsured];
        component.formList.push(additionalInsuredDetails1);

        let additionalInsuredDetails2 = {} as any;
        additionalInsuredDetails2.id = additionalInsuredId2;
        additionalInsuredDetails2.additionalInsured = [mockAdditionalInsured];
        component.formList.push(additionalInsuredDetails2);

        component.isSaveDisabled = false;

        // Act
        component.deleteAdditionalInsured(additionalInsuredId2);

        // Assert
        expect(component.formList.length).toEqual(1);
        expect(component.isSaveDisabled).toBeFalsy();
    });

    it("should disable add button when editing", () => {
        // Arrange
        var id = Guid.create();

        let additionalInsuredDetails = {} as any;
        additionalInsuredDetails.id = id;
        additionalInsuredDetails.additionalInsured = [mockAdditionalInsured];
        component.formList.push(additionalInsuredDetails);
        component.addButton = mtaMocks.mockAdditionalInsuredFormButton;
        component.countries = [{ hidden: "US" }];

        // Act
        component.editAdditionalInsured(id);

        // Assert
        expect(component.isSaveDisabled).toBeTruthy();
    });

    it("should save additional insured to quote on save", () => {
        // Arrange
        let additionalInsuredDetails = [] as any;
        additionalInsuredDetails.additionalInsured = mockAdditionalInsured;
        component.formList.push(additionalInsuredDetails);

        // Act
        component.save();

        // Assert
        expect(component.quote.additionalInsureds).toEqual([mockAdditionalInsured]);
        expect(component.quote.additionalInsureds[0].entityName).toEqual(mockAdditionalInsured.entityName);
    });

    it("should add existing additional insureds to form list on init", () => {
        // Arrange
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));
        component.quote.additionalInsureds = [{ entityName: "entity 1" }, { entityName: "entity 2" }] as AdditionalInsured[];
        component.formList = [];

        // Act
        component.ngOnInit();

        // Assert
        expect(component.formList.length).toEqual(component.quote.additionalInsureds.length);
    });
});
