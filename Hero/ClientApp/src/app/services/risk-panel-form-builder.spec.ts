import { async, inject, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { XHRBackend } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RiskQuestionType, RiskQuestion, RiskQuestionAnswer } from "@app/models";
import { RiskPanelFormBuilder } from "@app/services/risk-panel-form-builder";

describe("RiskPanelFormBuilder", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                FormBuilder,
                RiskPanelFormBuilder
            ],
            imports: [HttpClientTestingModule, ReactiveFormsModule]
        });
    }));

    let riskPanelFormService: RiskPanelFormBuilder = null;

    beforeEach(inject([RiskPanelFormBuilder], (service: RiskPanelFormBuilder) => {
        riskPanelFormService = service;
    }));

    it("Should be created", inject([XHRBackend, RiskPanelFormBuilder], (service: RiskPanelFormBuilder) => {
            expect(service).toBeTruthy();
        })
    );

    it("should create a top level form group", () => {
        expect(riskPanelFormService).toBeTruthy();
        const riskQuestions: RiskQuestion[] = createMockRiskQestions();
        const formGroup = riskPanelFormService.buildForm(riskQuestions, []);
        expect(formGroup).toBeTruthy();
    });

    it("should create a form group for each risk question", () => {
        const riskQuestions: RiskQuestion[] = createMockRiskQestions();
        const formGroup = riskPanelFormService.buildForm(riskQuestions, []);

        expect(Object.keys(formGroup.controls).length).toBe(riskQuestions.length);

        riskQuestions.forEach(question => {
            const name = `${question.tag}`;
            expect(formGroup.get(name)).toBeTruthy();
        });
    });

    it("should create a form group with control for each risk question", () => {
        const riskQuestions: RiskQuestion[] = createMockRiskQestions();
        const formGroup = riskPanelFormService.buildForm(riskQuestions, []);

        expect(Object.keys(formGroup.controls).length).toBe(riskQuestions.length);

        riskQuestions.forEach(question => {
            const control = formGroup.get(question.tag) as AbstractControl;
            expect(control).toBeTruthy();
        });
    });

    it("should use existing answers to setup default values", () => {
        const riskQuestions: RiskQuestion[] = createMockRiskQestions();
        const answer = new RiskQuestionAnswer();
        answer.riskQuestionTag = riskQuestions[0].tag;
        answer.text = "previous value";

        const existingAnswers = [answer];
        const formGroup = riskPanelFormService.buildForm( riskQuestions, existingAnswers);

        const control =  formGroup.get(answer.riskQuestionTag) as AbstractControl;
        expect(control.value).toBe(answer.text);
    });

    it("should set Enrichment questions to readonly", () => {
        const riskQuestions: RiskQuestion[] = createMockRiskQestions();
        riskQuestions[0].isEnrichment = true;

        const formGroup = riskPanelFormService.buildForm( riskQuestions, []);

        const control =  formGroup.get(riskQuestions[0].tag) as AbstractControl;
        expect(control.disabled).toBe(true);
    });

    function createMockRiskQestions(): RiskQuestion[] {
        const riskQuestion =  new RiskQuestion();
        riskQuestion.isVisible = true;
        riskQuestion.tag = "RQ001";
        riskQuestion.type = RiskQuestionType.freeText;
        riskQuestion.label = "";

        return [riskQuestion];
    }
});
