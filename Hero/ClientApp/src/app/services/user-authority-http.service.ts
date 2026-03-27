import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RiskQuestionValidationRulesSearchRequest } from "@app/quote/models/RiskQuestionValidationRulesSearchRequest";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { BaseService } from "./base.service";

@Injectable()
export class UserAuthorityHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getRiskQuestionValidationRulesByActivities(riskQuestionValidationRequest: RiskQuestionValidationRulesSearchRequest): Observable<any> {
        const url = `/userauthority/risk-question-validation-rules/`;
        const options = this.commonHttpHeaders(null);

        return this.http.post(url, riskQuestionValidationRequest, options)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
