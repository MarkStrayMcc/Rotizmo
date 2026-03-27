import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseService } from "@app/services/base.service";
import { DropDownItem } from "@app/models";
import { catchError } from "rxjs/operators";

@Injectable()
export class WordingVersionHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getWordingVersions(productCode: string, countryCode: string, languageCode: string): Observable<DropDownItem[] | any> {
        const url = `/dropdown/getWordingVersions`;
        const params = new HttpParams()
            .set('productCode', productCode)
            .set('countryCode', countryCode)
            .set('languageCode', languageCode)

        const headers = this.commonHttpHeaders(null).headers;

        return this.http.get(url, { headers: headers, params: params })
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getExcessWordingVersions(productCode: string, countryCode: string, languageCode: string): Observable<DropDownItem[] | any> {
        const url = `/dropdown/getExcessWordingVersions`

        const headers = this.commonHttpHeaders(null).headers;

        const params = new HttpParams()
            .set('productCode', productCode)
            .set('countryCode', countryCode)
            .set('languageCode', languageCode)

        return this.http.get(url, { headers: headers, params: params })
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public isPublishableWordingVersion(wordingVersionId: number): Observable<boolean | any> {
        const url = `/WordingVersions/${wordingVersionId}/is-publishable`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
