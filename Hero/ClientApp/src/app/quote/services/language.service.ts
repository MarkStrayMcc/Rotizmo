import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject} from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { Language } from "../models/Language";
import { LanguageHttpService } from "./language-http.service";

@Injectable()
export class LanguageService {
    constructor(private languageHttpService: LanguageHttpService) { }

    public _languageList = new BehaviorSubject<Language[]>([]);
    private ngUnsubscribe = new Subject<void>();

    public languageList = this._languageList.asObservable();

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public getLanguageByCountryIsoCodeAndProductCode(countryIsoCode: string, productCode: string): Observable<Language[]> {
        return this.languageHttpService.getLanguageByCountryIsoCodeAndProductCode(countryIsoCode, productCode)
            .pipe(takeUntil(this.ngUnsubscribe), tap((languageList) => this._languageList.next(languageList)));
    }

    public mapLanguageToDropDownItem(languages: Language[]) {
        let dropDrownList = [];
        languages.map(language => dropDrownList.push({ text: language.name, value: language.id }));
        return dropDrownList;
    }

    public getLanguageById(id: number): Language {
        const languages = this._languageList.value;
        return languages.find(language => language.id === id);
    }

    public getLanguageByIsoCode(isoCode: string): Language {
        const languages = this._languageList.value;
        return languages.find(language => language.isoCode === isoCode);
    }
}
