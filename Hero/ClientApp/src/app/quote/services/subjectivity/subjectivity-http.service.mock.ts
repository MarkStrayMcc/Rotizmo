import { Injectable } from "@angular/core";
import { Subjectivity } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable, of } from "rxjs";

@Injectable()
export class FakeSubjectivityHttpService extends BaseService {
    public getMainData(productId: number, languageId: number, countryId: number, isAdmitted: boolean, surplusBrokerId?: number): Observable<Subjectivity[] | any> {
        return of([new Subjectivity()]);
    }

    public getDefaultSubjectivities(draftQuoteId: string): Observable<Subjectivity[] | any> {
        return of([new Subjectivity()]);
    }

    public search(): Observable<Subjectivity[] | any>{
        return of([new Subjectivity()]);
    }

    public searchInSubjectivityConfiguration(): Observable<Subjectivity[] | any>{
        return of([new Subjectivity()]);
    }
}
