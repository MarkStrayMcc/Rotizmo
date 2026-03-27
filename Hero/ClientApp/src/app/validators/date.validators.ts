import { AbstractControl, ValidatorFn } from "@angular/forms";
import { MomentDateAdapter } from "@app/providers/momentDateAdapter";
import * as moment from "moment";

export class DateValidators {
    public static date(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const parsedDate = this.getParsedDate(control.value);

            return !parsedDate || parsedDate.isValid()
                ? null
                : {
                    invalidDate: {
                        date: control.value
                    }
                };
        };
    }

    public static min(minimumDate: moment.Moment): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const parsedDate = this.getParsedDate(control.value);

            return !parsedDate ||
                !minimumDate ||
                !parsedDate.isValid() ||
                !minimumDate.isValid() ||
                minimumDate <= parsedDate
                ? null
                : {
                    beforeMinimumDate: {
                        date: parsedDate,
                        minimumDate: minimumDate
                    }
                };
        };
    }

    public static max(maximumDate: moment.Moment): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const parsedDate = this.getParsedDate(control.value);

            return !parsedDate ||
                !maximumDate ||
                !parsedDate.isValid() ||
                !maximumDate.isValid() ||
                maximumDate >= parsedDate
                ? null
                : {
                    afterMaximumDate: {
                        date: parsedDate,
                        maximumDate: maximumDate
                    }
                };
        };
    }

    private static getParsedDate(inputDate: any): moment.Moment {
        return moment.isMoment(inputDate)
            ? inputDate
            : moment.isDate(inputDate) ? moment(inputDate) :
            MomentDateAdapter.parseString(inputDate);
    }
}
