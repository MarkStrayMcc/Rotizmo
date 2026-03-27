
import { Component, forwardRef } from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as moment from 'moment';
import { BaseRiskQuestionValueAccessor } from "@app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component";
import { DatepickerHeader } from "@app/components/datepicker-header/datepicker-header.component";
import { MomentDateAdapter } from '@app/providers/momentDateAdapter';

@Component({
    selector: "datequestion",
    templateUrl: "./datequestion.component.html",
    styleUrls: ["./datequestion.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateQuestionComponent),
            multi: true
        }
    ]
})
export class DateQuestionComponent extends BaseRiskQuestionValueAccessor<Date> {
    
    datepickerHeader = DatepickerHeader;

    public writeValue(value: Date): void {
        const date = value ? moment(value) : null;

        if (!date || date.isValid()) {
            this.formControl.setValue(date);
        }
    }

    public dateBlurHandler(): void {
        const value = this.formControl.value;

        if (moment.isMoment(value)) {
            const formattedDate = MomentDateAdapter.parseString(value.format("DD/MM/YYYY"));

            if (this.formControl.value !== formattedDate) {
                this.formControl.setValue(formattedDate);

                this.onChangeEvent(value.toDate());
                this.onTouchEvent();
            }
        }


    }
}
