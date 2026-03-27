import { async } from "@angular/core/testing";
import { FormControl } from "@angular/forms";

import { RiskQuestionOption } from "@app/models";
import { RetroDateValidators } from "@app/validators/retrodate-validators/retrodate.validators";
import * as moment from "moment";

describe("RetroDateValidators", () => {
    let control: FormControl;

    beforeEach(() => {
        control = new FormControl({
            riskSelectOptionId: null,
            date: null
        });
    });

    it("it should pass for a valid date", async(() => {
        // Arrange
        control.setValue({ date: moment("2018-01-01"), riskSelectOptionId: null });

        // Act
        const validationResult = RetroDateValidators.retrodate([])(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toBeNull();
    }));

    it("it should fail for an invalid date", async(() => {
        // Arrange
        control.setValue({ date: moment("2018-32-32"), riskSelectOptionId: null });

        // Act
        const validationResult = RetroDateValidators.retrodate([])(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toBeTruthy();
    }));

    it("it should pass for a valid selected code", async(() => {
        // Arrange
        const testRiskSelectOption = new RiskQuestionOption();
        testRiskSelectOption.uid = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        testRiskSelectOption.text = "RDI+1";

        control.setValue({ date: null, riskQuestionOptionUid: testRiskSelectOption.uid });

        // Act
        const validationResult = RetroDateValidators.retrodate([testRiskSelectOption])(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toBeNull();
    }));

    it("it should fail for an invalid selected code", async(() => {
        // Arrange
        const testRiskSelectOption = new RiskQuestionOption();
        testRiskSelectOption.uid = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        testRiskSelectOption.text = "RDI+1";

        control.setValue({ date: null, riskSelectOptionId: 2 });

        // Act
        const validationResult = RetroDateValidators.retrodate([testRiskSelectOption])(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toBeTruthy();
    }));

    it("it should pass for null", async(() => {
        // Arrange
        control.setValue(null);

        // Act
        const validationResult = RetroDateValidators.retrodate([])(control);

        // Assert
        expect(validationResult).toBeDefined();
        expect(validationResult).toBeNull();
    }));
});
