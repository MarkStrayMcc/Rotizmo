import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BinderValidationCriteria } from "@app/models";
import { BaseService } from "./base.service";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";

@Injectable()
export class BinderValidationHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getBinderValidationCriterias(draftQuoteId: string, businessLineCodes: string): Observable<{
        [businessCategoryTagName: string]: BinderValidationCriteria[]
    } | any> {
        const endpointUrl = "/BinderValidation/GetBinderValidationCriterias";
        const url = `${endpointUrl}?draftQuoteId=${draftQuoteId}&businessLineCodes=${businessLineCodes}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
