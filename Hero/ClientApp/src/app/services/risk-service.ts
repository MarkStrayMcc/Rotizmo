import { Injectable } from "@angular/core";
import { Constants } from "@app/constants/constants";
import { QuoteStep, RiskQuestion, RiskQuestionAnswer, RiskQuestionRequest } from "@app/models";
import { QuoteService } from "@app/quote/services/quote.service";
import { RiskHttpService } from "@app/services/risk-http.service";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable()
export class RiskService {
    private _riskQuestions: { [id: number]: RiskQuestion[] } = {};

    constructor(private riskHttpService: RiskHttpService,
        private readonly quoteService: QuoteService) {
    }

    public updateRiskQuestions(
        draftQuoteId?: string,
        quoteId?: number,
        quoteStep: QuoteStep = QuoteStep.Risk,
        riskQuestionTags: string[] = new Array<string>()): Observable<RiskQuestion[]> {
        const request = new RiskQuestionRequest();
        request.draftQuoteId = draftQuoteId;
        request.quoteId = quoteId;
        request.quoteStep = quoteStep;
        request.riskQuestionTags = riskQuestionTags;

        const result = request.draftQuoteId === Constants.emptyGuid ?
            this.riskHttpService.getRiskQuestionsForQuote(request) :
            this.riskHttpService.getRiskQuestionsForDraft(request);

        result.pipe(first()).subscribe(
            rq => this._riskQuestions[request.quoteStep] = rq,
            error => console.error(error));

        return result;
    }

    public getRiskQuestions(quoteStep: number): RiskQuestion[] {
        return this._riskQuestions[quoteStep] ? this._riskQuestions[quoteStep] : [];
    }

    public updateRiskQuestionAnswers(answers: RiskQuestionAnswer[]): void {
        let riskQuestionAnswers = this.quoteService.getRiskQuestionAnswers();
        for (const newAnswer of answers) {
            const oldAnswer = riskQuestionAnswers.find(a => a.riskQuestionTag === newAnswer.riskQuestionTag);

            if (oldAnswer) {
                const index = riskQuestionAnswers.indexOf(oldAnswer);
                riskQuestionAnswers.splice(index, 1);
            }
            riskQuestionAnswers.push(newAnswer);
        }
        this.quoteService.setPropertyValue("riskQuestionAnswers", riskQuestionAnswers);
    }
}
