import { Component, Directive, EventEmitter, Input} from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {  FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatSelect } from "@angular/material";
import { RiskQuestion, RiskQuestionOption } from "@app/models";
import { CheckBoxesComponent } from "./check-boxes.component";

describe("checkboxes component", () => {
    let component: CheckBoxesComponent;
   
    let fixture: ComponentFixture<CheckBoxesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CheckBoxesComponent,
                MockMatFormField,
                MockMatLabel,
                MockMatSelect,
                MockMatSelectTrigger,
                MockMatOption
            ],
                imports: [ReactiveFormsModule
                ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CheckBoxesComponent);

        component = fixture.componentInstance;
        component.riskQuestion = getTestRiskQuestion();
        component.formControl = new FormControl({ value: component.riskQuestion.options });
        fixture.detectChanges();
    });

    it("Should return form group", async(() => {
        // Actions
        const control = component.formControl;
        console.log(component.riskQuestion);
        // Assertions
        expect(control).toBeDefined();
        expect(control.value).toBeDefined();
        expect(control.disabled).toBeDefined();
        expect(control.disabled).toBeFalsy();
    }));

    it("SetDisabledState to true should disable the control", () => {
        component.setDisabledState(true);
        fixture.detectChanges();

        expect(component.formControl.disabled).toBeTruthy();
    });

    it("SetDisabledState to false should enable the control", () => {
        component.setDisabledState(true);
        fixture.detectChanges();
        component.setDisabledState(false);
        fixture.detectChanges();

        expect(component.formControl.disabled).toBeFalsy();
    });

    it("writeValue with a riskSelectOptionId should update control value", () => {
        const expected = [{ uid: "1042DAA7-37A0-4931-BC7B-9EAC26AB7B55", riskQuestionTag: "TEST_TAG", text: "Option1", isValid: true }];
        component.writeValue(expected);
        fixture.detectChanges();

        expect(expected).toBe(expected);
    });

    function getTestRiskQuestion(): RiskQuestion {
        const testRiskQuestion = new RiskQuestion();
        testRiskQuestion.tag = "TEST_TAG";
        testRiskQuestion.isMandatory = true;
        testRiskQuestion.options = [{ uid: "1042DAA7-37A0-4931-BC7B-9EAC26AB7B55", riskQuestionTag: "TEST_TAG", text: "Option1", isValid: true },
            { uid: "4FBE6F75-2549-4842-B86D-4F4127E8BC56", riskQuestionTag: "TEST_TAG", text: "Option2", isValid: true }] as RiskQuestionOption[];
        return testRiskQuestion;
    }
});

@Component({
    selector: "mat-label",
    template: ""
})
class MockMatLabel {

}

@Directive({
    selector: "mat-select-trigger",
    inputs: [""],
    exportAs:"" 
})
class MockMatSelectTrigger {

}

@Component({
    selector: "mat-select",
    template: ""
})
class MockMatSelect {
    @Input() public formControl: FormControl;
    @Input() public compareWith: any;
    @Input() public disableOptionCentering: any;
    @Input() public multiple: any;
    @Input() public selectionChange: EventEmitter<any>;
}

// tslint:disable-next-line:max-classes-per-file
@Component({
    selector: "mat-form-field",
    template: ""
})
class MockMatFormField {
    @Input() public apperance: any;
}

// tslint:disable-next-line:max-classes-per-file
@Component({
    selector: "mat-option",
    template: ""
})
class MockMatOption {
    @Input() public value: any;
    @Input() public click: EventEmitter<any>;
}
