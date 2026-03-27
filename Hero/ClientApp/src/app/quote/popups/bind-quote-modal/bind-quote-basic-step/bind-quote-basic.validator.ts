import { FormControl } from "@angular/forms";

export function bindQuoteBasicValidator(formControl: FormControl) {
    const invalidResult = {
        expiryDateBeforeInceptionDate: {
            valid: false
        }
    };

    if (formControl) {
        if (formControl.value) {
            const expiryDate = formControl.value.expiryDate;
            const inceptionDate = formControl.value.inceptionDate;

            if (expiryDate && inceptionDate) {
                if (expiryDate < inceptionDate) {
                    return invalidResult;
                }
            }
        }
    }

    return null;
}
