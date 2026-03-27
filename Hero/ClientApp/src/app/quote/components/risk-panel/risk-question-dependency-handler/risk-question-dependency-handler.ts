import {
    Operator,
    RiskQuestionType,
    Quote,
    RiskQuestion,
    RiskQuestionAnswer,
    RiskQuestionDependency
} from "@app/models";

export class RiskQuestionDependencyHandler {
    constructor(
        private riskQuestions: RiskQuestion[],
        private riskQuestionAnswers: RiskQuestionAnswer[]) {
    }

    public setVisibilityForRiskQuestions(): void {
        this.riskQuestions.forEach(question => {
            const shouldQuestionBeVisible = this.shouldQuestionBeVisible(question);
            question.isVisible = shouldQuestionBeVisible;
            if (!shouldQuestionBeVisible) {
                this.riskQuestionAnswers.find(answer => answer.riskQuestionTag === question.tag)[RiskQuestionType[question.type]] = null;
            }
        });
    }

    private shouldQuestionBeVisible(question: RiskQuestion): boolean {
        if (!this.hasDependencies(question)) {
            return true;
        }
        return question.dependencies.some(dependency => this.checkRiskQuestionAnswer(dependency));
    }

    private hasDependencies(question: RiskQuestion) {
        return question.dependencies && question.dependencies.length > 0;
    }

    private checkRiskQuestionAnswer(dependency: RiskQuestionDependency): boolean {

        const primaryQuestion = this.riskQuestions.find(q => q.tag === dependency.primaryRiskQuestionTag);
        const primaryAnswers = this.riskQuestionAnswers.filter(a => a.riskQuestionTag === dependency.primaryRiskQuestionTag);

        if (primaryQuestion && primaryAnswers) {
            switch (primaryQuestion.type) {
                case RiskQuestionType.autoCompleteList:
                case RiskQuestionType.dropDownList:
                case RiskQuestionType.radioButton:
                case RiskQuestionType.clientLocationDropDown:
                    return this.checkRiskQuestionOptionAnswer(primaryAnswers, dependency);
                case RiskQuestionType.checkBoxArray:
                    return this.checkRiskQuestionOptionsAnswer(primaryAnswers, dependency);
                default:
                    return this.checkNumericRiskQuestionAnswer(primaryQuestion.type, primaryAnswers, dependency);
            }
        }

        return true;
    }

    private checkRiskQuestionOptionAnswer(
        answers: RiskQuestionAnswer[],
        dependency: RiskQuestionDependency): boolean {
        return answers.some(answer => answer.riskQuestionOptionUid === dependency.riskQuestionOptionUid);       
    }

    private checkRiskQuestionOptionsAnswer(
        answers: RiskQuestionAnswer[],
        dependency: RiskQuestionDependency): boolean {
        return answers.some(answer => answer.options?.hasOwnProperty(dependency.riskQuestionOptionUid));
    }

    private checkNumericRiskQuestionAnswer(
        questionType: RiskQuestionType,
        answers: RiskQuestionAnswer[],
        dependency: RiskQuestionDependency) {

        let value = answers && answers.length > 0 ? this.getNumericValueForRiskQuestion(questionType, answers[0]) : null;

        if (value == null || value == 0) {
            return false;
        }

        switch (dependency.operator) {
            case Operator.EqualTo:
                return value === dependency.comparisonValue;
            case Operator.GreaterThan:
                return value > dependency.comparisonValue;
            case Operator.GreaterThanOrEqualTo:
                return value >= dependency.comparisonValue;
            case Operator.LessThan:
                return value < dependency.comparisonValue;
            case Operator.LessThanOrEqualTo:
                return value <= dependency.comparisonValue;
            default:
                return false;
        }
    }

    private getNumericValueForRiskQuestion(questionType: RiskQuestionType, answer: RiskQuestionAnswer): number {
        switch (questionType) {
            case RiskQuestionType.integer:
                return answer.number;
            case RiskQuestionType.percentage:
                return answer.percentage;
            case RiskQuestionType.currency:
                return answer.currency;
            default:
                return null;
        }
    }
}
