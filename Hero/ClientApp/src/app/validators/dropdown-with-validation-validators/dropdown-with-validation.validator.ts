import { FormControl, ValidatorFn } from "@angular/forms";
import { RiskQuestionOption } from "@app/models";

export class DropDownWithValidationValidators {

    public static isGeoLocated(selectOptions: RiskQuestionOption[]): ValidatorFn {
        return (control: FormControl): { [key: string]: any } => {
            const invalidResult = { invalidGeoLocation: { valid: false } };
            const selectedValidOption: RiskQuestionOption[] = selectOptions.filter(s => s.uid === control.value && s.isValid);

            if (!control.value || selectedValidOption.length<1) {
                return invalidResult;
            }
            return null;
        };
    }
}
