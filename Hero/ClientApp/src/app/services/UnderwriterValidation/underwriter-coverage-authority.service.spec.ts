import { Injectable } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import {
    CfcContact,
    CoverageLimit,
    UnderwriterRole,
    UnderwriterRoleLimitValidationRule
} from "@app/models";
import { Currency } from "@app/models/auto-generated/Currency";
import { QuoteService } from "@app/quote/services/quote.service";
import { LimitRuleFilter } from "@app/quote/view-models/LimitRuleFilter";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UserService } from "@app/services/user.service";
import { getTestQuote } from "test-helpers";
import { Coverage } from "@app/models/auto-generated/Coverage";
import { CoverageType } from "@app/models/auto-generated/CoverageType";
import { CoverageExcess } from "@app/models/auto-generated/CoverageExcess";

describe("UnderwriterCoverageAuthorityService", () => {
    let underwriterCoverageAuthorityService: UnderwriterCoverageAuthorityService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: UserService,
                    useClass: MockUserService
                },
                { provide: QuoteService, useClass: MockQuoteService },
                UnderwriterCoverageAuthorityService
            ]
        }).compileComponents();
        underwriterCoverageAuthorityService = TestBed.inject(UnderwriterCoverageAuthorityService);
    }));

    it("should created UnderwriterCoverageAuthorityService", () => {
        expect(underwriterCoverageAuthorityService).toBeTruthy();
    });

    it("should set quote", () => {
        // Arrange
        const quote = getTestQuote();

        // Act
        underwriterCoverageAuthorityService.setQuote(quote);

        // Assert
        expect(underwriterCoverageAuthorityService["quote"]).toEqual(quote);
    });

    it("should return the Limit Rule Filter for the given parameters", () => {
        // Arrange
        const limitRuleFilter = getLimitRuleFilter("DO", "DOIM", "DOIMFC", "DOIMFCL1", "CAD");
        const canadaCurrency = { isoCode: "CAD", rate: 1 } as Currency;

        // Act
        const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleFilter("DO", "DOIM", "DOIMFC", "DOIMFCL1", canadaCurrency);

        // Assert
        expect(result).toBeDefined();
        expect(result).toEqual(limitRuleFilter);
    });

    it("should return the currency specific limit when there is a currency specific role for user", () => {
        // Arrange
        const limitRuleFilter = getLimitRuleFilter("DO", "DOIM", "DOIMFC", "DOIMFCL1", "CAD");

        // Act
        const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

        // Assert
        expect(result).toBeDefined();
        expect(result.maxLimit).toBe(50000);
        expect(result.currencyIsoCode).toBe("CAD");
    });

    it("should return GBP rule when there is no currency specific rule", () => {
        // Arrange
        const limitRuleFilter = getLimitRuleFilter("DO", "DOIM", "DOIMFC", "DOIMFCL1", "AUD");

        // Act
        const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

        // Assert
        expect(result).toBeDefined();
        expect(result.maxLimit).toBe(5000000);
        expect(result.currencyIsoCode).toBe("GBP");
    });

    it("should return no authority with no currency or GBP specific rules", () => {
        // Arrange
        const limitRuleFilter = getLimitRuleFilter("CR", "CRFI", "CRFIIT", "CRFIITL1", "NZD");

        // Act
        const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

        // Assert
        expect(result).toBeNull();
    });

    it("should return currency specific rule with smallest max limit when there are multiple currency specific rules", () => {
        // Arrange
        const limitRuleFilter = getLimitRuleFilter("EO", "EOFI", "EOFICL", "EOFICLL1", "CAD");

        // Act
        const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

        // Assert
        expect(result).toBeDefined();
        expect(result.maxLimit).toBe(60000);
        expect(result.currencyIsoCode).toBe("CAD");
    });

     it("should return GBP rule with smallest max limit when there are multiple GBP rules", () => {
         // Arrange
         const limitRuleFilter = getLimitRuleFilter("EO", "EOFI", "EOFICL", "EOFICLL1", "NZD");

         // Act
         const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

         // Assert
         expect(result).toBeDefined();
         expect(result.maxLimit).toBe(30000);
         expect(result.currencyIsoCode).toBe("GBP");
     });

     it("should return no authority with no limit rules", () => {
         // Arrange
         const limitRuleFilter = getLimitRuleFilter("CP", "CPCE", "CPCEBM", "CPCEBML1", "USD");

         // Act
         const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

         // Assert
         expect(result).toBeNull();
     });

     it("should convert GBP rule to quote currency when there is GBP rule and no currency specific rule", () => {
         // Arrange
         const limitRuleFilter = getLimitRuleFilter("DO", "DOIM", "DOIMFC", "DOIMFCL1", "AUD");
         limitRuleFilter.currency.rate = 1.3;
         const expectedValue = 5000000 * 1.3;

         // Act
         const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

         // Assert
         expect(result).toBeDefined();
         expect(result.maxLimit).toBe(expectedValue);
         expect(result.currencyIsoCode).toBe("GBP");
     });

     it("should not perform currency conversion when using currency specific rule", () => {
         // Arrange
         const limitRuleFilter = getLimitRuleFilter("DO", "DOIM", "DOIMFC", "DOIMFCL1", "CAD");
         limitRuleFilter.currency.rate = 1.5;

         // Act
         const result = underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitRuleFilter);

         // Assert
         expect(result).toBeDefined();
         expect(result.maxLimit).toBe(50000);
         expect(result.currencyIsoCode).toBe("CAD");
     });

    describe("check for valid coverage limit authority", () => {
        it("should give authority if no coverages are selected", () => {
            // Arrange
            var coverages: Coverage[] = [];

            // Act
            const result = underwriterCoverageAuthorityService.hasValidCoveragesLimitAuthority(coverages);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeTruthy();
        });

        it("should give authority if no child coverages are selected", () => {
            // Arrange
            var coverages: Coverage[] = [
                {
                    coverageType: new CoverageType(),
                    isExpanded: true,
                    childCoverages: [] as Coverage[],
                    limits: [] as CoverageLimit[],
                    excesses: [] as CoverageExcess[]
                }
            ];

            // Act
            const result = underwriterCoverageAuthorityService.hasValidCoveragesLimitAuthority(coverages);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeTruthy();
        });

        it("should give authority if all coverage limits are below the maximum limit", () => {
            // Arrange
            var coverages = getCoverages();

            // Act
            const result = underwriterCoverageAuthorityService.hasValidCoveragesLimitAuthority(coverages);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeTruthy();
        });

        it("should give authority for annual aggregate coverage limits", () => {
            // Arrange
            var coverages = getCoverages();
            coverages.map(
                coverage => coverage.childCoverages.map(
                    childCoverage => childCoverage.limits.map(
                        limit => {
                            if (childCoverage.coverageType.insuringClauseSectionCode.name === "CPIRFC") {
                                limit.limitBasis = 3;
                            }

                            return limit;
                        }
                    )
                )
            );

            // Act
            const result = underwriterCoverageAuthorityService.hasValidCoveragesLimitAuthority(coverages);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeTruthy();
        });

        it("should not give authority if any coverage limits is above the maximum limit", () => {
            // Arrange
            var coverages = getCoverages();
            coverages.map(
                coverage => coverage.childCoverages.map(
                    childCoverage => childCoverage.limits.map(
                        limit => {
                            if (childCoverage.coverageType.insuringClauseSectionCode.name === "CPIRFC") {
                                limit.limit = 3000000;
                            }

                            return limit;
                        }
                    )
                )
            );

            // Act
            const result = underwriterCoverageAuthorityService.hasValidCoveragesLimitAuthority(coverages);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeFalsy();
        });

        it("should not give authority if there is no matching rule", () => {
            // Arrange
            var coverages = getCoverages();
            coverages.map(
                coverage => coverage.childCoverages.map(
                    childCoverage => {
                        if (childCoverage.coverageType.insuringClauseSectionCode.name === "CPIRFC") {
                            childCoverage.coverageType.insuringClauseSectionCode.name = "TOMATO";
                        }

                        return childCoverage;
                    }
                )
            );

            // Act
            const result = underwriterCoverageAuthorityService.hasValidCoveragesLimitAuthority(coverages);

            // Assert
            expect(result).toBeDefined();
            expect(result).toBeFalsy();
        });
    });

    function getLimitRuleFilter(businessLine: string,
        insuringClauseCode: string,
        insuringClauseSectionCode: string,
        limitCode: string,
        currencyIsoCode: string): LimitRuleFilter {
        const limitRuleFilter = new LimitRuleFilter();
        limitRuleFilter.businessLineCode = businessLine;
        limitRuleFilter.insuringClauseCode = insuringClauseCode;
        limitRuleFilter.insuringClauseSectionCode = insuringClauseSectionCode;
        limitRuleFilter.limitTypeCode = limitCode;
        limitRuleFilter.currency = { isoCode: currencyIsoCode, rate: 1 } as Currency;
        return limitRuleFilter;
    }

    function getDefaultUser(): CfcContact {
        const user = new CfcContact();
        user.roles = [];
        user.roles[0] = new UnderwriterRole();
        user.roles[0].limitValidationRules = getUnderwriterRoleLimitValidationRule();
        return user;
    }

    function getUnderwriterRoleLimitValidationRule(): UnderwriterRoleLimitValidationRule[] {
        return [
            {
                businessLineCode: "DO",
                insuringClauseCode: "DOIM",
                insuringClauseSectionCode: "DOIMFC",
                limitTypeCode: null,
                minLimit: 25000,
                maxLimit: 750000.356,
                currencyIsoCode: "USD"
            },
            {
                businessLineCode: "DO",
                insuringClauseCode: "DOIM",
                insuringClauseSectionCode: "DOIMFC",
                limitTypeCode: "DOIMFCL1",
                minLimit: 3000,
                maxLimit: 5000000,
                currencyIsoCode: "GBP"
            },
            {
                businessLineCode: "DO",
                insuringClauseCode: "DOIM",
                insuringClauseSectionCode: null,
                limitTypeCode: null,
                minLimit: 1000,
                maxLimit: 50000,
                currencyIsoCode: "CAD"
            },
            {
                businessLineCode: "CR",
                insuringClauseCode: "CRFI",
                insuringClauseSectionCode: "CRFIIT",
                limitTypeCode: null,
                minLimit: 10000,
                maxLimit: 750000,
                currencyIsoCode: "USD"
            },
            {
                businessLineCode: "EO",
                insuringClauseCode: "EOFI",
                insuringClauseSectionCode: "EOFICL",
                limitTypeCode: "EOFICLL1",
                minLimit: 20000,
                maxLimit: 950000,
                currencyIsoCode: "CAD"
            },
            {
                businessLineCode: "EO",
                insuringClauseCode: "EOFI",
                insuringClauseSectionCode: null,
                limitTypeCode: null,
                minLimit: 20000,
                maxLimit: 60000,
                currencyIsoCode: "CAD"
            },
            {
                businessLineCode: "EO",
                insuringClauseCode: "EOFI",
                insuringClauseSectionCode: null,
                limitTypeCode: null,
                minLimit: 20000,
                maxLimit: 1000000,
                currencyIsoCode: "GBP"
            },
            {
                businessLineCode: "EO",
                insuringClauseCode: "EOFI",
                insuringClauseSectionCode: "EOFICL",
                limitTypeCode: null,
                minLimit: 20000,
                maxLimit: 30000,
                currencyIsoCode: "GBP"
            },
            {
                businessLineCode: "CP",
                insuringClauseCode: "CPIR",
                insuringClauseSectionCode: "CPIRFC",
                limitTypeCode: null,
                minLimit: 1,
                maxLimit: 2000000,
                currencyIsoCode: "GBP"
            },
            {
                businessLineCode: "CP",
                insuringClauseCode: "CPIR",
                insuringClauseSectionCode: "CPIRCC",
                limitTypeCode: null,
                minLimit: 1,
                maxLimit: 2000000,
                currencyIsoCode: "GBP"
            }
        ];
    }

    function getCoverages(): Coverage[] {
        return [
            {
                coverageType: {
                    id: 4331,
                    name: "IC 1: CYBER INCIDENT RESPONSE",
                    isMandatory: false,
                    isSelectedByDefault: true,
                    businessLine: {
                        name: "CP",
                        description: "Cyber & Privacy"
                    },
                    insuringClauseCode: {
                        name: "CPIR",
                        description: "CPIR"
                    },
                    insuringClauseSectionCode: null,
                    childCoverageTypes: [
                        {
                            id: 5308,
                            name: "SECTION C: IT SECURITY AND FORENSIC COSTS",
                            isMandatory: false,
                            isSelectedByDefault: true,
                            businessLine: {
                                name: "CP",
                                description: "Cyber & Privacy"
                            },
                            insuringClauseCode: {
                                name: "CPIR",
                                description: "CPIR"
                            },
                            insuringClauseSectionCode: {
                                name: "CPIRFC",
                                description: "CPIRFC"
                            },
                            childCoverageTypes: [],
                            limitTypes: [
                                {
                                    limitTypeId: 78087,
                                    limitTypeCode: "CPIRFCL1",
                                    order: 1,
                                    followLimitTypeId: 78085,
                                    limitFollowMultiplicationFactor: 1,
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultLimit: 1000000,
                                    defaultLimitBasis: 1,
                                    defaultCostBasis: 6,
                                    subLimitCap: null,
                                    cap: null,
                                    availableLimitBasis: {
                                        1: "Any one claim",
                                        2: "Maximum per day",
                                        3: "Annual Aggregate"
                                    },
                                    availableCostBasis: {
                                        6: "Not Applicable"
                                    },
                                    followLimitCodes: ["XX"]
                                }
                            ],
                            excessTypes: [
                                {
                                    coverageExcessTypeId: 66417,
                                    excessTypeCode: "CPIRFCD1",
                                    order: 1,
                                    followExcessTypeId: 66416,
                                    excessFollowMultiplicationFactor: 1,
                                    description: "Deductible",
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultExcess: 2500,
                                    defaultExcessBasis: 3,
                                    availableExcessBasis: {
                                        3: "Not Applicable"
                                    },
                                    followExcessCodes: ["XX"]
                                }
                            ],
                            isAdditionalCoverage: false,
                            additionalCoverageCategories: [],
                            order: 3
                        },
                        {
                            id: 5309,
                            name: "SECTION D: CRISIS COMMUNICATION COSTS",
                            isMandatory: false,
                            isSelectedByDefault: true,
                            businessLine: {
                                name: "CP",
                                description: "Cyber & Privacy"
                            },
                            insuringClauseCode: {
                                name: "CPIR",
                                description: "CPIR"
                            },
                            insuringClauseSectionCode: {
                                name: "CPIRCC",
                                description: "CPIRCC"
                            },
                            childCoverageTypes: [],
                            limitTypes: [
                                {
                                    limitTypeId: 78088,
                                    limitTypeCode: "CPIRCCL1",
                                    order: 1,
                                    followLimitTypeId: 78085,
                                    limitFollowMultiplicationFactor: 1,
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultLimit: 1000000,
                                    defaultLimitBasis: 1,
                                    defaultCostBasis: 6,
                                    subLimitCap: null,
                                    cap: null,
                                    availableLimitBasis: {
                                        1: "Any one claim",
                                        2: "Maximum per day",
                                        3: "Annual Aggregate"
                                    },
                                    availableCostBasis: {
                                        6: "Not Applicable"
                                    },
                                    followLimitCodes: ["XX"]
                                }
                            ],
                            excessTypes: [
                                {
                                    coverageExcessTypeId: 66418,
                                    excessTypeCode: "CPIRCCD1",
                                    order: 1,
                                    followExcessTypeId: 66416,
                                    excessFollowMultiplicationFactor: 1,
                                    description: "Deductible",
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultExcess: 2500,
                                    defaultExcessBasis: 3,
                                    availableExcessBasis: {
                                        3: "Not Applicable"
                                    },
                                    followExcessCodes: ["XX"]
                                }
                            ],
                            isAdditionalCoverage: false,
                            additionalCoverageCategories: [],
                            order: 4
                        }
                    ],
                    limitTypes: [],
                    excessTypes: [],
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: [],
                    order: 1
                },
                isExpanded: true,
                childCoverages: [
                    {
                        coverageType: {
                            id: 5308,
                            name: "SECTION C: IT SECURITY AND FORENSIC COSTS",
                            isMandatory: false,
                            isSelectedByDefault: true,
                            businessLine: {
                                name: "CP",
                                description: "Cyber & Privacy"
                            },
                            insuringClauseCode: {
                                name: "CPIR",
                                description: "CPIR"
                            },
                            insuringClauseSectionCode: {
                                name: "CPIRFC",
                                description: "CPIRFC"
                            },
                            childCoverageTypes: [],
                            limitTypes: [
                                {
                                    limitTypeId: 78087,
                                    limitTypeCode: "CPIRFCL1",
                                    order: 1,
                                    followLimitTypeId: 78085,
                                    limitFollowMultiplicationFactor: 1,
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultLimit: 1000000,
                                    defaultLimitBasis: 1,
                                    defaultCostBasis: 6,
                                    subLimitCap: null,
                                    cap: null,
                                    availableLimitBasis: {
                                        1: "Any one claim",
                                        2: "Maximum per day",
                                        3: "Annual Aggregate"
                                    },
                                    availableCostBasis: {
                                        6: "Not Applicable"
                                    },
                                    followLimitCodes: ["XX"]
                                }
                            ],
                            excessTypes: [
                                {
                                    coverageExcessTypeId: 66417,
                                    excessTypeCode: "CPIRFCD1",
                                    order: 1,
                                    followExcessTypeId: 66416,
                                    excessFollowMultiplicationFactor: 1,
                                    description: "Deductible",
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultExcess: 2500,
                                    defaultExcessBasis: 3,
                                    availableExcessBasis: {
                                        3: "Not Applicable"
                                    },
                                    followExcessCodes: ["XX"]
                                }
                            ],
                            isAdditionalCoverage: false,
                            additionalCoverageCategories: [],
                            order: 3
                        },
                        isExpanded: true,
                        childCoverages: [],
                        limits: [
                            {
                                limitTypeId: 78087,
                                limit: 1000000,
                                limitBasis: 1,
                                costBasis: 6,
                                subLimitCap: null,
                                coverageLimitType: {
                                    limitTypeId: 78087,
                                    limitTypeCode: "CPIRFCL1",
                                    order: 1,
                                    followLimitTypeId: 78085,
                                    limitFollowMultiplicationFactor: 1,
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultLimit: 1000000,
                                    defaultLimitBasis: 1,
                                    defaultCostBasis: 6,
                                    subLimitCap: null,
                                    cap: null,
                                    availableLimitBasis: {
                                        1: "Any one claim",
                                        2: "Maximum per day",
                                        3: "Annual Aggregate"
                                    },
                                    availableCostBasis: {
                                        6: "Not Applicable"
                                    },
                                    followLimitCodes: ["XX"]
                                }
                            }
                        ],
                        excesses: [
                            {
                                coverageExcessTypeId: 66417,
                                excess: 2500,
                                excessBasisId: 3,
                                excessType: {
                                    coverageExcessTypeId: 66417,
                                    excessTypeCode: "CPIRFCD1",
                                    order: 1,
                                    followExcessTypeId: 66416,
                                    excessFollowMultiplicationFactor: 1,
                                    description: "Deductible",
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultExcess: 2500,
                                    defaultExcessBasis: 3,
                                    availableExcessBasis: {
                                        3: "Not Applicable"
                                    },
                                    followExcessCodes: ["XX"]
                                }
                            }
                        ]
                    },
                    {
                        coverageType: {
                            id: 5309,
                            name: "SECTION D: CRISIS COMMUNICATION COSTS",
                            isMandatory: false,
                            isSelectedByDefault: true,
                            businessLine: {
                                name: "CP",
                                description: "Cyber & Privacy"
                            },
                            insuringClauseCode: {
                                name: "CPIR",
                                description: "CPIR"
                            },
                            insuringClauseSectionCode: {
                                name: "CPIRCC",
                                description: "CPIRCC"
                            },
                            childCoverageTypes: [],
                            limitTypes: [
                                {
                                    limitTypeId: 78088,
                                    limitTypeCode: "CPIRCCL1",
                                    order: 1,
                                    followLimitTypeId: 78085,
                                    limitFollowMultiplicationFactor: 1,
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultLimit: 1000000,
                                    defaultLimitBasis: 1,
                                    defaultCostBasis: 6,
                                    subLimitCap: null,
                                    cap: null,
                                    availableLimitBasis: {
                                        1: "Any one claim",
                                        2: "Maximum per day",
                                        3: "Annual Aggregate"
                                    },
                                    availableCostBasis: {
                                        6: "Not Applicable"
                                    },
                                    followLimitCodes: ["XX"]
                                }
                            ],
                            excessTypes: [
                                {
                                    coverageExcessTypeId: 66418,
                                    excessTypeCode: "CPIRCCD1",
                                    order: 1,
                                    followExcessTypeId: 66416,
                                    excessFollowMultiplicationFactor: 1,
                                    description: "Deductible",
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultExcess: 2500,
                                    defaultExcessBasis: 3,
                                    availableExcessBasis: {
                                        3: "Not Applicable"
                                    },
                                    followExcessCodes: ["XX"]
                                }
                            ],
                            isAdditionalCoverage: false,
                            additionalCoverageCategories: [],
                            order: 4
                        },
                        isExpanded: true,
                        childCoverages: [],
                        limits: [
                            {
                                limitTypeId: 78088,
                                limit: 1000000,
                                limitBasis: 1,
                                costBasis: 6,
                                subLimitCap: null,
                                coverageLimitType: {
                                    limitTypeId: 78088,
                                    limitTypeCode: "CPIRCCL1",
                                    order: 1,
                                    followLimitTypeId: 78085,
                                    limitFollowMultiplicationFactor: 1,
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultLimit: 1000000,
                                    defaultLimitBasis: 1,
                                    defaultCostBasis: 6,
                                    subLimitCap: null,
                                    cap: null,
                                    availableLimitBasis: {
                                        1: "Any one claim",
                                        2: "Maximum per day",
                                        3: "Annual Aggregate"
                                    },
                                    availableCostBasis: {
                                        6: "Not Applicable"
                                    },
                                    followLimitCodes: ["XX"]
                                }
                            }
                        ],
                        excesses: [
                            {
                                coverageExcessTypeId: 66418,
                                excess: 2500,
                                excessBasisId: 3,
                                excessType: {
                                    coverageExcessTypeId: 66418,
                                    excessTypeCode: "CPIRCCD1",
                                    order: 1,
                                    followExcessTypeId: 66416,
                                    excessFollowMultiplicationFactor: 1,
                                    description: "Deductible",
                                    isReadOnly: false,
                                    isHidden: true,
                                    isMandatory: false,
                                    defaultExcess: 2500,
                                    defaultExcessBasis: 3,
                                    availableExcessBasis: {
                                        3: "Not Applicable"
                                    },
                                    followExcessCodes: ["XX"]
                                }
                            }
                        ]
                    }
                ],
                limits: [],
                excesses: []
            }
        ];
    }

    @Injectable()
    class MockUserService {
        public getUser(): CfcContact {
            return getDefaultUser();
        }
    }

    @Injectable()
    class MockQuoteService {
        public getCurrency(): Currency {
            return { isoCode: "USD", rate: 1 } as Currency;
        }
    }
});
