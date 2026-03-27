import { async } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { duplicateValidator } from "@app/validators/duplicate.validator";

describe("duplicateValidator",
    () => {
        let control: FormControl;

        beforeEach(() => {
            control = new FormControl({
                clauseTitle: null
            });
        });

        it("it should pass with nothing to compare",
            async(() => {
                // Arrange
                control.setValue("test");
                const existingValues: string[] = [];
                const validator = duplicateValidator(existingValues);

                // Act
                const validationResult = validator(control);

                // Assert
                expect(validationResult).toBeDefined();
                expect(validationResult).toBeNull();
            }));

        it("it should pass with no duplicates",
            async(() => {
                // Arrange
                control.setValue("test");
                const existingValues: string[] = ["Test2", "Test3"];
                const validator = duplicateValidator(existingValues);

                // Act
                const validationResult = validator(control);

                // Assert
                expect(validationResult).toBeDefined();
                expect(validationResult).toBeNull();
            }));

        it("it should fail with duplicates",
            async(() => {
                // Arrange
                control.setValue("test");
                const existingValues: string[] = ["test", "Test2"];
                const validator = duplicateValidator(existingValues);

                // Act
                const validationResult = validator(control);

                // Assert
                expect(validationResult).toBeDefined();
                expect(validationResult).not.toBeNull();
            }));

    });
