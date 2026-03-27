/* tslint:disable:max-classes-per-file */
import { Component, forwardRef, Injectable, Input, SimpleChange} from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { WarningComponent } from "@app/components/warning/warning.component";
import { Currency, Quote, RiskQuestion, RiskQuestionType } from "@app/models";
import { MockUserService } from "@app/quote/steps/base-step.component.mock";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { RiskPanelFormBuilder } from "@app/services/risk-panel-form-builder";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserAuthorityHttpService } from "@app/services/user-authority-http.service";
import { UserService } from "@app/services/user.service";
import { of } from "rxjs";
import { CheckBoxesComponent } from "../risk/check-boxes/check-boxes.component";
import { RiskQuestionValidationHandler } from "../risk/risk-form-validation-handler/risk-question-validation-handler";
import { RiskPanelWarningsHandler } from "./risk-panel-warnings-handler/risk-panel-warnings-handler";
import { RiskPanelComponent } from "./risk-panel.component";
import {
    RiskQuestionDependencyHandler
} from "@app/quote/components/risk-panel/risk-question-dependency-handler/risk-question-dependency-handler";

let component: RiskPanelComponent = null;
let fixture: ComponentFixture<RiskPanelComponent>;
describe("RiskPanelComponent", () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: BinderValidationService, useClass: MockBinderValidationService },
                { provide: RiskPanelWarningsHandler, useClass: MockRiskPanelWarningsHandler },
                { provide: UserAuthorityHttpService, useClass: MockUserAuthorityHttpService },
                { provide: UnderwriterRiskValidationService, useClass: MockUnderwriterRiskValidationService },
                { provide: UserService, useClass: MockUserService },
                RiskPanelFormBuilder,
                RiskQuestionValidationHandler
            ],
            imports: [ReactiveFormsModule],
            declarations: [
                RiskPanelComponent,
                WarningComponent,
                MockPercentageFieldComponent,
                MockRetroDateComponent,
                MockPercentageFieldComponent,
                MockFreeTextComponent,
                MockTextAreaComponent,
                MockIntegerComponent,
                MockRiskCurrencyComponent,
                MockDateQuestionComponent,
                MockSearchableDropdownComponent,
                MockDropDownComponent,
                MockDropDownWithValidationComponent,
                MockRadioButtonsComponent,
                MockCheckBoxesComponent
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RiskPanelComponent);
        component = fixture.componentInstance;
    }));

    beforeEach(fakeAsync(() => {
        const quote = new Quote();
        quote.currency = new Currency();
        component.quote = quote;
        component.riskQuestions = null;

        fixture.detectChanges();
    }));

    it("should be created", fakeAsync(() => {
        expect(component).toBeTruthy();
    }));

    it("should create form when riskQuestions initialised", fakeAsync(() => {
        const riskQuestion = new RiskQuestion();
        riskQuestion.label = "TEST";
        riskQuestion.tag = "TEST";
        riskQuestion.type = RiskQuestionType.freeText;

        component.riskQuestions = [riskQuestion];

        fixture.detectChanges();
        expect(component).toBeTruthy();
    }));

    it("should replace the currency variable on risk question label", fakeAsync(() => {
        const riskQuestion = new RiskQuestion();
        riskQuestion.label = "This is worth [[ccy]]1,000,000";
        const quote = new Quote();
        quote.currency = new Currency();
        quote.currency.symbol = "$";

        component.quote = quote;
        component.riskQuestions = [riskQuestion];

        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(component.riskQuestions[0].label).toBe("This is worth $1,000,000");
    }));

    it("should call the setup functions if a change is made on risk question", fakeAsync (() =>{
        let riskQuestion1 = new RiskQuestion();
        riskQuestion1.tag = "TEST";
        riskQuestion1.label = "Risk1";

        let riskQuestion2 = new RiskQuestion();
        riskQuestion2.tag = "TEST2";
        riskQuestion2.label = "Risk2";
        component.isRiskStep  = true;
        component.riskQuestions = [riskQuestion1, riskQuestion2];

        let spyCheckRiskQuestionAuthority = spyOn(component, "checkRiskQuestionAuthority").and.returnValue(null);
        let spyOnBuildForm = spyOn(component.riskPanelFormBuilder, "buildForm").and.returnValue(null);
        let spyOnSetupForm = spyOn(component, "setupForm").and.returnValue(null);
        let spyOnSetupValueChangesSubscription = spyOn(component, "setupValueChangesSubscription").and.returnValue(null);
        let spyOnSetupStatusChangesSubscription = spyOn(component, "setupStatusChangesSubscription").and.returnValue(null);
        let spyOnInitialiseBindersCriteriaValidation = spyOn(component.binderValidationService, "initialiseBindersCriteriaValidation").and.returnValue(null);
        let spyOnSetVisibilityForRiskQuestions = spyOn(RiskQuestionDependencyHandler.prototype, "setVisibilityForRiskQuestions").and.returnValue(null);

        //act
        component.ngOnChanges({
            riskQuestions : new SimpleChange(null, {riskQuestions: component.riskQuestions}, false)
        })
        fixture.detectChanges();

        // assert
        expect(spyCheckRiskQuestionAuthority).toHaveBeenCalledTimes(1);
        expect(spyOnBuildForm).toHaveBeenCalledTimes(0);
        expect(spyOnSetupForm).toHaveBeenCalledTimes(1);
        expect(spyOnSetupValueChangesSubscription).toHaveBeenCalledTimes(1);
        expect(spyOnSetupStatusChangesSubscription).toHaveBeenCalledTimes(1);
        expect(spyOnInitialiseBindersCriteriaValidation).toHaveBeenCalledTimes(1);
        expect(spyOnSetVisibilityForRiskQuestions).toHaveBeenCalledTimes(1);

    }))
    it("should build form when first change is true", fakeAsync(() => {
        fixture = TestBed.createComponent(RiskPanelComponent);
        component = fixture.componentInstance;
        const quote = new Quote();
        quote.currency = new Currency();
        component.quote = quote;

        let riskQuestion1 = new RiskQuestion();
        riskQuestion1.tag = "TEST";
        riskQuestion1.label = "Risk1";

        let riskQuestion2 = new RiskQuestion();
        riskQuestion2.tag = "TEST2";
        riskQuestion2.label = "Risk2";
        component.isRiskStep = true;
        component.riskQuestions = [riskQuestion1, riskQuestion2];


        let spyCheckRiskQuestionAuthority = spyOn(component, "checkRiskQuestionAuthority").and.returnValue(null);
        let spyOnBuildForm = spyOn(component.riskPanelFormBuilder, "buildForm").and.returnValue(null);
        let spyOnSetupForm = spyOn(component, "setupForm").and.returnValue(null);
        let spyOnSetupValueChangesSubscription = spyOn(component, "setupValueChangesSubscription").and.returnValue(null);
        let spyOnSetupStatusChangesSubscription = spyOn(component, "setupStatusChangesSubscription").and.returnValue(null);
        let spyOnInitialiseBindersCriteriaValidation = spyOn(component.binderValidationService, "initialiseBindersCriteriaValidation").and.returnValue(null);
        let spyOnSetVisibilityForRiskQuestions = spyOn(RiskQuestionDependencyHandler.prototype, "setVisibilityForRiskQuestions").and.returnValue(null);

        //act
        component.ngOnChanges({
            riskQuestions:
                new SimpleChange(null, {riskQuestions: component.riskQuestions}, true)
        })
        fixture.detectChanges();

        // assert
        expect(spyCheckRiskQuestionAuthority).toHaveBeenCalledTimes(1);
        expect(spyOnBuildForm).toHaveBeenCalledTimes(1);
        expect(spyOnSetupForm).toHaveBeenCalledTimes(0);
        expect(spyOnSetupValueChangesSubscription).toHaveBeenCalledTimes(0);
        expect(spyOnSetupStatusChangesSubscription).toHaveBeenCalledTimes(0);
        expect(spyOnInitialiseBindersCriteriaValidation).toHaveBeenCalledTimes(0);
        expect(spyOnSetVisibilityForRiskQuestions).toHaveBeenCalledTimes(0);

    }))

});

@Injectable()
class MockUserAuthorityHttpService {
    public getRiskQuestionValidationRulesByActivities() {
        return of([]);
    }
}

@Injectable()
class MockUnderwriterRiskValidationService {
    public isValidRiskQuestionAnswer = () => true;
    public hasValidRiskAnswers = () => true;
    public isValidNumberSplitByActivity = () => true;
}

@Component({
    selector: "retrodate",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockRetroDateComponent),
            multi: true
        }
    ]
})
class MockRetroDateComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "percentage-field",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockPercentageFieldComponent),
            multi: true
        }
    ]
})
class MockPercentageFieldComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "free-text",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockFreeTextComponent),
            multi: true
        }
    ]
})
class MockFreeTextComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "text-area",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockTextAreaComponent),
            multi: true
        }
    ]
})
class MockTextAreaComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "integer-field",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockIntegerComponent),
            multi: true
        }
    ]
})
class MockIntegerComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "risk-currency",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockRiskCurrencyComponent),
            multi: true
        }
    ]
})
class MockRiskCurrencyComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;
    @Input() public currency: Currency;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "datequestion",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockDateQuestionComponent),
            multi: true
        }
    ]
})
class MockDateQuestionComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "searchable-dropdown",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockSearchableDropdownComponent),
            multi: true
        }
    ]
})
class MockSearchableDropdownComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "drop-down",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockDropDownComponent),
            multi: true
        }
    ]
})
class MockDropDownComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "drop-down-with-validation",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockDropDownWithValidationComponent),
            multi: true
        }
    ]
})
class MockDropDownWithValidationComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}


@Component({
    selector: "radiobutton",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockRadioButtonsComponent),
            multi: true
        }
    ]
})
class MockRadioButtonsComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
}

@Component({
    selector: "check-boxes",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockCheckBoxesComponent),
            multi: true
        }
    ]
})
class MockCheckBoxesComponent implements ControlValueAccessor {
    @Input() public riskQuestion: RiskQuestion;

    public writeValue(obj: any): void { }
    public registerOnChange(fn: any): void { }
    public registerOnTouched(fn: any): void { }
    public setDisabledState?(isDisabled: boolean): void { }
    public onChangeCategory(obj: any) { }
    public comapre(optionFirst: any, optionSecond: any) { }
}

class MockBinderValidationService {
    public filterBindersCriteriaBasedOnRevenueFirst(): void { return; }
    public loadCriteriasForSelectedBusinessCategoriesOnQuote(): void { return; }
    public initialiseBindersCriteriaValidation() : void { return; }
}

class MockRiskPanelWarningsHandler {
    public checkWarningForRiskQuestion = () => false;
    public checkWarnings = () => false;
}
