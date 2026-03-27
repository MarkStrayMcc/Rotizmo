import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { DropdownService } from '@app/services/dropdown.service';
import { MockMatspinnerComponent as MockMatSpinnerComponent } from "@app/shared/form-creator/form-creator.component.mock";
import { QuoteLossPayeeComponent } from "@app/quote/popups/quote-loss-payee-modal/quote-loss-payee.component";
import { Country } from "@app/models/auto-generated/Country";
import { of } from 'rxjs';
import { mockLossPayee, mockLossPayeeConfigBuilder } from "@app/quote/popups/quote-loss-payee-modal/quote-loss-payee.component.mock";
import { Guid } from 'guid-typescript';
import { Quote } from "@app/models/auto-generated/Quote";
import { LossPayeeConfigBuilder } from "@app/shared/loss-payee/loss-payee.config-builder";
import { LossPayee } from '../../../models/auto-generated';

describe("QuoteLossPayeeComponent", () => {
    let component: QuoteLossPayeeComponent;
    let fixture: ComponentFixture<QuoteLossPayeeComponent>;

    const testModuleConfiguration = {
        declarations: [
            QuoteLossPayeeComponent,
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
            { provide: FormCreatorService, useValue: mtaMocks.mockLossPayeeFormCreatorService },
            { provide: ModalDialogService, useValue: mtaMocks.MockModalDialogService },
            { provide: DropdownService, useValue: mtaMocks.mockDropDownService },
            { provide: LossPayeeConfigBuilder, useValue: mockLossPayeeConfigBuilder }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(QuoteLossPayeeComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();
        component.quote = new Quote;
        mtaMocks.mockUserServiceTest.getUser.and.returnValue(mtaMocks.mockUserProfile);
    });
    
    it("should create Loss Payee component", () => {
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

    it("should call setConfig on addLossPayee", () => {
        // Act
        component.addLossPayee();

        // Assert
        expect(mockLossPayeeConfigBuilder.setConfig).toHaveBeenCalled();
    });

    it("Should set the user profile on init", () => {
        // Arrange
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));

        // Act
        component.ngOnInit();

        expect(component.userProfile).toBeDefined();
    });

    it("should handle loss payee form", () => {
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
        let formValues: any = mockLossPayee;

        // Act
        component.addToList(formValues);

        // Assert
        expect(component.lossPayeeDetails.length).toEqual(1);
        expect(component.isSaveDisabled).toBeFalsy();
    });

    it("should delete from list", () => {
        // Arrange
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
    });

    it("should save loss payee to quote on save", () => {
        // Arrange
        let lossPayeeDetails = [] as any;
        lossPayeeDetails.lossPayee = mockLossPayee;
        component.lossPayeeDetails.push(lossPayeeDetails);

        // Act
        component.save();

        // Assert
        expect(component.quote.lossPayees).toEqual([mockLossPayee]);
        expect(component.quote.lossPayees[0].entityName).toEqual(mockLossPayee.entityName);
    });

    it("should add existing loss payees to form list on init", () => {
        // Arrange
        mtaMocks.mockDropDownService.getCountries.and.returnValue(of(new Country));
        component.quote.lossPayees = [{ entityName: "entity 1" }, { entityName: "entity 2" }] as LossPayee[];
        component.lossPayeeDetails = [];

        // Act
        component.ngOnInit();

        // Assert
        expect(component.lossPayeeDetails.length).toEqual(component.quote.lossPayees.length);
    });
});
