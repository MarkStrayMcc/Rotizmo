import { AbstractControl } from "@angular/forms";

export function AutocompleteSelectedValidator(control: AbstractControl, valueSelector?: (object: any) => any) {
    if (valueSelector === undefined) {
        valueSelector = (object: any) => object.value;
    }

    const invalidResult = { invalidOption: { valid: false } };

    if (!control.value || control.value === "") {
        return null;
    }

    // multi-selection
    if (control.value && Array.isArray(control.value) && control.value.length >= 0) {
        const values = control.value as any[];
        if (values.find(item => (typeof (item) === "string" && item !== ""))) {
            return invalidResult;
        } else {
            return null;
        }
    }

    if (control.value && valueSelector(control.value)) {
        return null;
    }

    return invalidResult;
}

export function AutocompleteValidator<T>(valueSelector: (object: T) => any) {
    return control => AutocompleteSelectedValidator(control, valueSelector);
}
