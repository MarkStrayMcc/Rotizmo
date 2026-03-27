import { waitForAsync, TestBed } from "@angular/core/testing";
import { cloneDeep } from "lodash";
import { Coverage, CoverageType } from "@app/models";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { CoverageModelTestUtilities, CoverageBuilder, CoverageExcessBuilder } from "@app/test/coverage-model.testutil";
import { CoverageItemService } from "@app/services/coverage-item.service";
import { CoverageService } from "@app/services/coverage.service";
import { CoverageHttpService } from './coverage-http.service';

describe("CoverageItemService", () => {
    let coverageService: CoverageService;
    let coverageItemService: CoverageItemService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                CoverageService,
                CoverageItemService,
                { provide: CoverageHttpService, useClass: MockCoverageHttpService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        coverageService = TestBed.inject(CoverageService);
        coverageItemService = TestBed.inject(CoverageItemService);
        spyOn(coverageService, "getSelectedCoverage").and.callThrough();
    });

    it("Should be created", () => {
        expect(coverageItemService).toBeTruthy();
    });

    it("Should return flat list of coverage items with new coverages when no selected coverages are provided and there is no hierarchy of child coverage items", () => {
        // Arrange
        const testCoverageTypes = getTestCoverageTypesWithNoHierarchy();
        const nbOfCoverageTypes = testCoverageTypes.length;

        // Act
        const coverageItems = coverageItemService.getCoverageItems(testCoverageTypes, new Array<Coverage>(), false);

        // Assert
        expect(coverageItems).toBeDefined();
        expect(coverageItems.length).toBe(nbOfCoverageTypes);
        expect(coverageService.getSelectedCoverage).toHaveBeenCalledTimes(nbOfCoverageTypes);
        expect(coverageItems[0].coverage.coverageType).toBeDefined();
        expect(coverageItems[0].coverage.coverageType.id).toBe(1);
        expect(coverageItems[0].coverage.coverageType.name).toBe("Directors & Officers");
        expect(coverageItems[1].coverage.coverageType).toBeDefined();
        expect(coverageItems[1].coverage.coverageType.id).toBe(2);
        expect(coverageItems[1].coverage.coverageType.name).toBe("Corporate Liability");
        expect(coverageItems[2].coverage.coverageType).toBeDefined();
        expect(coverageItems[2].coverage.coverageType.id).toBe(3);
        expect(coverageItems[2].coverage.coverageType.name).toBe("Employment Practices Liability");
    });

    it("Should return list of coverage items with new coverages when no selected coverages are provided and there is a hierarchy of child coverage items", () => {
        // Arrange
        const testCoverageTypes = getTestCoverageTypesWithHierarchyOfChildItems();
        let numberOfCoverages = 0;
        for (const coverage of testCoverageTypes) {
            numberOfCoverages += coverage.childCoverageTypes.length + 1;
        }

        // Act
        const coverageItems = coverageItemService.getCoverageItems(testCoverageTypes, new Array<Coverage>(), false);

        // Assert
        expect(coverageItems).toBeDefined();
        expect(coverageItems.length).toBe(testCoverageTypes.length);
        expect(coverageService.getSelectedCoverage).toHaveBeenCalledTimes(numberOfCoverages);
        expect(coverageItems[0].coverage.coverageType).toBeDefined();
        expect(coverageItems[0].coverage.coverageType.id).toBe(1);
        expect(coverageItems[0].coverage.coverageType.name).toBe("Directors & Officers");

        expect(coverageItems[0].childCoverageItems).toBeDefined();
        expect(coverageItems[0].childCoverageItems[0]).toBeDefined();
        expect(coverageItems[0].childCoverageItems[0].coverage.coverageType.name).toBe("Social Media");
        expect(coverageItems[0].childCoverageItems[0].coverage.coverageType.id).toBe(6);

        expect(coverageItems[0].childCoverageItems[1]).toBeDefined();
        expect(coverageItems[0].childCoverageItems[1].coverage.coverageType.name).toBe("Test Coverage");
        expect(coverageItems[0].childCoverageItems[1].coverage.coverageType.id).toBe(7);

        expect(coverageItems[1].coverage.coverageType).toBeDefined();
        expect(coverageItems[1].coverage.coverageType.id).toBe(2);
        expect(coverageItems[1].coverage.coverageType.name).toBe("Corporate Liability");

        expect(coverageItems[1].childCoverageItems[0]).toBeDefined();
        expect(coverageItems[1].childCoverageItems[0].coverage.coverageType.name).toBe("Architecture");
        expect(coverageItems[1].childCoverageItems[0].coverage.coverageType.id).toBe(8);
        expect(coverageItems[1].childCoverageItems[0].coverage.limits[0].coverageLimitType.defaultLimit).toBe(40);
    });

    it("Should return coverage items with existing coverages values if available when wording version was not updated", () => {
        // Arrange
        const nbOfCoverageTypes = getTestCoverageTypesWithNoHierarchy().length;

        // Act
        const coverageItems = coverageItemService.getCoverageItems(getTestCoverageTypesWithNoHierarchy(), getTestCoverageList(), false);

        // Assert
        expect(coverageItems).toBeDefined();
        expect(coverageItems.length).toBe(nbOfCoverageTypes);
        expect(coverageService.getSelectedCoverage).toHaveBeenCalledTimes(nbOfCoverageTypes);
        expect(coverageItems[0].coverage.coverageType).toBeDefined();
        expect(coverageItems[0].coverage.coverageType.id).toBe(1);
        expect(coverageItems[0].coverage.coverageType.name).toBe("Directors & Officers");
        expect(coverageItems[1].coverage.coverageType).toBeDefined();
        expect(coverageItems[1].coverage.coverageType.id).toBe(2);
        expect(coverageItems[1].coverage.coverageType.name).toBe("Corporate Liability");
        expect(coverageItems[2].coverage.coverageType).toBeDefined();
        expect(coverageItems[2].coverage.coverageType.id).toBe(3);
        expect(coverageItems[2].coverage.coverageType.name).toBe("Employment Practices Liability");
    });

    it("Should return coverage items with default coverage values when wording version was updated", () => {
        // Arrange
        const testCoverageTypes = CoverageModelTestUtilities.getTestCoverageTypes();
        const defaultTestCoverages = testCoverageTypes.map(x => CoverageModelTestUtilities.translateToCoverage(x));
        const testCoveragesCount = defaultTestCoverages.length;
        const testSelectedCoverages = cloneDeep(defaultTestCoverages.slice(0, testCoveragesCount / 2));

        for (const testCoverage of testSelectedCoverages) {
            setTestValues(testCoverage);
        }

        // Act
        const coverageItems = coverageItemService.getCoverageItems(testCoverageTypes, testSelectedCoverages, true);

        // Assert
        expect(coverageItems).toBeDefined();
        expect(coverageItems.length).toBe(testCoveragesCount);
        expectValuesToBeTheSame(coverageItems, defaultTestCoverages);
    });

    it("Should return coverage item as selected when created from an existing coverage when wording version was not updated", () => {
        // Arrange
        const nbOfCoverageTypes = getTestCoverageTypesWithNoHierarchy().length;

        // Act
        const coverageItems = coverageItemService.getCoverageItems(getTestCoverageTypesWithNoHierarchy(), getTestCoverageList(), false);

        // Assert
        expect(coverageItems).toBeDefined();
        expect(coverageItems.length).toBe(nbOfCoverageTypes);
        expect(coverageService.getSelectedCoverage).toHaveBeenCalledTimes(nbOfCoverageTypes);
        expect(coverageItems[0].coverage.coverageType).toBeDefined();
        expect(coverageItems[0].isSelected).toBeFalsy();
        expect(coverageItems[1].coverage.coverageType).toBeDefined();
        expect(coverageItems[1].coverage.coverageType.name).toBe("Corporate Liability");
        expect(coverageItems[1].isSelected).toBeFalsy();
        expect(coverageItems[2].coverage.coverageType).toBeDefined();
        expect(coverageItems[2].isSelected).toBeFalsy();
    });

    it("Should return false for uninitialised coverage type", () => {
        // Arrange
        const coverageType: CoverageType = {
            id: 1,
            name: "CoverageType",
            isMandatory: false,
            childCoverageTypes: [],
            limitTypes: [],
            excessTypes: [],
            isAdditionalCoverage: false,
            order: 0,
            businessLine: null,
            insuringClauseCode: null,
            insuringClauseSectionCode: null,
            additionalCoverageCategories: null
        } as CoverageType;

        // Act
        const expandedStateResult = coverageItemService.getCoverageExpandedState(coverageType);

        // Assert
        expect(expandedStateResult).toBe(false);
    });

    it("Should save expanded states", () => {
        // Arrange
        const coverageType: CoverageType = {
            id: 1,
            name: "CoverageType",
            isMandatory: false,
            childCoverageTypes: [],
            limitTypes: [],
            excessTypes: [],
            isAdditionalCoverage: false,
            order: 0,
            businessLine: null,
            insuringClauseCode: null,
            insuringClauseSectionCode: null,
            additionalCoverageCategories: null
        } as CoverageType;

        // Act
        coverageItemService.saveCoverageExpandedState(coverageType, true);
        const firstExpandedStateResult = coverageItemService.getCoverageExpandedState(coverageType);
        coverageItemService.saveCoverageExpandedState(coverageType, false);
        const secondExpandedStateResult = coverageItemService.getCoverageExpandedState(coverageType);

        // Assert
        expect(firstExpandedStateResult).toBe(true);
        expect(secondExpandedStateResult).toBe(false);
    });

    function getTestCoverageTypesWithNoHierarchy() {
        return [
            {
                id: 1,
                name: "Directors & Officers",
                limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }],
                insuringClauseCode: { name: "DO", description: "" }
            },
            {
                id: 2,
                name: "Corporate Liability",
                limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }],
                insuringClauseCode: { name: "CL", description: "" }
            },
            {
                id: 3,
                name: "Employment Practices Liability",
                limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }],
                insuringClauseCode: { name: "EPL", description: "" }
            },
        ] as CoverageType[];
    }

    function getTestCoverageTypesWithHierarchyOfChildItems() : CoverageType[] {
        return [
            {
                id: 1,
                name: "Directors & Officers",
                childCoverageTypes: [{
                        id: 6,
                        name: "Social Media",
                        limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }]
                    }, {
                        id: 7,
                        name: "Test Coverage",
                        limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }]
                    }]
            },
            {
                id: 2,
                name: "Corporate Liability",
                childCoverageTypes: [{
                    id: 8,
                    name: "Architecture",
                    limitTypes: [{ limitTypeId: 1, defaultLimit: 40, defaultLimitBasis: 0 }]
                }],
                limits: [
                    { limit: 100, limitBasis: 1, costBasis: 1, limitType: { limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 } }
                ]

            }
        ] as CoverageType[];
    }

    function getTestCoverageList() {
        return [
            {
                coverageType: {
                    id: 2,
                    name: "Cyber, Privacy, Media",
                    limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }]
                } as CoverageType,
                limits: [
                    { limit: 80, limitBasis: 1, costBasis: 1, coverageLimitType: { limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 } }
                ]
            }, {
                coverageType: {
                    id: 5,
                    name: "Crime",
                    limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }]
                } as CoverageType,
                limits: [
                    { limit: 90, limitBasis: 1, costBasis: 1, coverageLimitType: { limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 } }
                ]
            }, {
                coverageType: {
                    id: 6,
                    name: "Kidnap & Ransom",
                    limitTypes: [{ limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 }]
                } as CoverageType,
                limits: [
                    { limit: 100, limitBasis: 1, costBasis: 1, coverageLimitType: { limitTypeId: 1, defaultLimit: null, defaultLimitBasis: 0 } }
                ]
            }
        ] as Coverage[];
    }

    function setTestValues(coverage) {
        if (coverage.limits) {
            for (const limit of coverage.limits) {
                limit.limit = 1234567;
            }
        }

        if (coverage.excesses) {
            for (const excess of coverage.excesses) {
                excess.excess = 12345;
            }
        }

        if (coverage.childCoverages) {
            for (const child of coverage.childCoverages) {
                setTestValues(child);
            }
        }
    }

    function expectValuesToBeTheSame(coverageItems: CoverageItem[], defaultCoverages: Coverage[]) {
        for (let i = 0; i < coverageItems.length; i++) {
            const coverageItem = coverageItems[i];
            const defaultCoverage = defaultCoverages[i];

            expect(coverageItem.coverage).toBeDefined();
            if (coverageItem.coverage.limits) {
                expect(coverageItem.coverage.limits.length).toBe(defaultCoverage.limits.length);
                for (let j = 0; j < coverageItem.coverage.limits.length; j++) {
                    const limit = coverageItem.coverage.limits[j].limit;
                    const defaultLimit = defaultCoverage.limits[j].limit;
                    expect(limit).toBe(defaultLimit);
                }
            }

            if (coverageItem.coverage.excesses) {
                expect(coverageItem.coverage.excesses.length).toBe(defaultCoverage.excesses.length);
                for (let j = 0; j < coverageItem.coverage.excesses.length; j++) {
                    const excess = coverageItem.coverage.excesses[j].excess;
                    const defaultExcess = defaultCoverage.excesses[j].excess;
                    expect(excess).toBe(defaultExcess);
                }
            }

            if (coverageItem.childCoverageItems) {
                expectValuesToBeTheSame(coverageItem.childCoverageItems, defaultCoverage.childCoverages);
            }
        }
    }
});

class MockCoverageHttpService {
    getMultiplePropertyBusinessLineProducts = () => {};
}

describe("CoverageItemService - Lead/Follow Excess Logic", () => {
    let coverageItemService: CoverageItemService;
    let coverageService: CoverageService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                CoverageService,
                CoverageItemService,
                { provide: CoverageHttpService, useClass: MockCoverageHttpService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        coverageItemService = TestBed.inject(CoverageItemService);
        coverageService = TestBed.inject(CoverageService);
    });

    it("Should NOT overwrite follower excess value of 0 with leader value", () => {
        // Arrange - Create coverage types with lead/follow relationship
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        
        // Create selected coverages where follower has excess = 0 (valid value)
        const selectedCoverages = getSelectedCoveragesWithZeroExcess();

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert - The follower's excess should remain 0, NOT be overwritten by leader's value
        const parentCoverage = coverageItems[0];
        const followerChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX')
        );
        
        if (followerChild) {
            const followerExcess = followerChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPCEEX');
            expect(followerExcess.excess).toBe(0); // Should remain 0, not overwritten
        }
    });

    it("Should assign leader excess value to follower when follower excess is null", () => {
        // Arrange
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        const selectedCoverages = getSelectedCoveragesWithNullExcess();

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert - The follower's excess should be assigned leader's value
        const parentCoverage = coverageItems[0];
        const leaderChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPIRLR')
        );
        const followerChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX')
        );

        if (leaderChild && followerChild) {
            const leaderExcess = leaderChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPIRLR');
            const followerExcess = followerChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPCEEX');
            expect(followerExcess.excess).toBe(leaderExcess.excess); // Should be assigned leader's value
        }
    });

    it("Should preserve existing excess value when not null or undefined", () => {
        // Arrange
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        const selectedCoverages = getSelectedCoveragesWithSpecificExcess(5000);

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert
        const parentCoverage = coverageItems[0];
        const followerChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX')
        );

        if (followerChild) {
            const followerExcess = followerChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPCEEX');
            expect(followerExcess.excess).toBe(5000); // Should remain 5000, not overwritten
        }
    });

    // Helper functions for test data
    function getTestCoverageTypesWithLeadFollowExcess(): CoverageType[] {
        return [{
            id: 1,
            name: "Cyber",
            isMandatory: false,
            isSelectedByDefault: false,
            businessLine: null,
            insuringClauseCode: { name: "CP", description: "Cyber" },
            insuringClauseSectionCode: null,
            isAdditionalCoverage: false,
            additionalCoverageCategories: null,
            order: 0,
            childCoverageTypes: [
                {
                    id: 10,
                    name: "Cyber Extortion Leader",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "IRLR", description: "Leader" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 0,
                    childCoverageTypes: [],
                    excessTypes: [{
                        coverageExcessTypeId: 100,
                        excessTypeCode: 'CPIRLR',
                        defaultExcess: 1000,
                        defaultExcessBasis: 1,
                        followExcessCodes: [],
                        availableExcessBasis: { 1: "Per Claim" },
                        order: 0,
                        followExcessTypeId: null,
                        excessFollowMultiplicationFactor: 1,
                        description: 'Leader Excess',
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false
                    }],
                    limitTypes: []
                } as CoverageType,
                {
                    id: 11,
                    name: "Cyber Extortion Follower",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "CEEX", description: "Follower" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 1,
                    childCoverageTypes: [],
                    excessTypes: [{
                        coverageExcessTypeId: 101,
                        excessTypeCode: 'CPCEEX',
                        defaultExcess: 1000,
                        defaultExcessBasis: 1,
                        followExcessCodes: ['CPIRLR'], // Follows the leader
                        availableExcessBasis: { 1: "Per Claim" },
                        order: 0,
                        followExcessTypeId: 100,
                        excessFollowMultiplicationFactor: 1,
                        description: 'Follower Excess',
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false
                    }],
                    limitTypes: []
                } as CoverageType
            ],
            limitTypes: [],
            excessTypes: []
        }] as CoverageType[];
    }

    function getTestCoverageTypesWithLeadFollowLimit(): CoverageType[] {
        return [{
            id: 1,
            name: "Test Coverage",
            isMandatory: false,
            isSelectedByDefault: false,
            businessLine: null,
            insuringClauseCode: { name: "TC", description: "Test" },
            insuringClauseSectionCode: null,
            isAdditionalCoverage: false,
            additionalCoverageCategories: null,
            order: 0,
            childCoverageTypes: [
                {
                    id: 10,
                    name: "Leader Coverage",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "LEAD", description: "Leader" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 0,
                    childCoverageTypes: [],
                    limitTypes: [{
                        limitTypeId: 100,
                        limitTypeCode: 'CPIRFC',
                        defaultLimit: 10000,
                        defaultLimitBasis: 1,
                        defaultCostBasis: 1,
                        followLimitCodes: [],
                        order: 0,
                        followLimitTypeId: null,
                        limitFollowMultiplicationFactor: 1,
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false,
                        subLimitCap: null,
                        availableLimitBasis: { 1: "Per Occurrence" },
                        availableCostBasis: { 1: "In Addition" }
                    }],
                    excessTypes: []
                } as CoverageType,
                {
                    id: 11,
                    name: "Follower Coverage",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "FOLLOW", description: "Follower" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 1,
                    childCoverageTypes: [],
                    limitTypes: [{
                        limitTypeId: 101,
                        limitTypeCode: 'CPCEEX',
                        defaultLimit: 10000,
                        defaultLimitBasis: 1,
                        defaultCostBasis: 1,
                        followLimitCodes: ['CPIRFC'],
                        order: 0,
                        followLimitTypeId: 100,
                        limitFollowMultiplicationFactor: 1,
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false,
                        subLimitCap: null,
                        availableLimitBasis: { 1: "Per Occurrence" },
                        availableCostBasis: { 1: "In Addition" }
                    }],
                    excessTypes: []
                } as CoverageType
            ],
            limitTypes: [],
            excessTypes: []
        }] as CoverageType[];
    }

    function getSelectedCoveragesWithZeroExcess(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Cyber",
                insuringClauseCode: { name: "CP", description: "Cyber" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "IRLR", description: "Leader" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 100,
                        excess: 5000,
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPIRLR', followExcessCodes: [] }
                    }],
                    limits: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 101,
                        excess: 0, // Valid zero value - should NOT be overwritten
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPCEEX', followExcessCodes: ['CPIRLR'] }
                    }],
                    limits: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

    function getSelectedCoveragesWithNullExcess(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Cyber",
                insuringClauseCode: { name: "CP", description: "Cyber" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "IRLR", description: "Leader" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 100,
                        excess: 5000,
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPIRLR', followExcessCodes: [] }
                    }],
                    limits: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 101,
                        excess: null, // Null value - should be assigned leader's value
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPCEEX', followExcessCodes: ['CPIRLR'] }
                    }],
                    limits: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

    function getSelectedCoveragesWithSpecificExcess(excessValue: number): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Cyber",
                insuringClauseCode: { name: "CP", description: "Cyber" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "IRLR", description: "Leader" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 100,
                        excess: 1000,
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPIRLR', followExcessCodes: [] }
                    }],
                    limits: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 101,
                        excess: excessValue, // Specific value - should NOT be overwritten
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPCEEX', followExcessCodes: ['CPIRLR'] }
                    }],
                    limits: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

    function getSelectedCoveragesWithUndefinedExcess(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Cyber",
                insuringClauseCode: { name: "CP", description: "Cyber" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "IRLR", description: "Leader" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 100,
                        excess: 5000,
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPIRLR', followExcessCodes: [] }
                    }],
                    limits: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 101,
                        excess: undefined, // Undefined value - should be assigned leader's value
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPCEEX', followExcessCodes: ['CPIRLR'] }
                    }],
                    limits: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

    function getSelectedCoveragesWithUndefinedLimit(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Test Coverage",
                insuringClauseCode: { name: "TC", description: "Test" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "LEAD", description: "Leader" }
                    } as CoverageType,
                    limits: [{
                        limitTypeId: 100,
                        limit: 10000,
                        limitBasis: 1,
                        costBasis: 1,
                        coverageLimitType: { limitTypeCode: 'CPIRFC', followLimitCodes: [] }
                    }],
                    excesses: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "FOLLOW", description: "Follower" }
                    } as CoverageType,
                    limits: [{
                        limitTypeId: 101,
                        limit: undefined, // Undefined - should be assigned leader's value
                        limitBasis: undefined,
                        costBasis: undefined,
                        coverageLimitType: { limitTypeCode: 'CPCEEX', followLimitCodes: ['CPIRFC'] }
                    }],
                    excesses: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }
});

// Additional edge case tests for Lead/Follow logic
describe("CoverageItemService - Lead/Follow Edge Cases", () => {
    let coverageItemService: CoverageItemService;
    let coverageService: CoverageService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                CoverageService,
                CoverageItemService,
                { provide: CoverageHttpService, useClass: MockCoverageHttpService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        coverageItemService = TestBed.inject(CoverageItemService);
        coverageService = TestBed.inject(CoverageService);
    });

    // Tests using CoverageBuilder pattern for cleaner test data creation
    it("Should NOT overwrite zero excess using CoverageBuilder pattern", () => {
        // Arrange - Using builder pattern for cleaner test data
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        const selectedCoverages = CoverageBuilder.createLeadFollowExcessScenario({
            leaderExcess: 5000,
            followerExcess: 0  // Zero value should be preserved
        });

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert
        const followerExcess = coverageItems[0]?.childCoverageItems
            ?.find(c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX'))
            ?.coverage.excesses?.find(e => e.excessType?.excessTypeCode === 'CPCEEX');

        expect(followerExcess?.excess).toBe(0);
    });

    it("Should assign leader value when follower is null using CoverageBuilder pattern", () => {
        // Arrange
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        const selectedCoverages = CoverageBuilder.createLeadFollowExcessScenario({
            leaderExcess: 5000,
            followerExcess: null  // Null should get leader's value
        });

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert
        const followerExcess = coverageItems[0]?.childCoverageItems
            ?.find(c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX'))
            ?.coverage.excesses?.find(e => e.excessType?.excessTypeCode === 'CPCEEX');

        expect(followerExcess?.excess).toBe(5000);
    });

    it("Should assign leader excess value to follower when follower excess is undefined", () => {
        // Arrange
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        const selectedCoverages = getSelectedCoveragesWithUndefinedExcess();

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert
        const parentCoverage = coverageItems[0];
        const leaderChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPIRLR')
        );
        const followerChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX')
        );

        if (leaderChild && followerChild) {
            const leaderExcess = leaderChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPIRLR');
            const followerExcess = followerChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPCEEX');
            expect(followerExcess.excess).toBe(leaderExcess.excess);
        }
    });

    it("Should assign leader limit value to follower when follower limit is undefined", () => {
        // Arrange
        const coverageTypes = getTestCoverageTypesWithLeadFollowLimit();
        const selectedCoverages = getSelectedCoveragesWithUndefinedLimit();

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert
        const parentCoverage = coverageItems[0];
        const followerChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.limits?.some(l => l.coverageLimitType?.limitTypeCode === 'CPCEEX')
        );

        if (followerChild) {
            const followerLimit = followerChild.coverage.limits.find(l => l.coverageLimitType?.limitTypeCode === 'CPCEEX');
            expect(followerLimit.limit).toBe(10000); // Should be assigned leader's value
        }
    });

    it("Should NOT overwrite follower excessBasisId of 0 with leader value", () => {
        // Arrange - Create coverages where follower has excessBasisId = 0 (edge case)
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        const selectedCoverages = getSelectedCoveragesWithZeroExcessBasis();

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert
        const parentCoverage = coverageItems[0];
        const followerChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX')
        );

        if (followerChild) {
            const followerExcess = followerChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPCEEX');
            // Note: excessBasisId = 0 might be invalid in business terms, but technically should not be overwritten
            expect(followerExcess.excessBasisId).toBe(0);
        }
    });

    it("Should handle follower with both null excess and null excessBasisId", () => {
        // Arrange
        const coverageTypes = getTestCoverageTypesWithLeadFollowExcess();
        const selectedCoverages = getSelectedCoveragesWithAllNullValues();

        // Act
        const coverageItems = coverageItemService.getCoverageItems(coverageTypes, selectedCoverages, false);

        // Assert
        const parentCoverage = coverageItems[0];
        const leaderChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPIRLR')
        );
        const followerChild = parentCoverage.childCoverageItems.find(
            c => c.coverage.excesses?.some(e => e.excessType?.excessTypeCode === 'CPCEEX')
        );

        if (leaderChild && followerChild) {
            const leaderExcess = leaderChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPIRLR');
            const followerExcess = followerChild.coverage.excesses.find(e => e.excessType?.excessTypeCode === 'CPCEEX');
            expect(followerExcess.excess).toBe(leaderExcess.excess);
            expect(followerExcess.excessBasisId).toBe(leaderExcess.excessBasisId);
        }
    });

    // Helper functions for edge case tests
    function getTestCoverageTypesWithLeadFollowExcess(): CoverageType[] {
        return [{
            id: 1,
            name: "Cyber",
            isMandatory: false,
            isSelectedByDefault: false,
            businessLine: null,
            insuringClauseCode: { name: "CP", description: "Cyber" },
            insuringClauseSectionCode: null,
            isAdditionalCoverage: false,
            additionalCoverageCategories: null,
            order: 0,
            childCoverageTypes: [
                {
                    id: 10,
                    name: "Cyber Extortion Leader",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "IRLR", description: "Leader" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 0,
                    childCoverageTypes: [],
                    excessTypes: [{
                        coverageExcessTypeId: 100,
                        excessTypeCode: 'CPIRLR',
                        defaultExcess: 1000,
                        defaultExcessBasis: 1,
                        followExcessCodes: [],
                        availableExcessBasis: { 1: "Per Claim" },
                        order: 0,
                        followExcessTypeId: null,
                        excessFollowMultiplicationFactor: 1,
                        description: 'Leader Excess',
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false
                    }],
                    limitTypes: []
                } as CoverageType,
                {
                    id: 11,
                    name: "Cyber Extortion Follower",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "CEEX", description: "Follower" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 1,
                    childCoverageTypes: [],
                    excessTypes: [{
                        coverageExcessTypeId: 101,
                        excessTypeCode: 'CPCEEX',
                        defaultExcess: 1000,
                        defaultExcessBasis: 1,
                        followExcessCodes: ['CPIRLR'],
                        availableExcessBasis: { 1: "Per Claim" },
                        order: 0,
                        followExcessTypeId: 100,
                        excessFollowMultiplicationFactor: 1,
                        description: 'Follower Excess',
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false
                    }],
                    limitTypes: []
                } as CoverageType
            ],
            limitTypes: [],
            excessTypes: []
        }] as CoverageType[];
    }

    function getTestCoverageTypesWithLeadFollowLimit(): CoverageType[] {
        return [{
            id: 1,
            name: "Test Coverage",
            isMandatory: false,
            isSelectedByDefault: false,
            businessLine: null,
            insuringClauseCode: { name: "TC", description: "Test" },
            insuringClauseSectionCode: null,
            isAdditionalCoverage: false,
            additionalCoverageCategories: null,
            order: 0,
            childCoverageTypes: [
                {
                    id: 10,
                    name: "Leader Coverage",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "LEAD", description: "Leader" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 0,
                    childCoverageTypes: [],
                    limitTypes: [{
                        limitTypeId: 100,
                        limitTypeCode: 'CPIRFC',
                        defaultLimit: 10000,
                        defaultLimitBasis: 1,
                        defaultCostBasis: 1,
                        followLimitCodes: [],
                        order: 0,
                        followLimitTypeId: null,
                        limitFollowMultiplicationFactor: 1,
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false,
                        subLimitCap: null,
                        availableLimitBasis: { 1: "Per Occurrence" },
                        availableCostBasis: { 1: "In Addition" }
                    }],
                    excessTypes: []
                } as CoverageType,
                {
                    id: 11,
                    name: "Follower Coverage",
                    isMandatory: false,
                    isSelectedByDefault: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: { name: "FOLLOW", description: "Follower" },
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 1,
                    childCoverageTypes: [],
                    limitTypes: [{
                        limitTypeId: 101,
                        limitTypeCode: 'CPCEEX',
                        defaultLimit: 10000,
                        defaultLimitBasis: 1,
                        defaultCostBasis: 1,
                        followLimitCodes: ['CPIRFC'],
                        order: 0,
                        followLimitTypeId: 100,
                        limitFollowMultiplicationFactor: 1,
                        isReadOnly: false,
                        isHidden: false,
                        isMandatory: false,
                        subLimitCap: null,
                        availableLimitBasis: { 1: "Per Occurrence" },
                        availableCostBasis: { 1: "In Addition" }
                    }],
                    excessTypes: []
                } as CoverageType
            ],
            limitTypes: [],
            excessTypes: []
        }] as CoverageType[];
    }

    function getSelectedCoveragesWithUndefinedExcess(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Cyber",
                insuringClauseCode: { name: "CP", description: "Cyber" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "IRLR", description: "Leader" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 100,
                        excess: 5000,
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPIRLR', followExcessCodes: [] }
                    }],
                    limits: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 101,
                        excess: undefined,
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPCEEX', followExcessCodes: ['CPIRLR'] }
                    }],
                    limits: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }


    function getSelectedCoveragesWithUndefinedLimit(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Test Coverage",
                insuringClauseCode: { name: "TC", description: "Test" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "LEAD", description: "Leader" }
                    } as CoverageType,
                    limits: [{
                        limitTypeId: 100,
                        limit: 10000,
                        limitBasis: 1,
                        costBasis: 1,
                        coverageLimitType: { limitTypeCode: 'CPIRFC', followLimitCodes: [] }
                    }],
                    excesses: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "FOLLOW", description: "Follower" }
                    } as CoverageType,
                    limits: [{
                        limitTypeId: 101,
                        limit: undefined,
                        limitBasis: undefined,
                        costBasis: undefined,
                        coverageLimitType: { limitTypeCode: 'CPCEEX', followLimitCodes: ['CPIRFC'] }
                    }],
                    excesses: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

    function getSelectedCoveragesWithZeroExcessBasis(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Cyber",
                insuringClauseCode: { name: "CP", description: "Cyber" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "IRLR", description: "Leader" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 100,
                        excess: 5000,
                        excessBasisId: 1,
                        excessType: { excessTypeCode: 'CPIRLR', followExcessCodes: [] }
                    }],
                    limits: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 101,
                        excess: 3000,
                        excessBasisId: 0, // Zero excessBasisId - should NOT be overwritten
                        excessType: { excessTypeCode: 'CPCEEX', followExcessCodes: ['CPIRLR'] }
                    }],
                    limits: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

    function getSelectedCoveragesWithAllNullValues(): Coverage[] {
        return [{
            coverageType: {
                id: 1,
                name: "Cyber",
                insuringClauseCode: { name: "CP", description: "Cyber" }
            } as CoverageType,
            childCoverages: [
                {
                    coverageType: {
                        id: 10,
                        insuringClauseSectionCode: { name: "IRLR", description: "Leader" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 100,
                        excess: 5000,
                        excessBasisId: 2,
                        excessType: { excessTypeCode: 'CPIRLR', followExcessCodes: [] }
                    }],
                    limits: [],
                    childCoverages: []
                },
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [{
                        coverageExcessTypeId: 101,
                        excess: null,
                        excessBasisId: null,
                        excessType: { excessTypeCode: 'CPCEEX', followExcessCodes: ['CPIRLR'] }
                    }],
                    limits: [],
                    childCoverages: []
                }
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

});
