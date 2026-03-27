import { async } from "@angular/core/testing";
import { AbstractControl, FormControl } from "@angular/forms";
import { DateValidators } from "@app/validators/date.validators";
import * as moment from "moment";

describe("DateValidators class", () => {
    let testControl: AbstractControl;

    beforeEach(() => {
        testControl = new FormControl();
    });

    describe("Date validator function", () => {
        it("Should allow a valid date", async(() => {
            // Actors
            const testDate = moment("2018-02-01");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.date()(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow a null date", async(() => {
            // Actors
            testControl.setValue(null);

            // Actions
            const validationResult = DateValidators.date()(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        [moment("2018-99-99"), "99/99/2018"].forEach(testDate =>
            it("Should not allow a date that does not parse", async(() => {
                // Actors
                testControl.setValue(testDate);

                // Actions
                const validationResult = DateValidators.date()(testControl);

                // Asserts
                expect(validationResult).toBeDefined();
                expect(validationResult.invalidDate).toBeDefined();
                expect(validationResult.invalidDate.date).toBeDefined();
                expect(validationResult.invalidDate.date).toBe(testDate);
            }))
        );
    });

    describe("Min validator function", () => {
        it("Should allow a date after minimum", async(() => {
            // Actors
            const minimumDate = moment("2018-01-15");
            const testDate = moment("2018-01-16");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.min(minimumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow a date equal to minimum", async(() => {
            // Actors
            const minimumDate = moment("2018-01-15");
            const testDate = moment("2018-01-15");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.min(minimumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow a null minimum", async(() => {
            // Actors
            const testDate = moment("2018-01-16");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.min(null)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow an invalid minimum", async(() => {
            // Actors
            const minimumDate = moment("2018-99-99");
            const testDate = moment("2018-01-16");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.min(minimumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow a null date", async(() => {
            // Actors
            const minimumDate = moment("2018-01-15");
            testControl.setValue(null);

            // Actions
            const validationResult = DateValidators.min(minimumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow an invalid date", async(() => {
            // Actors
            const minimumDate = moment("2018-01-15");
            const testDate = moment("2018-99-99");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.min(minimumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should not allow a date before minimum", async(() => {
            // Actors
            const minimumDate = moment("2018-01-15");
            const testDate = moment("2018-01-01");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.min(minimumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult.beforeMinimumDate).toBeDefined();
            expect(validationResult.beforeMinimumDate.date).toBeDefined();
            expect(validationResult.beforeMinimumDate.date).toBe(testDate);
            expect(validationResult.beforeMinimumDate.minimumDate).toBeDefined();
            expect(validationResult.beforeMinimumDate.minimumDate).toBe(minimumDate);
        }));
    });

    describe("Max validator function", () => {
        it("Should allow a date before maximum", async(() => {
            // Actors
            const maximumDate = moment("2018-02-15");
            const testDate = moment("2018-01-16");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.max(maximumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow a date equal to maximum", async(() => {
            // Actors
            const maximumDate = moment("2018-02-15");
            const testDate = moment("2018-02-15");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.max(maximumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow a null maximum", async(() => {
            // Actors
            const testDate = moment("2018-01-16");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.max(null)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow an invalid maximum", async(() => {
            // Actors
            const maximumDate = moment("2018-99-99");
            const testDate = moment("2018-01-16");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.max(maximumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow a null date", async(() => {
            // Actors
            const maximumDate = moment("2018-02-15");
            testControl.setValue(null);

            // Actions
            const validationResult = DateValidators.max(maximumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should allow an invalid date", async(() => {
            // Actors
            const maximumDate = moment("2018-02-15");
            const testDate = moment("2018-99-99");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.max(maximumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult).toBeNull();
        }));

        it("Should not allow a date after maximum", async(() => {
            // Actors
            const maximumDate = moment("2018-02-15");
            const testDate = moment("2018-03-01");
            testControl.setValue(testDate);

            // Actions
            const validationResult = DateValidators.max(maximumDate)(testControl);

            // Asserts
            expect(validationResult).toBeDefined();
            expect(validationResult.afterMaximumDate).toBeDefined();
            expect(validationResult.afterMaximumDate.date).toBeDefined();
            expect(validationResult.afterMaximumDate.date).toBe(testDate);
            expect(validationResult.afterMaximumDate.maximumDate).toBeDefined();
            expect(validationResult.afterMaximumDate.maximumDate).toBe(maximumDate);
        }));
    });
});
