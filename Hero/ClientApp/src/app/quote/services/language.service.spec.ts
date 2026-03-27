/* tslint:disable:max-classes-per-file */

import { of, throwError } from "rxjs";
import { Language } from "../models/Language";
import { FakeLanguageHttpService } from "./language-http.service.mock";
import { LanguageService } from "./language.service";

describe('LanguageService', () => {
    let languageService: LanguageService;
    let languageHttpService = new FakeLanguageHttpService(null);

    beforeEach(() => {
        languageService = new LanguageService(languageHttpService);
    });

    it('should create Language Service', () => {
        expect(languageService).toBeTruthy();
    });

    it('should retrieve a list with 2 Languages', () => {
        // Arrange 
        const english: Language = { id: 1, isoCode: "en", name: "English" };
        const french: Language = { id: 2, isoCode: "fr", name: "French" };
        const mockLanguages = [english, french];

        // Act
        var languageList = languageService.getLanguageByCountryIsoCodeAndProductCode("en", "cpm");

        // Assert
        languageList.subscribe(languages => {
            expect(languages).toEqual(mockLanguages);
            expect(languages.length).toEqual(2);
        })
    });

    it('should get a list with one language', () => {
        // Arrange 
        const english: Language = { id: 1, isoCode: "en", name: "English" };
        const mockLanguages = [english];
        spyOn(languageHttpService, "getLanguageByCountryIsoCodeAndProductCode").and.returnValue(of(mockLanguages));

        // Act
        var languageList = languageService.getLanguageByCountryIsoCodeAndProductCode("en", "cpm");

        // Assert
        languageList.subscribe(languages => {
            expect(languages).toEqual(mockLanguages);
            expect(languages.length).toEqual(1);
        });
    });

    it('should set language list empty if response is Not Found', () => {
        // Arrange 
        spyOn(languageHttpService, "getLanguageByCountryIsoCodeAndProductCode").and.returnValue(throwError({ status: 404 }));

        // Act
        languageService.getLanguageByCountryIsoCodeAndProductCode("pt", "cpm");

        // Assert
        languageService.languageList.subscribe(languages => {
            expect(languages).toEqual([]);
        });
    });

    it('should set language to null if return not 200 or 404 status', () => {
        // Arrange 
        spyOn(languageHttpService, "getLanguageByCountryIsoCodeAndProductCode").and.returnValue(throwError({ status: 400 }));

        // Act
        languageService.getLanguageByCountryIsoCodeAndProductCode(null, null);

        // Assert
        languageService.languageList.subscribe(languages => {
            expect(languages.length).toEqual(0);
        });
    });

    it('should map languages to dropdown items', () => {
        // Arrange 
        const english: Language = { id: 1, isoCode: "en", name: "English" };
        const french: Language = { id: 2, isoCode: "fr", name: "French" };
        const mockLanguages = [english, french];

        const expectedDropdownItems = [{ value: 1, text: "English" }, { value: 2, text: "French" }];

        // Act
        const mappedValues = languageService.mapLanguageToDropDownItem(mockLanguages);

        // Assert
        expect(mappedValues).toEqual(expectedDropdownItems);
    });

    it('should get Language By Id', () => {
        // Arrange 
        const english: Language = { id: 1, isoCode: "en", name: "English" };
        const french: Language = { id: 2, isoCode: "fr", name: "French" };
        const mockLanguages = [english, french];

        var languageList = languageService.getLanguageByCountryIsoCodeAndProductCode("en", "cpm");

        languageList.subscribe(languages => {
            // Act
            const englishLanguage = languageService.getLanguageById(1);

            // Assert
            expect(englishLanguage).toEqual(english);
        })
    });

    it('should get Language By IsoCode', () => {
        // Arrange 
        const english: Language = { id: 1, isoCode: "en", name: "English" };
        const french: Language = { id: 2, isoCode: "fr", name: "French" };
        const mockLanguages = [english, french];

       var languageList =  languageService.getLanguageByCountryIsoCodeAndProductCode("en", "cpm");

        languageList.subscribe(languages => {
            // Act
            const englishLanguage = languageService.getLanguageByIsoCode("en");

            // Assert
            expect(englishLanguage).toEqual(english);
        })
    });
});
