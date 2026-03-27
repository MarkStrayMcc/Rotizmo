import { Component, forwardRef, Input, OnDestroy, OnInit } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";

import * as moment from "moment";
import { Subscription, Observable } from "rxjs";

import { RiskQuestion, RiskQuestionOption } from "@app/models";
import { MomentDateAdapter } from "@app/providers/momentDateAdapter";
import { map } from "rxjs/operators";
import { DatepickerHeader } from "@app/components/datepicker-header/datepicker-header.component";

@Component({
    selector: "retrodate",
    templateUrl: "./retrodate.component.html",
    styleUrls: ["./retrodate.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RetroDateComponent),
            multi: true
        }
    ]
})
export class RetroDateComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public riskQuestion: RiskQuestion;

    public filteredOptions: Observable<RiskQuestionOption[]>;
    public formGroup: FormGroup;
    
    private regExpSpecialCharacters: RegExp = /[-[\]{}()*+?.\\^$|#\s]/g;
    private dateValueChangeSubscription: Subscription;
    private onChangeEvent: (value: any) => void = (_: any) => { };
    private onTouchEvent: () => void = () => { };

    datepickerHeader = DatepickerHeader;

    constructor(private formBuilder: FormBuilder) { }

    public ngOnInit(): void {
        this.formGroup = this.formBuilder.group({
            date: null,
            autocomplete: null
        });

        this.dateValueChangeSubscription = this.formGroup.controls.date.valueChanges.subscribe(x => this.dateChangeHandler(x));

        this.setupDropDown();
    }

    public ngOnDestroy(): void {
        this.dateValueChangeSubscription.unsubscribe();
    }

    public writeValue(obj: any): void {
        if (!obj) {
            return;
        } else {
            this.onChangeEvent(null);
        }

        const date = obj.date ? moment(obj.date) : null;

        const riskQuestionOption = this.riskQuestion.options
            .find(x => x.uid === obj.uid);

        if (date && date.isValid()) {
            this.formGroup.controls.date.setValue(date);
            this.onChangeEvent({ date: date.toDate(), riskQuestionOption: null });
        } else if (riskQuestionOption) {
            this.formGroup.controls.autocomplete.setValue(riskQuestionOption);
            this.onChangeEvent({ date: null, uid: riskQuestionOption.uid });
        }
    }

    public registerOnChange(onChangeFunction: (value: any) => void): void {
        this.onChangeEvent = onChangeFunction;
    }

    public registerOnTouched(onTouchedFunction: () => void): void {
        this.onTouchEvent = onTouchedFunction;
    }

    public setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.formGroup.disable();
        } else {
            this.formGroup.enable();
        }
    }

    public displayFn(item: any): string {
        if (typeof (item) === "string") {
            return item.toString();
        } else {
            return item ? item.text : "";
        }
    }

    public autoCompleteChangeHandler(): void {
        const value = this.formGroup.controls.autocomplete.value;

        if (typeof (value) === "string") {
            const date = MomentDateAdapter.parseString(value);

            if (moment.isMoment(date) && date.isValid()) {
                this.formGroup.get("date").setValue(date);
                this.onChangeEvent({ date: date.toDate(), riskQuestionOption: null });
            } else {
                this.onChangeEvent(null);
            }
        } else {
            this.formGroup.controls.date.setValue(null);

            this.onChangeEvent(value ? { date: null, uid: value.uid } : null);
        }

        this.onTouchEvent();
    }

    private setupDropDown(): void {
        this.filteredOptions = this.formGroup.controls.autocomplete.valueChanges
            .pipe(
                map(option => {
                if (option && typeof option === "object") {
                    return (option as RiskQuestionOption).text;
                } else {
                    return option;
                }
            }),
                map(name => {
                if (name) {
                    return this.filter(name);
                }

                if (this.riskQuestion.options) {
                    return this.riskQuestion.options.slice();
                }

                return null;
            }));
    }

    private dateChangeHandler(input): void {
        if (moment.isMoment(input)) {
            const formattedDate = input.format("DD/MM/YYYY");
            const autocompleteControl = this.formGroup.controls.autocomplete;

            if (autocompleteControl.value !== formattedDate) {
                autocompleteControl.setValue(formattedDate);

                this.onChangeEvent(input.toDate() ? { date: input.toDate(), riskQuestionOption: null } : null);
                this.onTouchEvent();
            }
        }
    }

    private filter(name: string) {
        if (name && name.length > 0) {
            name = name.replace(this.regExpSpecialCharacters, "\\$&");
            return this.riskQuestion.options.filter(option => new RegExp(`^.*${name}.*`, "gi").test(option.text));
        } else {
            return this.riskQuestion.options;
        }
    }
}
