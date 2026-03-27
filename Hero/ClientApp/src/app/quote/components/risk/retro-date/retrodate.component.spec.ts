import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import * as moment from "moment";

import { Component, Directive, EventEmitter, Input } from "@angular/core";
import { RiskQuestion, RiskQuestionOption } from "@app/models";
import { RetroDateComponent } from "./retrodate.component";

describe("retrodate component.", () => {
    let component: RetroDateComponent;
    let fixture: ComponentFixture<RetroDateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                RetroDateComponent,
                MockMatAutocomplete,
                MockMatDatepicker,
                MockMatOption,
                MockMatDatepickerInput,
                MockMatAutocompleteTrigger,
                MockDatepickerHeaderComponent
            ],
            imports: [ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RetroDateComponent);
        component = fixture.componentInstance;
        component.riskQuestion = getTestRiskQuestion();
        fixture.detectChanges();
    });

    it("Should return form group", async(() => {
        // Actions
        const control = component.formGroup;

        // Assertions
        expect(control).toBeDefined();
        expect(control.value).toBeDefined();
        expect(control.disabled).toBeDefined();
        expect(control.disabled).toBeFalsy();
    }));

    it ("SetDisabledState to true should disable the control", () => {
        component.setDisabledState(true);
        fixture.detectChanges();

        expect(component.formGroup.disabled).toBeTruthy();
    });

    it ("SetDisabledState to false should enable the control", () => {
        component.setDisabledState(true);
        fixture.detectChanges();
        component.setDisabledState(false);
        fixture.detectChanges();

        expect(component.formGroup.disabled).toBeFalsy();
    });

    it ("writeValue with a date should update control value", () => {
        const expected = moment("2018-01-01").toDate();
        component.writeValue({ date: expected, riskSelectOptionId: null });
        fixture.detectChanges();

        expect(component.formGroup.get("date").value.toDate().toDateString()).toBe(expected.toDateString());
    });

    it ("writeValue with a riskQuestionOptionUid should update control value", () => {
        const expected = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        component.writeValue({ date: null, uid: "4e73f08c-6466-4699-826c-e0ad71196d4a" });
        fixture.detectChanges();

        expect(component.formGroup.get("autocomplete").value.uid).toBe(expected);
    });

    function getTestRiskQuestion(): RiskQuestion {
        const testRiskQuestion = new RiskQuestion();
        testRiskQuestion.tag = "TEST_TAG";
        testRiskQuestion.isMandatory = true;
        const testRiskSelectOption = new RiskQuestionOption();
        testRiskSelectOption.uid = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        testRiskSelectOption.riskQuestionTag = "TEST_TAG";
        testRiskSelectOption.text = "Test Risk Select Option";
        testRiskQuestion.options = [testRiskSelectOption];

        return testRiskQuestion;
    }
});

@Directive({
    selector: "mat-autocomplete",
    inputs: ["displayWith"],
    exportAs: "matAutocomplete"
})
class MockMatAutocomplete {
}

// tslint:disable-next-line:max-classes-per-file
@Component({
    selector: "mat-datepicker",
    template: ""
})
class MockMatDatepicker {
}

// tslint:disable-next-line:max-classes-per-file
@Directive({
    selector: "mat-datepicker[calendarHeaderComponent]",
   inputs: ["calendarHeaderComponent"]
    
})
class MockDatepickerHeaderComponent<D> { }  

// tslint:disable-next-line:max-classes-per-file
@Component({
    selector: "mat-option",
    template: ""
})
class MockMatOption {
    @Input() public value: any;
    @Input() public title: any;
    @Input() public click: EventEmitter<any>;
}

// tslint:disable-next-line:max-classes-per-file
@Directive({
    selector: "[matDatepicker]",
    inputs: ["matDatepicker"]
})
class MockMatDatepickerInput { }

// tslint:disable-next-line:max-classes-per-file
@Directive({
    selector: "input[matAutocomplete]",
    inputs: ["matAutocomplete"],
    exportAs: "matAutocompleteTrigger"
})
class MockMatAutocompleteTrigger {
}
