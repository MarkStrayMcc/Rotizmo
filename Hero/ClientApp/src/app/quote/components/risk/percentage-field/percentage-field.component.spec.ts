import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import { NumberOnly } from "@app/directives/number-only.directive";
import { RiskQuestion, RiskQuestionAnswer } from "@app/models";
import { PercentageFieldComponent } from "@app/quote/components/risk/percentage-field/percentage-field.component";

describe("PercentageFieldComponent", () => {
    let component: PercentageFieldComponent;
    let fixture: ComponentFixture<PercentageFieldComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PercentageFieldComponent, NumberOnly],
            imports: [ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PercentageFieldComponent);
        component = fixture.componentInstance;
        component.riskQuestion = getTestRiskQuestion();
        fixture.detectChanges();
    });

    it("Should return control", async(() => {
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

    it ("writeValue should update control value", () => {
        const expected = 123;
        component.writeValue(expected);
        fixture.detectChanges();

        expect(component.formControl.value).toBe(expected);
    });

    function getTestRiskQuestion(): RiskQuestion {
        const testRiskQuestion = new RiskQuestion();
        testRiskQuestion.tag = "TEST_TAG";
        testRiskQuestion.isMandatory = true;

        return testRiskQuestion;
    }

    function getTestRiskQuestionAnswer(): RiskQuestionAnswer {
        const riskQuestionAnswer = new RiskQuestionAnswer();
        riskQuestionAnswer.number = null;

        return riskQuestionAnswer;
    }
});
