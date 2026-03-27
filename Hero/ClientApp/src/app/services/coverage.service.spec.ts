import { TestBed, waitForAsync } from "@angular/core/testing";
import {
    Coverage, Product
} from "@app/models";
import { MultiplePropertyBusinessLines } from '@app/quote/models/MultiplePropertyBusinessLines';
import { CoverageService } from "@app/services/coverage.service";
import { CoverageModelTestUtilities } from "@app/test/coverage-model.testutil";
import { CoverageHttpService } from './coverage-http.service';
import { of } from 'rxjs';

describe("CoverageService", () => {

    let coverageService: CoverageService;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [CoverageService, { provide: CoverageHttpService, useValue: MockCoverageHttpService }],
        });
        coverageService = TestBed.inject(CoverageService);
    }));

    it("Should be created", () => {
        expect(coverageService).toBeTruthy();
    });

    it("Should return coverage index depending on coverage type insuring clause code", () => {
        // Actors
        const coverages = CoverageModelTestUtilities.getTestCoverageList();

        // Actions
        const result1 = coverageService.getSelectedCoverageIndex(coverages, "DOCRFT", false);
        const result2 = coverageService.getSelectedCoverageIndex(coverages, "CP", false);
        const result3 = coverageService.getSelectedCoverageIndex(coverages, "KR", false);

        // Asserts
        expect(result1).toBe(2);
        expect(result2).toBe(1);
        expect(result3).toBe(4);
    });

    it("Should return -1 when the coverage index is not found", () => {
        // Actors
        const coverages = CoverageModelTestUtilities.getTestCoverageList();

        // Actions
        const result = coverageService.getSelectedCoverageIndex(coverages, "XX", false);

        // Asserts
        expect(result).toBeDefined();
        expect(result).toBe(-1);
    });

    it("Should return coverage depending on coverage type from top of the hierarchy", () => {
        // Actors
        const coverages = CoverageModelTestUtilities.getTestCoverageList();

        // Actions
        const result1 = coverageService.getSelectedCoverage(coverages, coverages[2].coverageType, false);
        const result2 = coverageService.getSelectedCoverage(coverages, coverages[3].coverageType, false);
        const result3 = coverageService.getSelectedCoverage(coverages, coverages[4].coverageType, false);

        // Asserts
        expect(result1).toBeDefined();
        expect(result1.coverageType).toBeDefined();
        expect(result1.coverageType.name).toBe("Directors & Officers");
        expect(result2).toBeDefined();
        expect(result2.coverageType).toBeDefined();
        expect(result2.coverageType.name).toBe("Crime");
        expect(result3).toBeDefined();
        expect(result3.coverageType).toBeDefined();
        expect(result3.coverageType.name).toBe("Kidnap & Ransom");
    });

    it("Should return coverage depending on coverage type from child coverage items", () => {
        // Actors
        const coverages = CoverageModelTestUtilities.getTestCoverageList();

        // Actions
        const result1 = coverageService.getSelectedCoverage(coverages, coverages[2].childCoverages[0].coverageType, true);
        const result2 = coverageService.getSelectedCoverage(coverages, coverages[2].childCoverages[1].coverageType, true);

        // Asserts
        expect(result1).toBeDefined();
        expect(result1.coverageType).toBeDefined();
        expect(result1.coverageType.name).toBe("Child Test1");
        expect(result2).toBeDefined();
        expect(result2.coverageType).toBeDefined();
        expect(result2.coverageType.name).toBe("Child Test2");
    });

    it("Should only return child coverage from parent coverage items with children (e.g.: TRIA is a parent without child coverages)", ()=> {
            // Actors
            var coverages = [
                {
                    coverageType: {
                        id: 7,
                        name: "TRIA",
                        limitTypes: []
                    },
                    limits: [],
                    excesses: [],
                    childCoverages: null
                }
            ] as Coverage[];
            coverages = coverages.concat(CoverageModelTestUtilities.getTestCoverageList());

            // Actions
            const result1 = coverageService.getSelectedCoverage(coverages, coverages[3].childCoverages[0].coverageType, true);
            const result2 = coverageService.getSelectedCoverage(coverages, coverages[3].childCoverages[1].coverageType, true);

            // Asserts
            expect(result1).toBeDefined();
            expect(result1.coverageType).toBeDefined();
            expect(result1.coverageType.name).toBe("Child Test1");
            expect(result2).toBeDefined();
            expect(result2.coverageType).toBeDefined();
            expect(result2.coverageType.name).toBe("Child Test2");
        });

    it("Should return null when the coverage is not found", () => {
        // Actors
        const coverages = CoverageModelTestUtilities.getTestCoverageList();
        var coverage =
            {
                coverageType: {
                    id: 7,
                    name: "TEST",
                    limitTypes: [],
                    insuringClauseCode: { name: "ABC", description: "" }
                },
                limits: [],
                excesses: [],
                childCoverages: null
            } as Coverage;

        // Actions
        const result = coverageService.getSelectedCoverage(coverages, coverage.coverageType, false);

        // Asserts
        expect(result).toBeNull();
    });

    it("Should filter out coverages whose coverage types are not in the provided list when wording version was not changed", () => {
        // Actors
        const coverages = CoverageModelTestUtilities.getTestCoverageList();
        const testCoverageTypes = [
            CoverageModelTestUtilities.getTestCoverageTypes()[0],
            CoverageModelTestUtilities.getTestCoverageTypes()[1],
            CoverageModelTestUtilities.getTestCoverageTypes()[2],
            CoverageModelTestUtilities.getTestCoverageTypes()[3]
        ];

        // Actions
        const availableCoverages = coverageService.getAvailableSelectedCoverages(coverages, testCoverageTypes, false);

        // Asserts
        expect(availableCoverages).toBeDefined();
        expect(coverages.length).toBe(5);
        expect(availableCoverages.length).toBe(5);
        expect(availableCoverages[2].coverageType).toBeDefined();
        expect(availableCoverages[2].coverageType.name).toBe("Directors & Officers");
    });

    it("Should return empty array of selected coverages after wording version was changed", () => {
        // Actors
        const coverages = CoverageModelTestUtilities.getTestCoverageList();
        const testCoverageTypes = [
            CoverageModelTestUtilities.getTestCoverageTypes()[0],
            CoverageModelTestUtilities.getTestCoverageTypes()[1],
            CoverageModelTestUtilities.getTestCoverageTypes()[2],
            CoverageModelTestUtilities.getTestCoverageTypes()[3]
        ];

        // Actions
        const availableCoverages = coverageService.getAvailableSelectedCoverages(coverages, testCoverageTypes, true);

        // Asserts
        expect(availableCoverages).toBeDefined();
        expect(availableCoverages.length).toBe(0);
    });

    describe("retrieve coverages by business line code", () => {
        it("should return a list of coverages matching the given business line code", () => {
            // Arrange
            const coverage = mockPropertyCoverage;

            // Act
            const propertyDamageLimit = coverageService.getCoveragesByCode([coverage], "MD");

            // Assert
            expect(propertyDamageLimit).toBeDefined();
            expect(propertyDamageLimit).toEqual([coverage]);
            expect(propertyDamageLimit.length).toBe(1);
        });

        it("should return an empty list if the given business line code is not found", () => {
            // Arrange
            const coverage = mockPropertyCoverage;

            // Act
            const propertyDamageLimit = coverageService.getCoveragesByCode([coverage], "TO");

            // Assert
            expect(propertyDamageLimit.length).toBe(0);
        });
    });

    describe("retrieve insuring clause section by code", () => {
        it("should return the limit value for a matching insuring clause section code", () => {
            // Arrange
            const coverage = mockPropertyCoverage;

            // Act
            const propertyDamageLimit = coverageService.getInsuringClauseSectionLimitByCode(coverage, "MDCPPDL1");

            // Assert
            expect(propertyDamageLimit).toBeDefined();
            expect(propertyDamageLimit).toBe(159263);
        });

        it("should return no code if no matching insuring clause section code is found", () => {
            // Arrange
            const coverage = mockPropertyCoverage;

            // Act
            const propertyDamageLimit = coverageService.getInsuringClauseSectionLimitByCode(coverage, "TOMATO");

            // Assert
            expect(propertyDamageLimit).toBeNull();
        });

        it("should return the insuring clause section limit name for a matching code", () => {
            // Arrange
            const coverage = mockPropertyCoverage;

            // Act
            const propertyDamageLimit = coverageService.getInsuringClauseSectionLimitNameByCode([coverage], "MDCPPDL1");

            // Assert
            expect(propertyDamageLimit).toBeDefined();
            expect(propertyDamageLimit).toBe("SECTION A: PROPERTY DAMAGE");
        });

        it("should return no name if no matching insuring clause section code is found", () => {
            // Arrange
            const coverage = mockPropertyCoverage;

            // Act
            const propertyDamageLimit = coverageService.getInsuringClauseSectionLimitNameByCode([coverage], "TOMATO");

            // Assert
            expect(propertyDamageLimit).toBeNull();
        });
    });

    describe("check if product is defined as multiple property business line product",()=>{

        it("should return true for a matching product ",() => {
            // Act
            coverageService.isMultiplePropertyBusinessLineProduct("MD", "T&S").subscribe(result=>{
                expect(result).toBe(true);
            })
        });

        it("should return false for a none matching product ",() => {
            // Act
            coverageService.isMultiplePropertyBusinessLineProduct("MD", "XXX").subscribe(result=>{
                 expect(result).toBe(false);
            })
        });

    });

    describe("getMultiplePropertiesBusinessLine()",()=>{

        it("should set value for matched product",() => {
            // Arrange
            coverageService.isMultiplePropertyBusinessLineProduct("MD", "T&S").subscribe(result =>{
                // Act
                let businessLine = coverageService.getMultiplePropertiesBusinessLine();
                // Assert
                expect(businessLine).toBe("MD");
            })
        });

        it("should NOT set value for mismatched business line or product",() => {
            // Act
            coverageService.isMultiplePropertyBusinessLineProduct("GL", "XXX").subscribe(result=>{
                // Act
                let businessLine = coverageService.getMultiplePropertiesBusinessLine();
                // Assert
                expect(businessLine).not.toBe("GL");
            })
        });

    });
});


const mockPropertyCoverage = 	{
    "coverageType": {
        "id": 8856,
        "name": "IC 9: COMMERCIAL PROPERTY",
        "isMandatory": false,
        "isSelectedByDefault": false,
        "businessLine": {
            "name": "MD",
            "description": "Property and Business Interruption"
        },
        "insuringClauseCode": {
            "name": "MDCP",
            "description": "MDCP"
        },
        "insuringClauseSectionCode": null,
        "childCoverageTypes": [],
        "limitTypes": [],
        "excessTypes": [],
        "isAdditionalCoverage": false,
        "additionalCoverageCategories": [],
        "order": 9
    },
    "isExpanded": true,
    "childCoverages": [
        {
            "coverageType": {
                "id": 7656,
                "name": "SECTION A: PROPERTY DAMAGE",
                "isMandatory": false,
                "isSelectedByDefault": false,
                "businessLine": {
                    "name": "MD",
                    "description": "Property and Business Interruption"
                },
                "insuringClauseCode": {
                    "name": "MDCP",
                    "description": "MDCP"
                },
                "insuringClauseSectionCode": {
                    "name": "MDCPPD",
                    "description": "MDCPPD"
                },
                "childCoverageTypes": [],
                "limitTypes": [
                    {
                        "limitTypeId": 111494,
                        "limitTypeCode": "MDCPPDL1",
                        "order": 1,
                        "followLimitTypeId": null,
                        "limitFollowMultiplicationFactor": 1,
                        "isReadOnly": false,
                        "isHidden": false,
                        "isMandatory": false,
                        "defaultLimit": 0,
                        "defaultLimitBasis": 4,
                        "defaultCostBasis": 13,
                        "subLimitCap": null,
                        "cap": null,
                        "availableLimitBasis": {
                            "4": "Annual Aggregate"
                        },
                        "availableCostBasis": {
                            "13": "Not Applicable"
                        },
                        "followLimitCodes":
                            ["XX"]
                    }
                ],
                "excessTypes": [
                    {
                        "coverageExcessTypeId": 92267,
                        "excessTypeCode": "MDCPPDD1",
                        "order": 1,
                        "followExcessTypeId": null,
                        "excessFollowMultiplicationFactor": 1,
                        "description": "Deductible",
                        "isReadOnly": false,
                        "isHidden": false,
                        "isMandatory": false,
                        "defaultExcess": 500,
                        "defaultExcessBasis": 3,
                        "availableExcessBasis": {
                            "3": "Not Applicable"
                        },
                        "followExcessCodes":
                            ["XX"]
                    }
                ],
                "isAdditionalCoverage": false,
                "additionalCoverageCategories": [],
                "order": 1
            },
            "isExpanded": false,
            "childCoverages": [],
            "limits": [
                {
                    "limitTypeId": 111494,
                    "limit": 159263,
                    "limitBasis": 4,
                    "costBasis": 13,
                    "subLimitCap": null,
                    "coverageLimitType": {
                        "limitTypeId": 111494,
                        "limitTypeCode": "MDCPPDL1",
                        "order": 1,
                        "followLimitTypeId": null,
                        "limitFollowMultiplicationFactor": 1,
                        "isReadOnly": false,
                        "isHidden": false,
                        "isMandatory": false,
                        "defaultLimit": 0,
                        "defaultLimitBasis": 4,
                        "defaultCostBasis": 13,
                        "subLimitCap": null,
                        "cap": null,
                        "availableLimitBasis": {
                            "4": "Annual Aggregate"
                        },
                        "availableCostBasis": {
                            "13": "Not Applicable"
                        },
                        "followLimitCodes":
                            ["XX"]
                    }
                }
            ],
            "excesses": [
                {
                    "coverageExcessTypeId": 92267,
                    "excess": 500,
                    "excessBasisId": 3,
                    "excessType": {
                        "coverageExcessTypeId": 92267,
                        "excessTypeCode": "MDCPPDD1",
                        "order": 1,
                        "followExcessTypeId": null,
                        "excessFollowMultiplicationFactor": 1,
                        "description": "Deductible",
                        "isReadOnly": false,
                        "isHidden": false,
                        "isMandatory": false,
                        "defaultExcess": 500,
                        "defaultExcessBasis": 3,
                        "availableExcessBasis": {
                            "3": "Not Applicable"
                        },
                        "followExcessCodes":
                            ["XX"]
                    }
                }
            ]
        }
    ],
    "limits": [],
    "excesses": []
}

const mockBusinessLines: MultiplePropertyBusinessLines = {

    businessLine: "MD",
    products: [
        {
            productName: "T&S",
            productId: 1,
            productUid: "1",
            productDisplay: "T&S",
        } as Product,
    ],
}

export const MockCoverageHttpService = {
    getMultiplePropertyBusinessLineProducts: jasmine.createSpy().and.returnValue(of(mockBusinessLines))
};


