import { Injectable } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from "@angular/forms";

import * as moment from 'moment';

import { RiskQuestionType, RiskQuestion, RiskQuestionAnswer, RiskQuestionOption } from "@app/models";
import { DateValidators } from "@app/validators/date.validators";
import { DropDownWithValidationValidators } from "@app/validators/dropdown-with-validation-validators/dropdown-with-validation.validator";


@Injectable()
export class RiskPanelFormBuilder {
    constructor(private formBuilder: FormBuilder) {
    }

    public buildForm(questions: RiskQuestion[], answers: RiskQuestionAnswer[]): FormGroup {
        const formGroup = new FormGroup({});

        questions.forEach(question =>
            formGroup.addControl(question.tag, this.setupControlForRiskQuestion(question, answers)));

        return formGroup;
    }

    private setupControlForRiskQuestion(question: RiskQuestion, answers: RiskQuestionAnswer[]): AbstractControl {
        const value = this.getDefaultValue(question, answers);
        const validators = this.getValidators(question);

        let control: AbstractControl;
        switch (question.type) {
            default: control = this.formBuilder.control(value, validators);
        }

        if (question.isEnrichment) {
            control.disable();
        }

        return control;
    }

    private getDefaultValue(question: RiskQuestion, answers: RiskQuestionAnswer[]): any {
        const answer = answers.find(a => a.riskQuestionTag === question.tag);

        if (answer && answer.riskQuestionType === RiskQuestionType.dropDownList && !answer.text) {
            answer.text = question.options.find((o) => o.uid === answer.riskQuestionOptionUid)?.text;
        }
        return answer ?
            this.getValueFromAnswer(question.type, answer) :
            this.getAnswerFromDefaultAnswers(question);
    }

    private getAnswerFromDefaultAnswers(question: RiskQuestion) {
        switch (question.type) {
            case RiskQuestionType.freeText:
            case RiskQuestionType.textArea:
                return question.defaultAnswer ? question.defaultAnswer.text : null;
            case RiskQuestionType.integer:
                return question.defaultAnswer ? question.defaultAnswer.number : null;
            case RiskQuestionType.percentage:
                return question.defaultAnswer ? question.defaultAnswer.percentage : null;
            case RiskQuestionType.currency:
                return question.defaultAnswer ? question.defaultAnswer.currency : null;
            case RiskQuestionType.date:
                return question.defaultAnswer ? question.defaultAnswer.date : null;
            case RiskQuestionType.retroDate:
                const value = {
                    date: question.defaultAnswer ? question.defaultAnswer.date : null,
                    uid: question.defaultAnswer ? question.defaultAnswer.riskQuestionOptionUid : null,
                };

                return this.getRetroDateDefaultValue(value);
            case RiskQuestionType.dropDownList:
            case RiskQuestionType.radioButton:
            case RiskQuestionType.autoCompleteList:
            case RiskQuestionType.clientLocationDropDown:
                return question.defaultAnswer ? question.defaultAnswer.riskQuestionOptionUid : null;
            case RiskQuestionType.checkBoxArray:
                return question.defaultAnswer ? question.defaultAnswer.options : null;
            default:
                return null;
        }
    }

    private getValueFromAnswer(questionType: RiskQuestionType, answer: RiskQuestionAnswer): any {
        switch (questionType) {
            case RiskQuestionType.freeText:
            case RiskQuestionType.textArea: return answer.text;
            case RiskQuestionType.integer: return answer.number;
            case RiskQuestionType.percentage: return answer.percentage;
            case RiskQuestionType.currency: return answer.currency;
            case RiskQuestionType.date: return answer.date;
            case RiskQuestionType.retroDate:
                const value = { date: answer.date, uid: answer.riskQuestionOptionUid };
                return this.getRetroDateDefaultValue(value);
            case RiskQuestionType.dropDownList:
            case RiskQuestionType.radioButton:
            case RiskQuestionType.autoCompleteList:
            case RiskQuestionType.clientLocationDropDown: return answer.riskQuestionOptionUid;
            case RiskQuestionType.checkBoxArray:
                return this.getCheckBoxArrayDefaultValue(answer);
            default: return null;
        }
    }

    private getValidators(question: RiskQuestion): ValidatorFn[] {
        const validators = [];

        if (question.isMandatory) {
            validators.push(Validators.required);
        }

        if (question.type === RiskQuestionType.percentage) {
            validators.push(Validators.min(0));
            validators.push(Validators.max(100));
        }

        if (question.type === RiskQuestionType.date) {
            validators.push(DateValidators.min(moment("1800-01-01")));
            validators.push(DateValidators.max(moment("2100-01-01")));
        }

        if (question.type === RiskQuestionType.clientLocationDropDown) {
            validators.push(DropDownWithValidationValidators.isGeoLocated(question.options));
        }
        return validators;
    }

    private getRetroDateDefaultValue(value: { date: Date, uid: string }) {
        if (!value.date && !value.uid) {
            return null;
        }

        return value;
    }

    private getCheckBoxArrayDefaultValue(answer: RiskQuestionAnswer) {
        if (!answer.options) {
            return null;
        }
        let options: RiskQuestionOption[] = [];

        for (const key in answer.options) {
            options.push({ uid: key, riskQuestionTag: answer.riskQuestionTag, text: answer.options[key], isValid: true } as RiskQuestionOption)
        }
        return options;
    }
}
