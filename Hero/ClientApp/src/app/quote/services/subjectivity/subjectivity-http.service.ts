import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subjectivity, SubjectivityFilterParameters } from "@app/models";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { BaseService } from "../../../services/base.service";
import { SearchSubjectivitiesQuery } from "@app/quote/models/subjectivity/subjectivity-configuration/SearchSubjectivitiesQuery";
import { SearchSubjectivitiesResult } from "@app/models/subjectivity-configuration/SearchSubjectivitiesResult";

@Injectable()
export class SubjectivityHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getMainData(productId: number, languageId: number, countryId: number, isAdmitted: boolean, surplusBrokerId?: number): Observable<Subjectivity[] | any> {

        let url: string = `/subjectivity/getsubjectivity?productId=${productId}&languageId=${languageId}&countryId=${countryId}&isAdmitted=${isAdmitted}`;

        if (surplusBrokerId) {
            url += `&surplusLineBrokerId=${surplusBrokerId}`;
        }

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getDefaultSubjectivities(draftQuoteId: string): Observable<Subjectivity[] | any> {
        let url: string = `/subjectivity/getdefaultsubjectivities?draftQuoteId=${draftQuoteId}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public search(subjectivityFilterParameters: SubjectivityFilterParameters): Observable<Subjectivity[] | any>{
        let url: string = `/subjectivities/search`;

        return this.http.post(url, subjectivityFilterParameters)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public searchInSubjectivityConfiguration(searchSubjectivitiesQuery: SearchSubjectivitiesQuery): Observable<SearchSubjectivitiesResult[] | any>{
        let url: string = `/subjectivity-configuration/filter`;

        return this.http.post(url, searchSubjectivitiesQuery)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
