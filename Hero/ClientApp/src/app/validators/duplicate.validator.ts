import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function duplicateValidator(currentValues: string[]): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (currentValues && value !== null && value !== undefined && value !== "") {
            if (currentValues.indexOf(control.value.toLowerCase()) > -1) {
                return { duplicateValidator: { condition: "Duplicate" } };
            }
            return null;
        }
    };
}
