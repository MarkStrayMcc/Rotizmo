import { Injectable } from "@angular/core";
import { RiskQuestionType } from "@app/enums/RiskQuestionType";
import { QuoteStep, RiskQuestion, RiskQuestionAnswer } from "@app/models";
import { QuoteService } from "@app/quote/services/quote.service";
import { RiskService } from "@app/services/risk-service";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserAuthorityHttpService } from "@app/services/user-authority-http.service";
import { UserService } from "@app/services/user.service";

@Injectable()
export class RiskPanelWarningsHandler {
    private warnings: { [tag: string]: boolean } = {};

    constructor(private readonly underwriterRiskValidationService: UnderwriterRiskValidationService,
        private readonly userService: UserService,
        private readonly quoteService: QuoteService,
        private readonly riskService: RiskService,
        private readonly userAuthorityHttpService: UserAuthorityHttpService) {
    }

    public checkWarningForRiskQuestion(riskQuestionTag: string): boolean {
        return this.warnings[riskQuestionTag];
    }

    public checkWarnings(): boolean {
        const riskQuestions: RiskQuestion[] = this.riskService.getRiskQuestions(QuoteStep.Risk);
        const riskQuestionAnswers: RiskQuestionAnswer[] = this.quoteService.getRiskQuestionAnswers();

        for (const riskQuestion of riskQuestions) {
            const currentRiskQuestionAnswer = riskQuestionAnswers.find(a => a.riskQuestionTag === riskQuestion.tag);

            if (currentRiskQuestionAnswer && this.isNumericRiskQuestion(riskQuestion.type)) {
                const riskQuestionAnswerValue = this.getNumericAnswerValue(riskQuestion.type, currentRiskQuestionAnswer);
                this.updateNumericWarningStatus(riskQuestion, riskQuestionAnswerValue);
            }
        }

        return this.anyWarnings();
    }

    private getNumericAnswerValue(riskQuestionType: number, riskQuestionAnswer: RiskQuestionAnswer) {
        return riskQuestionType === RiskQuestionType.integer ? riskQuestionAnswer.number : riskQuestionAnswer[RiskQuestionType[riskQuestionType]];
    }

    private isNumericRiskQuestion(riskQuestionType: number): boolean {
        return riskQuestionType === RiskQuestionType.currency || riskQuestionType === RiskQuestionType.percentage || riskQuestionType === RiskQuestionType.integer;
    }

    private updateNumericWarningStatus(riskQuestion: RiskQuestion, riskQuestionAnswer: number) {
        this.warnings[riskQuestion.tag] = !this.underwriterRiskValidationService.isValidRiskQuestionAnswer(riskQuestion.tag, riskQuestion.type, riskQuestionAnswer);
    }

    private anyWarnings(): boolean {
        for (const key in this.warnings) {
            if (this.warnings[key]) {
                return true;
            }
        }

        return false;
    }
}
