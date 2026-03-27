import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class ActivityHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }
    public searchByProductCodeAndActivityName(productCode: string, activityName: string): Observable<any[] | any> {
        let url: string = `/activity/search?productCode=${encodeURIComponent(productCode)}&name=${encodeURIComponent(activityName)}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getActivityByProductIdAndParentId(productId: number, parentId?: number): Observable<any[] | any> {
        let url: string;
        if (parentId) {
            url = `/activitymap/getactivity?productId=${productId}&parentId=${parentId}`;
        }
        else {
            url = `/activitymap/getactivity?productId=${productId}&parentId=`;
        }

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getActivityByProductCodeAndActivityCode(productCode: string, activityCode: string): Observable<any[] | any> {
        let url: string = `/activitymap/activity-tree?productCode=${encodeURIComponent(productCode)}&childActivityCode=${encodeURIComponent(activityCode)}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
