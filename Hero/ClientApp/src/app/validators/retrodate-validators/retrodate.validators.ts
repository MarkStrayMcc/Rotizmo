import { FormControl, ValidatorFn } from "@angular/forms";

import * as moment from 'moment';

import { RiskQuestionOption } from "@app/models";

export class RetroDateValidators {
    public static retrodate(options: RiskQuestionOption[]): ValidatorFn {
        return (control: FormControl): { [key: string]: any } => {
            if (!control.value) {
                return null;
            }

            const dateResult = this.dateValidator(control.value.date);

            if (control.value.date && !dateResult) {
                return null;
            }

            if (!control.value.riskSelectOptionId) {
                return dateResult;
            }

            return this.autocompleteValidator(control.value.uid, options);
        };
    }

    private static autocompleteValidator(value: string, options: RiskQuestionOption[]) {
        if (options.some(option => option.uid === value)) {
            return null;
        }

        return {
            invalidDropDownOption: { value }
        };
    }

    private static dateValidator(date: Date) {
        if (!date || moment(date).isValid()) {
            return null;
        }

        return { invalidDate: { date } };
    }
}
