import { Inject, OnDestroy } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";

import { BehaviorSubject, Observable } from "rxjs";

import { RiskQuestionType, RiskQuestion, RiskQuestionAnswer } from "@app/models";

@Inject({provideIn: "root"})
export class RiskPanelFormHandler implements OnDestroy {

    public answers: Observable<RiskQuestionAnswer[]>;
    private subject: BehaviorSubject<RiskQuestionAnswer[]>;

    public constructor(
        private readonly formGroup: FormGroup,
        private readonly riskQuestions: RiskQuestion[]
    ) {
        const answers = this.generateRiskQuestionAnswers();
        this.subject = new BehaviorSubject<RiskQuestionAnswer[]>(answers);

        this.answers = this.subject.asObservable();

        formGroup.valueChanges.subscribe(() => this.handleChanges());
    }

    public ngOnDestroy(): void {
        this.subject.complete();
    }

    private handleChanges(): void {
        const answers = this.generateRiskQuestionAnswers();

        if (answers) {
            this.subject.next(answers);
        }
    }

    private generateRiskQuestionAnswers(): RiskQuestionAnswer[] {
        const answers = [] as RiskQuestionAnswer[];

        for (const key in this.formGroup.controls) {
            if (this.formGroup.controls.hasOwnProperty(key)) {
                const control = this.formGroup.controls[key];
                const answer = this.createAnswerFromControl(control, key);

                const riskQuestion = this.riskQuestions.find(question => question.tag === answer.riskQuestionTag);

                if (answer && riskQuestion) {
                    answers.push(
                        this.shouldRiskQuestionBeVisible(riskQuestion, answer) ?
                            answer :
                            this.createEmptyAnswer(answer));
                }
            }
        }
        return answers;
    }

    private shouldRiskQuestionBeVisible(riskQuestion, answer) {
        if (riskQuestion) {
            switch (riskQuestion.questionType) {
                case RiskQuestionType.autoCompleteList:
                case RiskQuestionType.dropDownList:
                case RiskQuestionType.radioButton:
                case RiskQuestionType.clientLocationDropDown:
                    return riskQuestion.isVisible;
                default:
                    return riskQuestion.isVisible || this.isValidNumericAnswer(riskQuestion, answer);
            }
        }
        return true;
    }

    private isValidNumericAnswer(riskQuestion: RiskQuestion, answer: RiskQuestionAnswer): boolean {
        const questionType: RiskQuestionType = riskQuestion.type;
        let numericValue: number;
        switch (questionType) {
            case RiskQuestionType.integer:
                numericValue = answer.number;
                break;
            case RiskQuestionType.percentage:
                numericValue = answer.percentage;
                break;
            case RiskQuestionType.currency:
                numericValue = answer.currency;
                break;
        }
        return numericValue !== null && numericValue > 0;
    }

    private createAnswerFromControl(control: AbstractControl, tag: string): RiskQuestionAnswer {
        const answer = new RiskQuestionAnswer();
        const riskQuestion = this.riskQuestions.find(question => question.tag === tag);

        answer.riskQuestionTag = tag;
        answer.riskQuestionType = riskQuestion ? riskQuestion.type : null;

        switch (riskQuestion ? riskQuestion.type : null) {
            case RiskQuestionType.freeText:
            case RiskQuestionType.textArea: answer.text = control.value; break;
            case RiskQuestionType.currency: answer.currency = control.value; break;
            case RiskQuestionType.percentage: answer.percentage = control.value; break;
            case RiskQuestionType.integer: answer.number = control.value; break;
            case RiskQuestionType.date: answer.date = control.value; break;
            case RiskQuestionType.retroDate:
                if (control.value) {
                    answer.date = control.value.date;
                    answer.riskQuestionOptionUid = control.value.uid;
                    answer.text = this.getTextForRiskQuestionOption(control.value.uid, riskQuestion);
                }
                break;
            case RiskQuestionType.dropDownList:
            case RiskQuestionType.autoCompleteList:
            case RiskQuestionType.radioButton:
            case RiskQuestionType.clientLocationDropDown:
                if (control.value) {
                    answer.riskQuestionOptionUid = control.value;
                    answer.text = this.getTextForRiskQuestionOption(control.value, riskQuestion);
                }
                break;
            case RiskQuestionType.checkBoxArray:
                if (control.value) {
                    answer.options = Object.assign({}, ...control.value.map((o) => ({ [o.uid]: o.text })));
                }
                break;
        }

        return answer;
    }

    private getTextForRiskQuestionOption(riskQuestionOptionUid: string, question: RiskQuestion): string {
        const option = question.options.find(o => o.uid === riskQuestionOptionUid);

        if (!option || !option.text) {
            return null;
        }

        return option.text;
    }

    private createEmptyAnswer(answer: RiskQuestionAnswer): RiskQuestionAnswer {
        const emptyAnswer = new RiskQuestionAnswer();
        emptyAnswer.riskQuestionTag = answer.riskQuestionTag;

        return emptyAnswer;
    }
}
