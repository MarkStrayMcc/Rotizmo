import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import { Component, Directive, EventEmitter, Input } from "@angular/core";
import { RiskQuestion, RiskQuestionOption } from "@app/models";
import { SearchableDropdownComponent } from "@app/quote/components/risk/searchable-dropdown/searchable-dropdown.component";

describe("searchable dropdown component", () => {
    let component: SearchableDropdownComponent;
    let fixture: ComponentFixture<SearchableDropdownComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SearchableDropdownComponent,
                MockMatAutocomplete,
                MockMatOption,
                MockMatAutocompleteTrigger,
                MockMatIcon,
                MockMatFormField
            ],
            imports: [ReactiveFormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchableDropdownComponent);
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

    it ("writeValue with a uid should update control value", () => {
        const expected = "4e73f08c-6466-4699-826c-e0ad71196d4a";
        component.writeValue("4e73f08c-6466-4699-826c-e0ad71196d4a");
        fixture.detectChanges();

        expect(component.formControl.value.uid).toBe(expected);
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
    selector: "input[matAutocomplete]",
    inputs: ["matAutocomplete"],
    exportAs: "matAutocompleteTrigger"
})
class MockMatAutocompleteTrigger {
}

// tslint:disable-next-line:max-classes-per-file
@Component({
    selector: "mat-icon",
    template: ""
})
class MockMatIcon {

}

// tslint:disable-next-line:max-classes-per-file
@Component({
    selector: "mat-form-field",
    template: ""
})
class MockMatFormField {
}
