/* tslint:disable:max-classes-per-file */

import { TestBed } from "@angular/core/testing";
import { ClientLocation, Coverage, CoverageType } from "@app/models";
import { QuoteService } from "@app/quote/services/quote.service";
import { CoverageService } from "@app/services/coverage.service";
import { getTestQuote } from "test-helpers";
import { PropertyLimitsValidator } from "./property-limits-validator";
import { CoverageHttpService } from '@app/services/coverage-http.service';

describe("PropertyLimitsValidator", () => {
    let propertyLimitsValidator: PropertyLimitsValidator;
    let coverageService: CoverageService;
    let mockQuoteService: QuoteService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PropertyLimitsValidator,
                CoverageService,
                {
                    provide: QuoteService,
                    useClass: MockQuoteService,
                },
                {
                    provide: CoverageHttpService,
                    useClass: MockCoverageHttpService,
                },
            ],
        });

        propertyLimitsValidator = TestBed.inject(PropertyLimitsValidator);
        coverageService = TestBed.inject(CoverageService);
        mockQuoteService = TestBed.inject(QuoteService);
    });

    it("should create validator", () => {
        expect(propertyLimitsValidator).toBeTruthy();
    });

    describe("validate diverging property limits - coverage x multiple property", () => {
        it("should validate diverging limits for property coverages when the property coverage has not been selected and limits have been added to the multiple property modal", () => {
            // Arrange
            const quoteWithDivergingPropertyCoverageLimits = {...getTestQuote(), coverages: [], propertyLimits: mockPropertyCoverageLimits};
            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(quoteWithDivergingPropertyCoverageLimits);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(mockQuoteService.getQuoteReference().coverages).toEqual([]);
            expect(propertyCoverageLimits.isMatch).toEqual(false);
            expect(propertyCoverageLimits.DivergingLimits).toEqual(["Missing Limits, make sure the property coverage has been selected"]);
        });

        it("should validate diverging limits for property coverages and return the Property Damage name as the diverging limit when multiple properties are inserted", () => {
            // Arrange
            const mockDivergingPropertyCoverageLimits = mockPropertyCoverageLimits();
            mockDivergingPropertyCoverageLimits[0].propertyDamageLimit = defaultPropertyDamageLimit + 100;

            const quoteWithDivergingPropertyCoverageLimits = {...getTestQuote(), coverages: mockPropertyCoverage, propertyLimits: mockDivergingPropertyCoverageLimits};

            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(quoteWithDivergingPropertyCoverageLimits);
            spyOn(coverageService, "getCoveragesByCode").and.returnValue(mockPropertyCoverage);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(propertyCoverageLimits.isMatch).toEqual(false);
            expect(propertyCoverageLimits.DivergingLimits).toEqual(["SECTION A: PROPERTY DAMAGE"]);
        });

        it("should validate diverging limits for property coverages and return the Property Damage and Gross Rentals names as the diverging limit when multiple properties are inserted", () => {
            // Arrange
            const mockDivergingPropertyCoverageLimits = mockPropertyCoverageLimits();
            mockDivergingPropertyCoverageLimits[0].propertyDamageLimit = defaultPropertyDamageLimit + 100;
            mockDivergingPropertyCoverageLimits[0].grossRentalLimit = defaultGrossRentalLimit + 100;

            const mockQuoteWithDivergingPropertyCoverageLimits = {...getTestQuote(), coverages: mockPropertyCoverage, propertyLimits: mockDivergingPropertyCoverageLimits};

            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(mockQuoteWithDivergingPropertyCoverageLimits);
            spyOn(coverageService, "getCoveragesByCode").and.returnValue(mockPropertyCoverage);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(propertyCoverageLimits.isMatch).toEqual(false);
            expect(propertyCoverageLimits.DivergingLimits).toEqual(["SECTION A: PROPERTY DAMAGE", "SECTION C: GROSS RENTALS"]);
        });

        it("should validate diverging limits for property coverages and return the Property Damage name as the diverging limit when one property is inserted as Endorsement", () => {
            // Arrange
            const mockDivergingPropertyCoverageLimits = [mockPropertyCoverageLimits()[0]];

            mockDivergingPropertyCoverageLimits[0].propertyDamageLimit = defaultPropertyDamageLimit;
            mockDivergingPropertyCoverageLimits[0].contentsDamageLimit = defaultContentsDamageLimit - 100;
            mockDivergingPropertyCoverageLimits[0].stockDamageLimit = defaultStockDamageLimit;
            mockDivergingPropertyCoverageLimits[0].grossRentalLimit = defaultGrossRentalLimit;
            mockDivergingPropertyCoverageLimits[0].actualLossSustainedLimit = defaultActualLossSustainedLimit;
            mockDivergingPropertyCoverageLimits[0].additionalIncreasedCostOfWorkingLimit = defaultAdditionalIncreasedCostOfWorkingLimit;

            const mockDivergingPropertyLimitsQuote = {...getTestQuote(), coverages: mockPropertyCoverage, propertyLimits: mockDivergingPropertyCoverageLimits};

            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(mockDivergingPropertyLimitsQuote);
            spyOn(coverageService, "getCoveragesByCode").and.returnValue(mockPropertyCoverage);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(propertyCoverageLimits.isMatch).toEqual(false);
            expect(propertyCoverageLimits.DivergingLimits).toEqual(["SECTION B: GENERAL CONTENTS DAMAGE"]);
        });
    });

    describe("do not validate matching property limits - coverage x multiple property", () => {
        it("should not validate matching limits for property coverages", () => {
            // Arrange
            const mockPropertyLimitsQuote = {...getTestQuote(), coverages: mockPropertyCoverage, propertyLimits: mockPropertyCoverageLimits()};

            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(mockPropertyLimitsQuote);
            spyOn(coverageService, "getCoveragesByCode").and.returnValue(mockPropertyCoverage);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(propertyCoverageLimits.isMatch).toEqual(true);
        });

        it("should not validate matching limits for property coverages when summing up additionalIncreasedCostOfWorkingLimit and actualLossSustainedLimit", () => {
            // Arrange
            const mockMatchingPropertyCoverageLimits = mockPropertyCoverageLimits();
            mockMatchingPropertyCoverageLimits[0].actualLossSustainedLimit = 200;
            mockMatchingPropertyCoverageLimits[0].additionalIncreasedCostOfWorkingLimit = 100;

            const mockPropertyLimitsQuote = {...getTestQuote(), coverages: mockPropertyCoverage, propertyLimits: mockMatchingPropertyCoverageLimits};

            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(mockPropertyLimitsQuote);
            spyOn(coverageService, "getCoveragesByCode").and.returnValue(mockPropertyCoverage);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(propertyCoverageLimits.isMatch).toEqual(true);
        });

        it("should not validate matching limits for property coverages when there's no additionalIncreasedCostOfWorkingLimit added in", () => {
            // Arrange
            const mockMatchingPropertyCoverageLimits = mockPropertyCoverageLimits();
            mockMatchingPropertyCoverageLimits[0].additionalIncreasedCostOfWorkingLimit = undefined;
            mockMatchingPropertyCoverageLimits[1].additionalIncreasedCostOfWorkingLimit = undefined;

            const mockPropertyLimitsQuote = {...getTestQuote(), coverages: mockPropertyCoverage, propertyLimits: mockMatchingPropertyCoverageLimits};

            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(mockPropertyLimitsQuote);
            spyOn(coverageService, "getCoveragesByCode").and.returnValue(mockPropertyCoverage);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(propertyCoverageLimits.isMatch).toEqual(true);
        });

        it("should not validate matching limits for property coverages when there's no additionalIncreasedCostOfWorkingLimit added in the first property but there is in the second one", () => {
            // Arrange
            const mockMatchingPropertyCoverageLimits = mockPropertyCoverageLimits();
            mockMatchingPropertyCoverageLimits[0].additionalIncreasedCostOfWorkingLimit = undefined;
            mockMatchingPropertyCoverageLimits[1].actualLossSustainedLimit = 200;
            mockMatchingPropertyCoverageLimits[1].additionalIncreasedCostOfWorkingLimit = 100;

            const mockPropertyLimitsQuote = {...getTestQuote(), coverages: mockPropertyCoverage, propertyLimits: mockMatchingPropertyCoverageLimits};

            spyOn(mockQuoteService, "getQuoteReference").and.returnValue(mockPropertyLimitsQuote);
            spyOn(coverageService, "getCoveragesByCode").and.returnValue(mockPropertyCoverage);

            // Act
            const propertyCoverageLimits = propertyLimitsValidator.validateMatchingLimits();

            // Assert
            expect(propertyCoverageLimits.isMatch).toEqual(true);
        });
    });
});

export class MockQuoteService {
    getQuoteReference = () => getTestQuote();
}

const defaultPropertyDamageLimit = 100;
const defaultContentsDamageLimit = 200;
const defaultStockDamageLimit = 400;
const defaultActualLossSustainedLimit = 600;
const defaultGrossRentalLimit = 800;
const defaultAdditionalIncreasedCostOfWorkingLimit = 0;


function mockPropertyCoverageLimits(){
    return [
        {
            contentsDamageLimit: defaultContentsDamageLimit / 2,
            stockDamageLimit: defaultStockDamageLimit / 2,
            actualLossSustainedLimit: defaultActualLossSustainedLimit / 2,
            grossRentalLimit: defaultGrossRentalLimit / 2,
            insuredAddress: new ClientLocation(),
            additionalIncreasedCostOfWorkingLimit: defaultAdditionalIncreasedCostOfWorkingLimit / 2,
            propertyDamageLimit: defaultPropertyDamageLimit / 2,
        },
        {
            contentsDamageLimit: defaultContentsDamageLimit / 2,
            stockDamageLimit: defaultStockDamageLimit / 2,
            actualLossSustainedLimit: defaultActualLossSustainedLimit / 2,
            grossRentalLimit: defaultGrossRentalLimit / 2,
            insuredAddress: new ClientLocation(),
            additionalIncreasedCostOfWorkingLimit: defaultAdditionalIncreasedCostOfWorkingLimit / 2,
            propertyDamageLimit: defaultPropertyDamageLimit / 2,
        },
    ];
}


function createCoverageType(id, name, insuringClauseCode): CoverageType  {
    return {
        id: id,
        name: name,
        isMandatory: false,
        isSelectedByDefault: false,
        businessLine: {
            name: "MD",
            description: "Property and Business Interruption",
        },
        insuringClauseCode: {
            name: insuringClauseCode,
            description: insuringClauseCode,
        },
        insuringClauseSectionCode: null,
        childCoverageTypes: [],
        limitTypes: [],
        excessTypes: [],
        isAdditionalCoverage: false,
        additionalCoverageCategories: [],
        order: 9,
    };
}

function createLimit(limit: number, limitTypeCode: string){
    return {
        limitTypeId: 111494,
        limit: limit,
        limitBasis: 4,
        costBasis: 13,
        subLimitCap: null,
        coverageLimitType: {
            limitTypeId: 111494,
            limitTypeCode: limitTypeCode,
            order: 1,
            followLimitTypeId: null,
            limitFollowMultiplicationFactor: 1,
            isReadOnly: false,
            isHidden: false,
            isMandatory: false,
            defaultLimit: 0,
            defaultLimitBasis: 4,
            defaultCostBasis: 13,
            subLimitCap: null,
            availableLimitBasis: {
                "4": "Annual Aggregate",
            },
            availableCostBasis: {
                "13": "Not Applicable",
            },
        },
    }
}

class MockCoverageHttpService {
    getMultiplePropertyBusinessLineProducts = () => {};
}

const mockPropertyCoverage = [
    {
        coverageType: createCoverageType(8856, "IC 9: COMMERCIAL PROPERTY", "MDCP"),
        childCoverages: [
            {
                coverageType: createCoverageType(7656, "SECTION A: PROPERTY DAMAGE", "MDCP"),
                childCoverages: [],
                limits: [createLimit(defaultPropertyDamageLimit, "MDCPPDL1")],
                excesses: [],
            },
            {
                coverageType: createCoverageType(7657, "SECTION B: GENERAL CONTENTS DAMAGE", "MDCP"),
                childCoverages: [],
                limits: [createLimit(defaultContentsDamageLimit, "MDCPCDL1")],
                excesses: [],
            },
            {
                coverageType: createCoverageType(7642, "SECTION C: PORTABLE CONTENTS", "MDCP"),
                childCoverages: [],
                limits: [createLimit(100000, "MDCPPCL1")],
                excesses: [],
            },
            {
                coverageType: createCoverageType(7658, "SECTION D: STOCK DAMAGE", "MDCP"),
                childCoverages: [],
                limits: [createLimit(defaultStockDamageLimit, "MDCPSDL1")],
                excesses: [],
            },
        ],
        limits: [],
        excesses: [],
    },
    {
        coverageType: createCoverageType(8857, "IC 10: BUSINESS INTERRUPTION", "MDBI"),
        isExpanded: true,
        childCoverages: [
            {
                coverageType: createCoverageType(9017, "SECTION A: ACTUAL LOSS SUSTAINED AND INCREASED COST OF WORKING", "MDBI"),
                childCoverages: [],
                limits: [createLimit(defaultActualLossSustainedLimit, "MDBIALL1")],
                excesses: [],
            },
            {
                coverageType: createCoverageType(7664, "SECTION C: GROSS RENTALS", "MDBI"),
                childCoverages: [],
                limits: [createLimit(defaultGrossRentalLimit, "MDBIGRL1")],
                excesses: [],
            },
        ],
        limits: [],
        excesses: [],
    },
];
