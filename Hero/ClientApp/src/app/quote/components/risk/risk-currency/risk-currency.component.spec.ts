import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { RiskQuestion } from "@app/models";
import { RiskCurrencyComponent } from "./risk-currency.component";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { ErrorModule } from "@app/shared/error.module";

describe("risk currency component", () => {
    let component: RiskCurrencyComponent;
    let fixture: ComponentFixture<RiskCurrencyComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RiskCurrencyComponent, LargeNumberMask, CurrencyComponent],
            imports: [ReactiveFormsModule, ErrorModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RiskCurrencyComponent);
        component = fixture.componentInstance;
        component.riskQuestion = getTestRiskQuestion();
        component.ngOnInit();
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

        expect(component.formControl.disabled).toBeTruthy();
    });

    it ("SetDisabledState to false should enable the control", () => {
        component.setDisabledState(true);
        component.setDisabledState(false);

        expect(component.formControl.disabled).toBeFalsy();
    });

    it ("writeValue should update control value", () => {
        const expected = 123;
        component.writeValue(expected);

        expect(component.formControl.value).toBe(expected);
    });

    function getTestRiskQuestion(): RiskQuestion {
        const testRiskQuestion = new RiskQuestion();
        testRiskQuestion.tag = "TEST_TAG";
        testRiskQuestion.isMandatory = true;

        return testRiskQuestion;
    }
});
