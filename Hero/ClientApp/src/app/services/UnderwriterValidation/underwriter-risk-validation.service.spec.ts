import { Injectable } from "@angular/core";
import { async, inject, TestBed } from "@angular/core/testing";
import { Operator } from "@app/enums/Operator";
import { RiskQuestionType } from "@app/enums/RiskQuestionType";
import {
    CfcContact,
    Currency,
    QuoteStep,
    RiskQuestionAnswer, UnderwriterRole,
    UnderwriterRoleRiskQuestionValidation
} from "@app/models";
import { QuoteService } from "@app/quote/services/quote.service";
import { MockQuoteService } from "@app/quote/steps/base-step.component.mock";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserService } from "@app/services/user.service";

describe("UnderwriterRiskValidationService", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: UserService, useClass: MockUserService },
                { provide: QuoteService, useClass: MockQuoteService },
                UnderwriterRiskValidationService
            ]
        }).compileComponents();
    }));

    it("Should be created", inject([UnderwriterRiskValidationService], (service: UnderwriterRiskValidationService) => {
        expect(service).toBeTruthy();
    }));

    it("The value should be valid when greater or equal than 2 and smaller than 20 for the specific riskQuestionTag",
        inject([UnderwriterRiskValidationService, UserService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const riskQuestionTag: string = "TEST7";

                // Act
                let testCase0 = service.isValidRiskQuestionAnswer(riskQuestionTag, RiskQuestionType.integer, 1);
                let testCase1 = service.isValidRiskQuestionAnswer(riskQuestionTag, RiskQuestionType.integer, 1.5);
                let testCase2 = service.isValidRiskQuestionAnswer(riskQuestionTag, RiskQuestionType.integer, 2);
                let testCase3 = service.isValidRiskQuestionAnswer(riskQuestionTag, RiskQuestionType.integer, 3);
                let testCase4 = service.isValidRiskQuestionAnswer(riskQuestionTag, RiskQuestionType.integer, 19);
                let testCase5 = service.isValidRiskQuestionAnswer(riskQuestionTag, RiskQuestionType.integer, 20);
                let testCase6 = service.isValidRiskQuestionAnswer(riskQuestionTag, RiskQuestionType.integer, 21);

                // Assert
                expect(testCase0).toBeFalsy();
                expect(testCase1).toBeFalsy();
                expect(testCase2).toBeTruthy();
                expect(testCase3).toBeTruthy();
                expect(testCase4).toBeTruthy();
                expect(testCase5).toBeFalsy();
                expect(testCase6).toBeFalsy();
            }));

    it("Should hasValidRiskAnswers return false when one risk question answer is invalid (any step)",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, userService: UserService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const answers = getAnswers();
                answers.push(getInvalidAnswerForStep6());
                const getRiskQuestionAnswersSpy = spyOn(service["quoteService"], "getRiskQuestionAnswers").and.returnValue(answers);
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                const isValid: boolean = service.hasValidRiskAnswers(null);

                // Assert
                expect(getRiskQuestionAnswersSpy).toHaveBeenCalled();
                expect(isValid).toBeDefined();
                expect(isValid).toBeFalsy();
            }));

    it("Should hasValidRiskAnswers return true when all risk question answers are valid (any step)",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, userService: UserService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const answers = getAnswers();

                const getRiskQuestionAnswersSpy = spyOn(service["quoteService"], "getRiskQuestionAnswers").and.returnValue(answers);
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                const isValid: boolean = service.hasValidRiskAnswers(null);

                // Assert
                expect(getRiskQuestionAnswersSpy).toHaveBeenCalled();
                expect(isValid).toBeDefined();
                expect(isValid).toBeTruthy();
            }));

    it("Should hasValidRiskAnswers return true for risk answers on step 4",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const step = QuoteStep.Risk;

                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const answers = getAnswers();

                const getRiskQuestionAnswersSpy = spyOn(service["quoteService"], "getRiskQuestionAnswers").and.returnValue(answers);
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                const isValid: boolean = service.hasValidRiskAnswers(step);

                // Assert
                expect(getRiskQuestionAnswersSpy).toHaveBeenCalled();
                expect(isValid).toBeDefined();
                expect(isValid).toBeTruthy();
            }));

    it("Should be valid for risk question value below currency specific limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TOTAL_REVENUE", RiskQuestionType.currency, 1000000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should be valid for risk question value below at least one currency specific general limit where there are two limits",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY4", RiskQuestionType.currency, 7000000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should be not valid for risk question value above currency specific general limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TOTAL_REVENUE", RiskQuestionType.currency, 5000000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeFalsy();
            }));

    it("Should be valid for risk question value below general limit with no currency general specific limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testAusCurrency = { isoCode: "AUD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testAusCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY1", RiskQuestionType.currency, 1000000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should be valid for risk question value below at least one general limit with two general limits and no currency specific limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testNzCurrency = { isoCode: "NZD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testNzCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY5", RiskQuestionType.currency, 5000000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should be not valid for risk question value above general limit with no currency specific limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY1", RiskQuestionType.currency, 7000000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeFalsy();
            }));

    it("Should be not valid for risk question with no general limit and currency specific rule for different currency",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testAusCurrency = { isoCode: "AUD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testAusCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY2", RiskQuestionType.currency, 4000000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeFalsy();
            }));

    it("Should be valid for risk question with no rules",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testAusCurrency = { isoCode: "AUD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testAusCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY3", RiskQuestionType.currency, 4000000);

                // Assert
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should not be valid risk question value is greater than GBP rule converted to quote currency",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1.5 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY1", RiskQuestionType.currency, 6500000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeFalsy();
            }));

    it("Should be valid risk question value is lower than GBP rule converted to quote currency",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1.5 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);

                // Act
                let result = service.isValidRiskQuestionAnswer("TEST_CURRENCY1", RiskQuestionType.currency, 5500000);

                // Assert
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should be valid for risk question value below currency specific limit and below for specific activity limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);
                service["riskQuestionActivityValidation"] = getActivitiesRulesForCN();

                const getActivitiesSpy = spyOn(service["quoteService"], "getActivities").and.callThrough().and.returnValue(getQuoteSingleActivity());

                // Act
                let result = service.isValidRiskQuestionAnswer("TOTAL_REVENUE", RiskQuestionType.currency, 100000);

                // Assert
                expect(getActivitiesSpy).toHaveBeenCalled();
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should not be valid for risk question value below currency specific limit and total revenue above specific activity limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);
                service["riskQuestionActivityValidation"] = getActivitiesRulesForCN();

                const getActivitiesSpy = spyOn(service["quoteService"], "getActivities").and.callThrough().and.returnValue(getQuoteSingleActivity());

                // Act
                let result = service.isValidRiskQuestionAnswer("TOTAL_REVENUE", RiskQuestionType.currency, 100001);

                // Assert
                expect(getActivitiesSpy).toHaveBeenCalled();
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeFalsy();
            }));

    it("Should be valid for risk question value below currency specific limit and below for two activities limit",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);
                service["riskQuestionActivityValidation"] = getActivitiesRulesForCNandMG();

                const getActivitiesSpy = spyOn(service["quoteService"], "getActivities").and.callThrough().and.returnValue(getQuoteTwoActivities());

                // Act
                let result = service.isValidRiskQuestionAnswer("TOTAL_REVENUE", RiskQuestionType.currency, 118000);


                // Assert
                expect(getActivitiesSpy).toHaveBeenCalled();
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeTruthy();
            }));

    it("Should not be valid for risk question value below currency specific limit and above for one of the activities limit percentage from total revenue",
        inject([UnderwriterRiskValidationService, UserService, QuoteService],
            (service: UnderwriterRiskValidationService, quoteService: QuoteService) => {
                // Arrange
                const testUsCurrency = { isoCode: "USD", rate: 1 } as Currency;
                const getCurrencySpy = spyOn(service["quoteService"], "getCurrency").and.callThrough().and.returnValue(testUsCurrency);
                service["riskQuestionActivityValidation"] = getActivitiesRulesForCNandMG();

                const getActivitiesSpy = spyOn(service["quoteService"], "getActivities").and.callThrough().and.returnValue(getQuoteTwoActivities());

                // Act
                let result = service.isValidRiskQuestionAnswer("TOTAL_REVENUE", RiskQuestionType.currency, 120000);

                // Assert
                expect(getActivitiesSpy).toHaveBeenCalled();
                expect(getCurrencySpy).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(result).toBeFalsy();
            }));

    function getAnswers(): RiskQuestionAnswer[] {
        return [
            new RiskQuestionAnswer(
                20559,
                1083453,
                "TOTAL_REVENUE",
                null,
                null,
                null,
                null,
                1000000,
                null,
                4,
                RiskQuestionType.currency
            ),
            new RiskQuestionAnswer(
                20559,
                1083453,
                "TEST_CURRENCY",
                null,
                null,
                null,
                null,
                3000000,
                null,
                4,
                RiskQuestionType.currency
            ),
            new RiskQuestionAnswer(
                20551,
                1083453,
                "MEDIUM_TRIPS",
                null,
                3000,
                null,
                null,
                null,
                null,
                6,
                RiskQuestionType.integer
            )
        ];
    }

    function getInvalidAnswerForStep6(): RiskQuestionAnswer {
        let answer = {
            id: 20551,
            quoteId: 1083453,
            riskQuestionTag: "MEDIUM_TRIPS",
            text: null,
            number: 1000,
            percentage: null,
            date: null,
            currency: null,
            riskQuestionOptionUid: null,
            showOnStep: 6,
            riskQuestionType: RiskQuestionType.integer,
        } as RiskQuestionAnswer;

        return answer;
    }

    function getDefaultUser(): CfcContact {
        const user = new CfcContact();
        user.roles = [];
        user.roles[0] = new UnderwriterRole();
        user.roles[0].riskQuestionValidations = getRiskQuestionRules();
        user.roles[1] = new UnderwriterRole();
        user.roles[1].riskQuestionValidations = getSecondaryRiskQuestionRules();
        return user;
    }

    function getRiskQuestionRules(): UnderwriterRoleRiskQuestionValidation[] {
        return [
            {
                riskQuestionTag: "TOTAL_REVENUE",
                operator: Operator.LessThanOrEqualTo,
                value: "2000000",
                currencyIsoCode: "USD",
                activityCode: null
            },
            {
                riskQuestionTag: "TOTAL_REVENUE",
                operator: Operator.LessThanOrEqualTo,
                value: "100000",
                currencyIsoCode: "GBP",
                activityCode: null
            },
            {
                riskQuestionTag: "TOTAL_REVENUE",
                operator: Operator.LessThanOrEqualTo,
                value: "10000000",
                currencyIsoCode: "GBP",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST_CURRENCY1",
                operator: Operator.LessThanOrEqualTo,
                value: "4000000",
                currencyIsoCode: "GBP",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST_CURRENCY1",
                operator: Operator.LessThanOrEqualTo,
                value: "8000000",
                currencyIsoCode: "NZD",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST_CURRENCY2",
                operator: Operator.LessThanOrEqualTo,
                value: "5000000",
                currencyIsoCode: "USD",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST_CURRENCY4",
                operator: Operator.LessThanOrEqualTo,
                value: "7500000",
                currencyIsoCode: "USD",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST_CURRENCY4",
                operator: Operator.LessThanOrEqualTo,
                value: "6500000",
                currencyIsoCode: "USD",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST_CURRENCY5",
                operator: Operator.LessThanOrEqualTo,
                value: "5500000",
                currencyIsoCode: "GBP",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST_CURRENCY5",
                operator: Operator.LessThanOrEqualTo,
                value: "4500000",
                currencyIsoCode: "GBP",
                activityCode: null
            },
            {
                riskQuestionTag: "TEST7",
                operator: 3,
                value: "2",
                currencyIsoCode: null,
                activityCode: null
            }
        ];
    }

    function getSecondaryRiskQuestionRules(): UnderwriterRoleRiskQuestionValidation[] {
        return [
            {
                riskQuestionTag: "TEST7",
                operator: 4,
                value: "20",
                currencyIsoCode: null,
                activityCode: null
            },
            {
                riskQuestionTag: "MEDIUM_TRIPS",
                operator: 3,
                value: "2000",
                currencyIsoCode: null,
                activityCode: null
            }
        ];
    }

    function getActivitiesRulesForCN() {
        return [
            {
                "riskQuestionTag": "TOTAL_REVENUE",
                "operatorId": 5,
                "value": 100000,
                "currencyIsoCode": "USD",
                "activityCode": "CN"
            },
            {
                "riskQuestionTag": "TOTAL_REVENUE",
                "operatorId": 5,
                "value": 500000,
                "currencyIsoCode": "GBP",
                "activityCode": "CN"
            }
        ]
    }

    function getActivitiesRulesForCNandMG() {
        return [
            {
                "riskQuestionTag": "TOTAL_REVENUE",
                "operatorId": 5,
                "value": 100000,
                "currencyIsoCode": "USD",
                "activityCode": "CN"
            },
            {
                "riskQuestionTag": "TOTAL_REVENUE",
                "operatorId": 5,
                "value": 90000,
                "currencyIsoCode": "USD",
                "activityCode": "MG"
            },
            {
                "riskQuestionTag": "TOTAL_REVENUE",
                "operatorId": 5,
                "value": 500000,
                "currencyIsoCode": "GBP",
                "activityCode": "CN"
            }
        ]
    }

    function getQuoteSingleActivity() {
        return [
            {
                "percent": 100,
                "activityMaps": [
                    {
                        "activityMapId": 126,
                        "activityMasterId": 113,
                        "code": "CN",
                        "description": "Construction",
                        "productId": 0,
                        "parentActivityMapId": null,
                        "numberOfAvailableActivities": 15
                    }
                ]
            }
        ]
    }

    function getQuoteTwoActivities() {
        return [
            {
                "percent": 24,
                "activityMaps": [
                    {
                        "activityMapId": 126,
                        "activityMasterId": 113,
                        "code": "CN",
                        "description": "Construction",
                        "productId": 0,
                        "parentActivityMapId": null,
                        "numberOfAvailableActivities": 15
                    }
                ]
            },
            {
                "percent": 76,
                "activityMaps": [
                    {
                        "activityMapId": 126,
                        "activityMasterId": 113,
                        "code": "MG",
                        "description": "Mining",
                        "productId": 0,
                        "parentActivityMapId": null,
                        "numberOfAvailableActivities": 15
                    }
                ]
            }
        ]
    }

    @Injectable()
    class MockUserService {
        public getUser(): CfcContact {
            return getDefaultUser();
        }
    }
});
