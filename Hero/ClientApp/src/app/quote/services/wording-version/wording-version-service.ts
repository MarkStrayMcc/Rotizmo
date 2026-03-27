import { Injectable } from "@angular/core";
import { DropDownItem } from "@app/models";
import { Observable } from "rxjs";
import { WordingVersionHttpService } from "./wording-version-http-service";

@Injectable()
export class WordingVersionService {
    constructor(private wordingVersionHttpService: WordingVersionHttpService) { }

    public getWordingVersions(productCode: string, countryCode: string, languageCode: string): Observable<DropDownItem[] | any> {
        return this.wordingVersionHttpService.getWordingVersions(productCode, countryCode, languageCode);
    }

    public getExcessWordingVersions(productCode: string, countryCode: string, languageCode: string): Observable<DropDownItem[] | any> {
        return this.wordingVersionHttpService.getExcessWordingVersions(productCode, countryCode, languageCode);
    }

    public isPublishableWordingVersion(wordingVersionId: number): Observable<boolean | any> {
        return this.isPublishableWordingVersion(wordingVersionId);
    }
}
