import { HttpClient } from "@angular/common/http";
import { RiskQuestion, RiskQuestionRequest, RiskQuestionDraftRequest } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";

@Injectable()
export class RiskHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getRiskQuestionsForQuote(request: RiskQuestionRequest): Observable<RiskQuestion[] | any> {
        const url: string = `/risk/risk-questions/quote`;

        const options = this.commonHttpHeaders(null);
        return this.http.post(url, request, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getRiskQuestionsForDraft(request: RiskQuestionDraftRequest): Observable<RiskQuestion[] | any> {
        const url: string = `/risk/risk-questions/draft`;

        const options = this.commonHttpHeaders(null);
        return this.http.post(url, request, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
