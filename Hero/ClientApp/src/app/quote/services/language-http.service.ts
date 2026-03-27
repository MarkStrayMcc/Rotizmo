import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Language } from "@app/quote/models/Language";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";

@Injectable()
export class LanguageHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getLanguageByCountryIsoCodeAndProductCode(countryIsoCode: string, productCode: string): Observable<Language[] | any> {
        const url = `/languages?countryIsoCode=${countryIsoCode}&productCode=${encodeURIComponent(productCode)}`;
        return this.http.get(url);
    }
}
