import { Injectable } from '@angular/core';
import { BaseService } from "./base.service";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { QuoteFeeRequest } from "@app/models/auto-generated/QuoteFeeRequest";
import { catchError, map, tap } from "rxjs/operators";
import { FeeRequest } from "@app/quote/models/Fees/FeeRequest";
import { FeeResponse } from "@app/quote/models/Fees/FeeResponse";

@Injectable()
export class FeeHttpService extends BaseService {

    private latestMaximumFeeInput: string;
    private latestMaximumFee: number;

    private latestDefaultFeeInput: string;
    private latestDefaultFee: number;

    constructor(http: HttpClient) {
        super(http);
    }

    public getMaximumFee(request: QuoteFeeRequest): Observable<number> {
        const url: string = 'fee/getmaximumfee';

        const body = JSON.stringify(request);
        const options = this.commonHttpHeaders(null);

        if (this.latestMaximumFeeInput && this.latestMaximumFeeInput === body && this.latestMaximumFee) {
            return of(this.latestMaximumFee);
        } else {
            return this.http.post(url, request, options)
                .pipe(tap((maxFee: number) => {
                    this.latestMaximumFeeInput = body;
                    this.latestMaximumFee = maxFee;
                }));
        }

    }

    public getDefaultFee(request: QuoteFeeRequest): Observable<number> {
        const url: string = 'fee/getdefaultfee';

        const body = JSON.stringify(request);
        const options = this.commonHttpHeaders(null);

        if (this.latestDefaultFeeInput && this.latestDefaultFeeInput === body && this.latestDefaultFee) {
            return of(this.latestDefaultFee);
        } else {
            return this.http.post(url, request, options)
                .pipe(
                    tap((defaultFee: number) => {
                        this.latestDefaultFeeInput = body;
                        this.latestDefaultFee = defaultFee;
                    }));
        }
    }

    public getFee(request: FeeRequest): Observable<FeeResponse | any> {
        const url = "fee/getfeesplits";
        
        const options = this.commonHttpHeaders(null);

        return this.http.post(url, request, options);
    }
}
