import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import { RiskQuestion, RiskQuestionOption } from "@app/models";
import { RadioButtonComponent } from "./radiobutton.component";

describe("radio button component", () => {
    let component: RadioButtonComponent;
    let fixture: ComponentFixture<RadioButtonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RadioButtonComponent],
            imports: [ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RadioButtonComponent);
        component = fixture.componentInstance;
        component.riskQuestion = getTestRiskQuestion();
        fixture.detectChanges();
    });

    it("Should return form group", async(() => {
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

    it ("writeValue with a riskSelectOptionId should update control value", () => {
        const expected = 1;
        component.writeValue(1);
        fixture.detectChanges();

        expect(component.formControl.value).toBe(expected);
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
