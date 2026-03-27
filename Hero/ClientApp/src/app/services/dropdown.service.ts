import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, } from "rxjs";
import { DropDownItem } from "@app/models";
import { BaseService } from "@app/services/base.service";
import { catchError, shareReplay, } from "rxjs/operators";
import { Memoize } from "@app/shared/decorators/memoize.decorator";

@Injectable()
export class DropdownService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    @Memoize()
    public getCountries(): Observable<DropDownItem[]> {
        const url = `/dropdown/countries`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getCurrencies(): Observable<DropDownItem[]> {
        const url = `/dropdown/currencies`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getCurrencyByCountryId(countryId: number): Observable<DropDownItem> {
        const url = `/dropdown/currency?countryId=${countryId}`;
        return this.http.get<DropDownItem>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getCfcContacts(): Observable<DropDownItem[]> {
        const url = `/dropdown/cfcContacts`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getProducts(): Observable<DropDownItem[]> {
        const url = `/dropdown/products`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getInsuranceTypes(): Observable<DropDownItem[]> {
        const url = `/dropdown/insuranceTypes`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getQuoteTypes(): Observable<DropDownItem[]> {
        const url = `/dropdown/quoteTypes`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getAutocompleteAddresses(model: any): Observable<DropDownItem[]> {
        const url = `/dropdown/getAutotcompleteAddress`;
        const options = this.commonHttpHeaders(null);

        return this.http.post<DropDownItem[]>(url, model, options).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getCountryStates(countryCode: string): Observable<DropDownItem[]> {
        const url = `/dropdown/getCountryStates?countryCode=${countryCode}`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    public getLanguages(): Observable<DropDownItem[]> {
        const url: string = `/dropdown/getlanguages`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }

    @Memoize()
    getUnderwritersForReferral(quoteId: number): Observable<DropDownItem[]> {
        const url = `/dropdown/GetUnderwritersForReferral?quoteId=${quoteId}`;
        return this.http.get<DropDownItem[]>(url).pipe(catchError(this.handleErrorObservable), shareReplay(1));
    }
}
