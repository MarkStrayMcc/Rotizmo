import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import * as moment from "moment";

import { Component, Directive } from "@angular/core";
import { RiskQuestion } from "@app/models";
import { DateQuestionComponent } from "./datequestion.component";

describe("datequestion component", () => {
    let component: DateQuestionComponent;
    let fixture: ComponentFixture<DateQuestionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DateQuestionComponent,
                MockMatDatepicker,
                MockMatDatepickerInput,
                MockDatepickerHeaderComponent
            ],
            imports: [ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DateQuestionComponent);
        component = fixture.componentInstance;
        component.riskQuestion = getTestRiskQuestion();
        fixture.detectChanges();
    });

    it("Should return form control", async(() => {
        // Actions
        const control = component.formControl;

        // Assertions
        expect(control).toBeDefined();
        expect(control.value).toBeDefined();
        expect(control.disabled).toBeDefined();
        expect(control.disabled).toBeFalsy();
    }));

    it ("SetDisabledState to true should disable the control", () => {
        component.setDisabledState(true);
        fixture.detectChanges();

        expect(component.formControl.disabled).toBeTruthy();
    });

    it ("SetDisabledState to false should enable the control", () => {
        component.setDisabledState(true);
        fixture.detectChanges();
        component.setDisabledState(false);
        fixture.detectChanges();

        expect(component.formControl.disabled).toBeFalsy();
    });

    it ("writeValue with a date should update control value", () => {
        const expected = moment("2018-01-01").toDate();
        component.writeValue(expected);
        fixture.detectChanges();

        expect(component.formControl.value.toDate().toDateString()).toBe(expected.toDateString());
    });

    function getTestRiskQuestion(): RiskQuestion {
        const testRiskQuestion = new RiskQuestion();
        testRiskQuestion.tag = "TEST_TAG";
        testRiskQuestion.isMandatory = true;

        return testRiskQuestion;
    }
});

// tslint:disable-next-line:max-classes-per-file
@Component({
    selector: "mat-datepicker",
    template: ""
})
class MockMatDatepicker {
}

// tslint:disable-next-line:max-classes-per-file
@Directive({
    selector: "[matDatepicker]",
    inputs: ["matDatepicker"]
})
class MockMatDatepickerInput { }

// tslint:disable-next-line:max-classes-per-file
@Directive({
    selector: "mat-datepicker[calendarHeaderComponent]",
   inputs: ["calendarHeaderComponent"]
    
})
class MockDatepickerHeaderComponent<D> { }  
