import { Component, ElementRef, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DatepickerHeader } from "@app/components/datepicker-header/datepicker-header.component";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { MomentDateAdapter } from "../../providers/momentDateAdapter";

@Component({
    selector: "datepicker",
    templateUrl: "./datepicker.component.html",
    styleUrls: ["./datepicker.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => Datepicker),
            multi: true
        }
    ]
})
export class Datepicker implements ControlValueAccessor, OnChanges, OnInit, OnDestroy {
    @Input() public minimumDate: string;
    @Input() public maximumDate: string;
    @Input() public readonly = false;

    @ViewChild("datepicker") datepickerElement: ElementRef;

    public minDate: moment.Moment;
    public maxDate: moment.Moment;
    public datepickerHeader = DatepickerHeader;

    private dateCtrl: FormControl;
    private onChangeEvent: (val: any) => void;
    private onTouchEvent: () => void;
    private changeSubscription: Subscription;

    public writeValue(dateObject: moment.Moment) {
        if (this.isDate(dateObject) && this.isValidMomentDate(dateObject)) {
            this.dateControl.setValue(dateObject);
        }
    }

    public registerOnChange(fn: any) {
        this.onChangeEvent = fn;
    }

    public registerOnTouched(fn: any) {
        this.onTouchEvent = fn;
    }

    public setDisabledState?(isDisabled: boolean) {
        this.readonly = isDisabled;
    }

    public get dateControl(): FormControl {
        if (!this.dateCtrl) {
            this.dateCtrl = new FormControl({
                value: "",
                disabled: true
            });
            this.dateCtrl.enable();
        }

        return this.dateCtrl;
    }

    public ngOnInit(): void {
        this.changeSubscription = this.dateControl.valueChanges.subscribe((x) => {
            if (this.onChangeEvent) {
                this.onChangeEvent(x);
            }
        });
    }

    public ngOnDestroy(): void {
        this.changeSubscription.unsubscribe();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes["minimumDate"]) {
            this.minDate = this.getDateFromInput(this.minimumDate, moment.utc("1800-01-01"));
        }

        if (changes["maximumDate"]) {
            this.maxDate = this.getDateFromInput(this.maximumDate, null);
        }

        if (changes["readonly"]) {
            if (this.readonly) {
                this.dateControl.disable();
            } else {
                this.dateControl.enable();
            }
        }
    }

    public blur() {
        if (this.dateControl.value) {
            const timeFilteredDate = MomentDateAdapter.parseString(this.dateControl.value.format("DD/MM/YYYY"));

            this.dateControl.setValue(timeFilteredDate);
            this.onChangeEvent(timeFilteredDate);
        } else {
            const date = MomentDateAdapter.parseString(this.datepickerElement.nativeElement.value);
            this.onChangeEvent(date);
        }
    }

    private getDateFromInput(input: string, defaultValue: moment.Moment): moment.Moment {
        if (input && input.length) {
            return moment.utc(input);
        } else {
            return defaultValue;
        }
    }

    private isDate(dateObject) {
        return moment.isDate(dateObject) || moment.isMoment(dateObject);
    }

    private isValidMomentDate(dateObject) {
        return dateObject.isValid && dateObject.isValid();
    }
}