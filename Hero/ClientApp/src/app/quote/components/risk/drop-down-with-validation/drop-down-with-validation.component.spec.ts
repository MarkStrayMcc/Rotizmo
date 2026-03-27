import { ComponentFixture, TestBed, fakeAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RiskQuestionOption, RiskQuestion } from "@app/models";
import { DropDownWithValidationComponent } from "./drop-down-with-validation.component";

describe("dropdown with validation component", () => {
  let component: DropDownWithValidationComponent;
  let fixture: ComponentFixture<DropDownWithValidationComponent>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
          declarations: [DropDownWithValidationComponent],
            imports: [ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(DropDownWithValidationComponent);
        component = fixture.componentInstance;
        component.riskQuestion = getTestRiskQuestion();
        fixture.detectChanges();
    });

    it("Should return form group", fakeAsync(() => {
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

    it ("writeValue with a riskQuestionOptionUid should update control value", () => {
        const expected = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        component.riskQuestion = getTestRiskQuestion();
        component.writeValue("4e73f08c-6466-4699-826c-e0ad71196d4a");
        fixture.detectChanges();

        expect(component.formControl.value.uid).toBe(expected);
    });

    it ("Select an option should update control value", fakeAsync(() => {
        const expected = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        component.riskQuestion = getTestRiskQuestion();
        const firstOption = component.riskQuestion.options[0];
        component.setSelectedOption(firstOption);
        fixture.detectChanges();
        expect(component.formControl.value.uid).toBe(expected);
    }));

    function getTestRiskQuestion(): RiskQuestion {
        const testRiskQuestion = new RiskQuestion();
        testRiskQuestion.tag = "TEST_TAG";
        testRiskQuestion.isMandatory = true;

        const testRiskSelectOption = new RiskQuestionOption();
        testRiskSelectOption.uid = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        testRiskSelectOption.riskQuestionTag = "TEST_TAG";
        testRiskSelectOption.isValid = true;
        testRiskSelectOption.text = "Test Risk Select Option";

        testRiskQuestion.options = [testRiskSelectOption];

        return testRiskQuestion;
    }
   
});
