import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { BinderSectionParticipation } from "@app/models";

@Injectable()
export class BinderSectionParticipationHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private binderApiUrl = "bindersectionparticipation";

    public getBinderSectionParticipationLookups(): Observable<BinderSectionParticipation[] | any> {
        return this.http.get(this.binderApiUrl + "/getbindersectionparticipationlookups")
            .pipe(catchError(this.handleErrorObservable));
    }

}

