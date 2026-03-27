import { async, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";

import { RiskQuestionType, RiskQuestion, RiskQuestionAnswer } from "@app/models";
import { RiskPanelFormHandler } from "@app/services/risk-panel-form-handler";

describe("RiskPanelFormHandler", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule]
        });
    }));

    it("should emit observable answers on changes", fakeAsync(() => {
        const question = new RiskQuestion();
        question.tag = "RQ123";
        question.type = RiskQuestionType.freeText;
        question.isVisible = true;
        question.isMandatory = true;

        const riskQuestions = [question] as RiskQuestion[];
        const formGroup = new FormGroup({
            RQ123: new FormControl()
        });

        const handler = new RiskPanelFormHandler(formGroup, riskQuestions);
        tick(1);
        let answers: RiskQuestionAnswer[];
        handler.answers.subscribe(x => {
            answers = x;
        });

        tick(500);

        formGroup.get("RQ123").setValue("something");

        tick(1);

        expect(answers).toBeTruthy();
        expect(answers.length).toBe(1);
        expect(answers[0]).toBeTruthy();
        expect(answers[0].text).toBe("something");
    }));
});
