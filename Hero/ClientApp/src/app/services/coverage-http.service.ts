import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { CoverageRequest, CoverageType } from "@app/models";
import { BaseService } from "./base.service";
import { HttpClient } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { MultiplePropertyBusinessLines } from "../quote/models/MultiplePropertyBusinessLines";
import { Memoize } from '@app/shared/decorators/memoize.decorator';

@Injectable()
export class CoverageHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    private wordingVersionId: number = null;
    private product: string = null;
    private territory: string;

    private coverageTypes: CoverageType[] = [];

    public getAvailable(model: CoverageRequest): Observable<CoverageType[] | any> {
        if (
            model.product === this.product &&
            model.territory === this.territory &&
            model.wordingVersionId === this.wordingVersionId
        ) {
            return from([this.coverageTypes]);
        }

        this.wordingVersionId = model.wordingVersionId;
        this.product = model.product;
        this.territory = model.territory;

        const url = `/api/Coverage/GetAvailable`;

        const options = this.commonHttpHeaders(null);

        const result = this.http
            .post(url, model, options)
            .pipe(catchError(this.handleErrorObservable));

        // This should be replaced with a replay subject or something similar
        result.subscribe((x: CoverageType[]) => (this.coverageTypes = x));

        return result;
    }

    @Memoize()
    public getMultiplePropertyBusinessLineProducts(businessLineCode: string): Observable<MultiplePropertyBusinessLines> {
        const url: string = `/templates/GetMultiplePropertyBusinessLineProducts/${businessLineCode}`;

        return this.http.get(url).pipe(
            tap((data: MultiplePropertyBusinessLines) => data),
            catchError(this.handleErrorObservable)
        );
    }
}
