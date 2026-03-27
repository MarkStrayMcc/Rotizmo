import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BinderLookup, BinderSectionLookup } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class BinderHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    private binderApiUrl = "binder";

    public getBinderLookups(): Observable<BinderLookup[] | any> {
        return this.http.get(this.binderApiUrl + "/binderLookups")
            .pipe(catchError(this.handleErrorObservable));
    }
    public getBinderSectionLookups(): Observable<BinderSectionLookup[] | any> {
        return this.http.get(this.binderApiUrl + "/binderSectionLookups")
            .pipe(catchError(this.handleErrorObservable));
    }

}

