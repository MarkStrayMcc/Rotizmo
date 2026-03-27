import { Pipe, PipeTransform } from "@angular/core";
import { RiskQuestionType } from "@app/enums";
import { RiskQuestion, RiskQuestionAnswer } from "@app/models";
import * as moment from 'moment';

@Pipe({ name: "riskQuestionAnswer" })
export class RiskQuestionAnswerPipe implements PipeTransform {
	public transform(value: string, riskQuestion: RiskQuestion): RiskQuestionAnswer {
		const enrichedRiskQuestionAnswer = new RiskQuestionAnswer();
		enrichedRiskQuestionAnswer.riskQuestionTag = riskQuestion.tag;
		enrichedRiskQuestionAnswer.riskQuestionType = riskQuestion.type;
		switch (riskQuestion.type) {
			case RiskQuestionType.percentage:
			case RiskQuestionType.currency:
			case RiskQuestionType.integer:
				enrichedRiskQuestionAnswer.number = isNullOrUndefined(value) ? null : Number(value);
				break;
			case RiskQuestionType.date:
				enrichedRiskQuestionAnswer.date = isNullOrUndefined(value) || Number.isNaN(Date.parse(value)) ? null : moment.utc(value).toDate();
				break;
			default:
				enrichedRiskQuestionAnswer.text = isNullOrUndefined(value) ? null : value;
				break;
		}
		return enrichedRiskQuestionAnswer;
	}
}

function isNullOrUndefined(value: string) {
    return value === "" || value === null || value === undefined;
}

