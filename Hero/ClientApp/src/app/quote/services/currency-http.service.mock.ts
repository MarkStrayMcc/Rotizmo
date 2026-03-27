import { Injectable } from '@angular/core';
import { Guid } from 'guid-typescript';
import { Observable, of } from 'rxjs';
import { EnquirySearchResponse } from '@app/models/auto-generated/EnquirySearchResponse';
import { BaseService } from '@app/services/base.service';
import { EnquiryServiceEnquiry } from '@app/quote/models/enquiry/EnquiryServiceEnquiry';
import { NerdEnquiry } from "@app/quote/models/enquiry/NerdEnquiry";
import {HttpClient} from "@angular/common/http";
import {Currency} from "@app/models";
import {catchError} from "rxjs/operators";

@Injectable()
export class FakeCurrencyHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public static UsdCurrency: Currency = { id: 0, isoCode: "USD", name: "US Dollars", rate: 1.1, symbol: "$" }
    public static GbpCurrency: Currency = { id: 1, isoCode: "GBP", name: "Pound Sterling", rate: 1, symbol: "£" }

    public getCurrencies(): Observable<Currency[] | any> {
        return of(FakeCurrencyHttpService.createCurrencyList())
    }

    private static createCurrencyList(): Currency[] {
        return [FakeCurrencyHttpService.UsdCurrency, FakeCurrencyHttpService.GbpCurrency];
    }

    public getCurrencyRateByIsoCode(isocode: string): Observable<string | any> {
        return of(["1.2"]);
    }
}


