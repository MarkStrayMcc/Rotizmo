/* tslint:disable:max-classes-per-file */
import { Directive } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {ReactiveFormsModule } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import * as moment from "moment";
import { MaterialModule } from "../../material/material.module";
import { MOMENT_DATE_FORMATS, MomentDateAdapter } from "../../providers/momentDateAdapter";
import { Datepicker } from "./datepicker.component";

describe("datepicker component", () => {
    let component: Datepicker;
    let fixture: ComponentFixture<Datepicker>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [Datepicker, MockDateOnly],
            imports: [ReactiveFormsModule, MaterialModule],
            providers: [
                { provide: DateAdapter, useClass: MomentDateAdapter },
                { provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(Datepicker);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("Should raise change event on change of date", async(() => {
        // Actors
        const selectedDate = moment.utc(new Date()).add(7, "days").startOf("day");
        let receivedDate: moment.Moment;
        component.registerOnChange((newDate: moment.Moment) => receivedDate = newDate);
        component.dateControl.setValue(selectedDate);

        // Actions
        component.blur();

        // Asserts
        expect(receivedDate.toISOString()).toBe(selectedDate.toISOString());
    }));
});

@Directive({ selector: "[date-only]" })
export class MockDateOnly { }
