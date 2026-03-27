/* tslint:disable:max-classes-per-file */

import { TestBed } from "@angular/core/testing";
import { DatePipe } from "@angular/common";
import { FakeSubjectivityHttpService } from "./subjectivity-http.service.mock";
import { SubjectivityService } from "./subjectivity.service";
import { LanguageService } from "@app/quote/services/language.service";
import { CountryService } from "@app/quote/services/country.service";
import { BrokerTeam, ClientLocation, Product, Quote, RiskQuestionAnswer } from "@app/models";

describe('SubjectivityService', () => {
    let subjectivityService: SubjectivityService;
    let languageService: LanguageService;
    let countryService: CountryService;
    let datePipe: DatePipe;
    let subjectivityHttpService = new FakeSubjectivityHttpService(null);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: LanguageService, useClass: MockLanguageService },
                { provide: CountryService, useClass: MockCountryService }
            ]
        });

        languageService = TestBed.inject<LanguageService>(LanguageService);
        countryService = TestBed.inject<CountryService>(CountryService);
        subjectivityService = new SubjectivityService(subjectivityHttpService, languageService, countryService, datePipe);
    });

    it('should create Subjectivity Service', () => {
        expect(subjectivityService).toBeTruthy();
    });

    it('should have local broker if the main broker is in Canada for Canadian risks',
        () => {
            // Arrange
            var testQuote = getTestQuote("CA", "CA");

            // Act
            var query = subjectivityService.getSubjectivityQueryFromQuote(testQuote);

            // Assert
            expect(query.HasLocalBroker).toBeTruthy();
        });

    it('should not have local broker if the main broker is not in Canada for Canadian risks',
        () => {
            // Arrange
            var testQuote = getTestQuote("CA", "US");

            // Act
            var query = subjectivityService.getSubjectivityQueryFromQuote(testQuote);

            // Assert
            expect(query.HasLocalBroker).toBeFalsy();
        });

    it('should have local broker if the main broker is in the EEA for EEA risks',
        () => {
            // Arrange
            var testQuote = getTestQuote("FR", "FR");

            // Act
            var query = subjectivityService.getSubjectivityQueryFromQuote(testQuote);

            // Assert
            expect(query.HasLocalBroker).toBeTruthy();
        });

    it('risk question should bring empty answer when there is no answer', () => {
        // Arrange
        let quote = getTestQuote("FR", "FR");
        quote.riskQuestionAnswers.push(
            new RiskQuestionAnswer(1, 1, "test",
                null, null, null, null,
                null, null, 1, 1, {})
        );

        // Act
        let answer = subjectivityService.getSubjectivityQueryFromQuote(quote).RiskQuestionAnswers[0].answer;

        // Assert
        expect(answer).toBe("");
    });

    it('risk question should bring the answer when there is any answer', () => {
        // Arrange
        let quote = getTestQuote("FR", "FR");
        let testScenarios = [
            new RiskQuestionAnswer(1, 1, "text",
                "something", null, null, null,
                null, null, 1, 1, {}),
            new RiskQuestionAnswer(1, 1, "number",
                null, 123, null, null,
                null, null, 1, 1, {}),
            new RiskQuestionAnswer(1, 1, "percentage",
                null, null, 25, null,
                null, null, 1, 1, {}),
            new RiskQuestionAnswer(1, 1, "date",
                null, null, null, new Date(),
                null, null, 1, 1, {}),
            new RiskQuestionAnswer(1, 1, "currency",
                null, null, null, null,
                350, null, 1, 1, {}),
            new RiskQuestionAnswer(1, 1, "riskQuestionOptionUid",
                "abc1234", null, null, null,
                null, "abc1234", 1, 1, {}), // This is a select and it always have the text and the uid
            new RiskQuestionAnswer(1, 1, "options",
                null, null, null, null,
                null, null, 1, 1, {"key": "value"})
        ];
        testScenarios.forEach((scenario) => {
            quote.riskQuestionAnswers = [];
            quote.riskQuestionAnswers.push(scenario);

            // Act
            let riskQuestionAnswer = subjectivityService.getSubjectivityQueryFromQuote(quote).RiskQuestionAnswers[0];

            // Assert
            expect(riskQuestionAnswer.answer).not.toBe("", `Answer for tag ${riskQuestionAnswer.tag} should not be empty`);
        });
    });

    it('should not have local broker if the main broker is not in the EEA for EEA risks',
        () => {
            // Arrange
            var testQuote = getTestQuote("FR", "GB");

            // Act
            var query = subjectivityService.getSubjectivityQueryFromQuote(testQuote);

            // Assert
            expect(query.HasLocalBroker).toBeFalsy();
        });

    function getTestQuote(insuredCountryIsoCode: string, brokerCountryIsoCode: string): Quote {
        return {
            languageId: 1,
            insuredLocation: {
                country: {
                    isoCode: insuredCountryIsoCode
                }
            } as ClientLocation,
            brokerTeam: {
                broker: {
                    country: {
                        isoCode: brokerCountryIsoCode
                    }
                }
            } as BrokerTeam,
            product: {
                productName: "CPM"
            } as Product,
            clientLocation: {
                country: {
                    isoCode: insuredCountryIsoCode
                }
            } as ClientLocation,
            coverages: [],
            riskQuestionAnswers: [],
            surplusLineBroker: null,
            localBroker: null
        } as Quote;
    }

    class MockLanguageService {
        public getLanguageById(id: number) { return "en" };
    }

    class MockCountryService {
        public isEeaCountry(countryIsoCode: string) {
            return countryIsoCode === "FR";
        };
    }
});
