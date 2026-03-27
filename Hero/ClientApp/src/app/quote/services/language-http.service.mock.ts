import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Observable, of } from "rxjs";
import { Language } from "../models/Language";

@Injectable()
export class FakeLanguageHttpService extends BaseService {
    public getLanguageByCountryIsoCodeAndProductCode(countryIsoCode: string, productCode: string): Observable<Language[] | any> {
        const english: Language = { id: 1, isoCode: "en", name: "English" };
        const french: Language = { id: 2, isoCode: "fr", name: "French" };
        const languages = [english, french];
        return of(languages);
    }
}
