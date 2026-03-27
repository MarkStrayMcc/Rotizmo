import { DatePipe } from "@angular/common";
import * as Models from "@app/models/auto-generated";
export class RiskQuestionAnswer {
    public id: number;
    public quoteId: number;
    public riskQuestionTag: string;
    public text: string;
    public number: number;
    public percentage: number;
    public date: Date;
    public currency: number;
    public riskQuestionOptionUid: string;
    public showOnStep: Models.QuoteStep;
    public riskQuestionType: Models.RiskQuestionType;
    public options: { [key in string]: string };

    constructor(id?: number,
        quoteId?: number,
        riskQuestionTag?: string,
        text?: string,
        number?: number,
        percentage?: number,
        date?: Date,
        currency?: number,
        riskQuestionOptionUid?: string,
        showOnStep?: Models.QuoteStep,
        riskQuestionType?: Models.RiskQuestionType,
        options?: { [key in string]: string }) {
        this.id = id;
        this.quoteId = quoteId;
        this.riskQuestionTag = riskQuestionTag;
        this.text = text;
        this.number = number;
        this.percentage = percentage;
        this.date = date;
        this.currency = currency;
        this.riskQuestionOptionUid = riskQuestionOptionUid;
        this.showOnStep = showOnStep;
        this.riskQuestionType = riskQuestionType;
        this.options = options
    }

    public get answer(): string {
        if (this.text) {
            return this.text;
        }
        if (this.number) {
            return this.number.toString();
        }
        if (this.percentage) {
            return this.percentage.toString();
        }
        if (this.date) {
            let datePipe = new DatePipe(navigator.language);
            return datePipe.transform(this.date, 'yyyy-MM-dd');
        }
        if (this.currency) {
            return this.currency.toString();
        }
        if (this.options && Object.keys(this.options).length > 0) {
            return JSON.stringify(this.options)
        }

        return null;
    }
}
