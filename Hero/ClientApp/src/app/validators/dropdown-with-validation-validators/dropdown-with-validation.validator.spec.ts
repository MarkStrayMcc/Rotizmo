import { fakeAsync } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { RiskQuestionOption } from "@app/models";
import { DropDownWithValidationValidators } from './dropdown-with-validation.validator';


describe("DropDownWithValidation Validator", () => {
    let control: FormControl;

    beforeEach(() => {
        control = new FormControl({
            riskSelectOptionId: null
        });
    });

    it("it should not pass for invalid option", fakeAsync(() => {
        // Arrange
        control.setValue("4e73f08c-6466-4699-826c-e0ad71196d4a");
        const expectedResult = { invalidGeoLocation: { valid: false } };
        const mockSelectOption = mockSelectOptions(false);
        // Act
        const validationResult = DropDownWithValidationValidators.isGeoLocated(mockSelectOption)(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toEqual(expectedResult);
    }));

    it("it should pass for valid option", fakeAsync(() => {
        // Arrange
        control.setValue("4e73f08c-6466-4699-826c-e0ad71196d4a");
        const mockSelectOption = mockSelectOptions(true);
        // Act
        const validationResult = DropDownWithValidationValidators.isGeoLocated(mockSelectOption)(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toBeNull();
    }));
    
    it("it should not pass for null", fakeAsync(() => {
        // Arrange
        control.setValue(null);
        const expectedResult = { invalidGeoLocation: { valid: false } };
        // Act
        const validationResult = DropDownWithValidationValidators.isGeoLocated([])(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toEqual(expectedResult);
    }));
    
    function mockSelectOptions(valid: boolean): RiskQuestionOption[]{
        const testRiskSelectOption = new RiskQuestionOption();
        testRiskSelectOption.uid = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        testRiskSelectOption.riskQuestionTag = "TEST_TAG";
        testRiskSelectOption.isValid = valid;
        testRiskSelectOption.text = "Test Risk Select Option";
        return new Array(testRiskSelectOption);
    }

});
