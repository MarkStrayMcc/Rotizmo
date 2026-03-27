import { Coverage, CoverageExcess, CoverageLimit, CoverageType, CoverageExcessType, CoverageLimitType, Tag } from "@app/models/auto-generated";

/**
 * Builder class for creating CoverageExcess test data
 * Usage: new CoverageExcessBuilder().withExcess(5000).withCode('CPCEEX').build()
 */
export class CoverageExcessBuilder {
    private _coverageExcessTypeId: number = 100;
    private _excess: number | null | undefined = null;
    private _excessBasisId: number | null | undefined = null;
    private _excessTypeCode: string = 'TEST_EXCESS';
    private _followExcessCodes: string[] = [];
    private _defaultExcess: number = 1000;
    private _defaultExcessBasis: number = 1;

    withExcessTypeId(id: number): CoverageExcessBuilder {
        this._coverageExcessTypeId = id;
        return this;
    }

    withExcess(value: number | null | undefined): CoverageExcessBuilder {
        this._excess = value;
        return this;
    }

    withExcessBasisId(value: number | null | undefined): CoverageExcessBuilder {
        this._excessBasisId = value;
        return this;
    }

    withCode(code: string): CoverageExcessBuilder {
        this._excessTypeCode = code;
        return this;
    }

    withFollowCodes(codes: string[]): CoverageExcessBuilder {
        this._followExcessCodes = codes;
        return this;
    }

    withDefaults(excess: number, basis: number): CoverageExcessBuilder {
        this._defaultExcess = excess;
        this._defaultExcessBasis = basis;
        return this;
    }

    build(): CoverageExcess {
        return {
            coverageExcessTypeId: this._coverageExcessTypeId,
            excess: this._excess,
            excessBasisId: this._excessBasisId,
            excessType: {
                coverageExcessTypeId: this._coverageExcessTypeId,
                excessTypeCode: this._excessTypeCode,
                order: 0,
                followExcessTypeId: null,
                followExcessCodes: this._followExcessCodes,
                excessFollowMultiplicationFactor: 1,
                description: 'Test Excess',
                isReadOnly: false,
                isHidden: false,
                isMandatory: false,
                defaultExcess: this._defaultExcess,
                defaultExcessBasis: this._defaultExcessBasis,
                availableExcessBasis: { 1: "Per Claim" }
            } as CoverageExcessType
        } as CoverageExcess;
    }
}

/**
 * Builder class for creating CoverageLimit test data
 * Usage: new CoverageLimitBuilder().withLimit(10000).withCode('TEST_LIMIT').build()
 */
export class CoverageLimitBuilder {
    private _limitTypeId: number = 100;
    private _limit: number | null | undefined = null;
    private _limitBasis: number | null | undefined = null;
    private _costBasis: number | null | undefined = null;
    private _limitTypeCode: string = 'TEST_LIMIT';
    private _followLimitCodes: string[] = [];
    private _defaultLimit: number = 10000;
    private _defaultLimitBasis: number = 1;
    private _defaultCostBasis: number = 1;

    withLimitTypeId(id: number): CoverageLimitBuilder {
        this._limitTypeId = id;
        return this;
    }

    withLimit(value: number | null | undefined): CoverageLimitBuilder {
        this._limit = value;
        return this;
    }

    withLimitBasis(value: number | null | undefined): CoverageLimitBuilder {
        this._limitBasis = value;
        return this;
    }

    withCostBasis(value: number | null | undefined): CoverageLimitBuilder {
        this._costBasis = value;
        return this;
    }

    withCode(code: string): CoverageLimitBuilder {
        this._limitTypeCode = code;
        return this;
    }

    withFollowCodes(codes: string[]): CoverageLimitBuilder {
        this._followLimitCodes = codes;
        return this;
    }

    withDefaults(limit: number, limitBasis: number, costBasis: number): CoverageLimitBuilder {
        this._defaultLimit = limit;
        this._defaultLimitBasis = limitBasis;
        this._defaultCostBasis = costBasis;
        return this;
    }

    build(): CoverageLimit {
        return {
            limitTypeId: this._limitTypeId,
            limit: this._limit,
            limitBasis: this._limitBasis,
            costBasis: this._costBasis,
            coverageLimitType: {
                limitTypeId: this._limitTypeId,
                limitTypeCode: this._limitTypeCode,
                order: 0,
                followLimitTypeId: null,
                followLimitCodes: this._followLimitCodes,
                limitFollowMultiplicationFactor: 1,
                isReadOnly: false,
                isHidden: false,
                isMandatory: false,
                defaultLimit: this._defaultLimit,
                defaultLimitBasis: this._defaultLimitBasis,
                defaultCostBasis: this._defaultCostBasis,
                subLimitCap: null,
                availableLimitBasis: { 1: "Per Occurrence" },
                availableCostBasis: { 1: "In Addition" }
            } as CoverageLimitType
        } as CoverageLimit;
    }
}

/**
 * Builder class for creating Coverage test data with lead/follow relationships
 * Usage: CoverageBuilder.createLeadFollowScenario({ leaderExcess: 5000, followerExcess: null })
 */
export class CoverageBuilder {
    /**
     * Creates a standard lead/follow excess test scenario
     */
    static createLeadFollowExcessScenario(config: {
        leaderExcess: number | null | undefined;
        followerExcess: number | null | undefined;
        leaderCode?: string;
        followerCode?: string;
        leaderBasisId?: number | null;
        followerBasisId?: number | null;
    }): Coverage[] {
        const leaderCode = config.leaderCode || 'CPIRLR';
        const followerCode = config.followerCode || 'CPCEEX';

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
                    excesses: [
                        new CoverageExcessBuilder()
                            .withExcessTypeId(100)
                            .withCode(leaderCode)
                            .withExcess(config.leaderExcess)
                            .withExcessBasisId(config.leaderBasisId ?? 1)
                            .build()
                    ],
                    limits: [],
                    childCoverages: []
                } as Coverage,
                {
                    coverageType: {
                        id: 11,
                        insuringClauseSectionCode: { name: "CEEX", description: "Follower" }
                    } as CoverageType,
                    excesses: [
                        new CoverageExcessBuilder()
                            .withExcessTypeId(101)
                            .withCode(followerCode)
                            .withExcess(config.followerExcess)
                            .withExcessBasisId(config.followerBasisId ?? 1)
                            .withFollowCodes([leaderCode])
                            .build()
                    ],
                    limits: [],
                    childCoverages: []
                } as Coverage
            ],
            limits: [],
            excesses: []
        }] as Coverage[];
    }

}

export class CoverageModelTestUtilities {

    public static getTestCoverageTypes(): CoverageType[] {
        return [
            {
                id: 1,
                name: "Directors & Officers",
                limitTypes: null,
                insuringClauseCode: { name: "DOCRFT", description: "" },
                childCoverageTypes: [{
                    id: 33,
                    name: "Child Test1",
                    insuringClauseSectionCode: { name: "DOCRFT", description: "" },
                    limitTypes: [{ limitTypeId: 80001, defaultLimit: 12345, followLimitTypeId: null, limitTypeCode: "DOCRFTL1" }],
                    excessTypes: [{ coverageExcessTypeId: 90001, defaultExcess: 123, followExcessTypeId: null, excessTypeCode: "DOCRFTD1" }]
                } as CoverageType,
                {

                    id: 44,
                    name: "Child Test2",
                    insuringClauseSectionCode: { name: "DOCXFT", description: "" },
                    limitTypes: [{ limitTypeId: 80002, defaultLimit: 12345, followLimitTypeId: 80001, limitTypeCode: "DOCXFTL1" }],
                    excessTypes: [{ coverageExcessTypeId: 90002, defaultExcess: 123, followExcessTypeId: 90001, excessTypeCode: "DOCXFTD1" }]
                } as CoverageType
                ]
            } as CoverageType,
            {
                id: 2,
                insuringClauseCode: { name: "DOCVFT", description: "" },
                name: "Corporate Liability",
                limitTypes: [{ limitTypeId: 80003, defaultLimit: 12345, followLimitTypeId: 80001, limitTypeCode: "DOCVFTL1" }],
                excessTypes: [{ coverageExcessTypeId: 90003, defaultExcess: 123, followExcessTypeId: 90001, excessTypeCode: "DOCVFTD1" }]
            } as CoverageType,
            {
                id: 3,
                name: "Employment Practices Liability",
                limitTypes: [{ limitTypeId: 80004, defaultLimit: 12345, followLimitTypeId: 80001, limitTypeCode: "DOCHFTL1" }],
                excessTypes: [{ coverageExcessTypeId: 90004, defaultExcess: 123, followExcessTypeId: 90001, excessTypeCode: "DOCHFTD1" }]
            } as CoverageType,
            {
                id: 4,
                name: "Cyber, Privacy, Media",
                insuringClauseCode: { name: "CP", description: "" },
            } as CoverageType,
            {
                id: 5,
                name: "Crime",
                insuringClauseCode: { name: "CR", description: "" },
            } as CoverageType,
            {
                id: 6,
                name: "Kidnap & Ransom",
                insuringClauseCode: { name: "KR", description: "" }
            } as CoverageType
        ] as CoverageType[];
    }

    public static getTestCoverageList(): Coverage[] {
        const testCoverageTypes = CoverageModelTestUtilities.getTestCoverageTypes();

        const coverages = [
            CoverageModelTestUtilities.translateToCoverage(testCoverageTypes[1]),
            CoverageModelTestUtilities.translateToCoverage(testCoverageTypes[3]),
            CoverageModelTestUtilities.translateToCoverage(testCoverageTypes[0]),
            CoverageModelTestUtilities.translateToCoverage(testCoverageTypes[4]),
            CoverageModelTestUtilities.translateToCoverage(testCoverageTypes[5])
        ] as Coverage[];
        return coverages;
    }

    public static translateToCoverage(coverageTypeItem: CoverageType): Coverage {
        const coverageItem = {
            coverageType: coverageTypeItem,
            limits: [] as CoverageLimit[],
            excesses: [] as CoverageExcess[],
            childCoverages: []
        } as Coverage;

        if (coverageTypeItem.limitTypes) {
            for (const limitType of coverageTypeItem.limitTypes) {
                coverageItem.limits.push({
                    limitTypeId: 0,
                    limit: limitType.defaultLimit,
                    limitBasis: null,
                    costBasis: null,
                    subLimitCap: null,
                    coverageLimitType: limitType
                });
            }
        }

        if (coverageTypeItem.excessTypes) {
            for (const excessType of coverageTypeItem.excessTypes) {
                coverageItem.excesses.push({
                    coverageExcessTypeId: 0,
                    excess: excessType.defaultExcess,
                    excessBasisId: null,
                    excessType
                });
            }
        }

        if (coverageTypeItem.childCoverageTypes) {
            for (const childCoverageTypeItem of coverageTypeItem.childCoverageTypes) {
                coverageItem.childCoverages.push(this.translateToCoverage(childCoverageTypeItem));
            }
        }

        return coverageItem;
    }
}
