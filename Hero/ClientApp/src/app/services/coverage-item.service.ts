import { Injectable } from "@angular/core";
import { Coverage, CoverageExcess, CoverageLimit, CoverageType } from "@app/models";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { CoverageService } from "@app/services/coverage.service";

@Injectable()
export class CoverageItemService {

    private coverageExpandedState: { [id: number]: boolean } = {};

    constructor(protected coverageService: CoverageService) { }

    public getCoverageItems(coverageTypes: CoverageType[], selectedCoverages: Coverage[], updatedWordingVersion: boolean): CoverageItem[] {
        if (!coverageTypes) return [];
        const coverageItems = new Array<CoverageItem>();
        const leadLimits = {};
        const leadExcesses = {};

        for (const coverageType of coverageTypes) {
            const coverageItem = this.getCoverageItem(coverageType, selectedCoverages, leadLimits, leadExcesses, updatedWordingVersion, false);
            coverageItems.push(coverageItem);
        }

        this.addLeads(coverageItems, leadLimits, leadExcesses);

        return coverageItems;
    }

    public saveCoverageExpandedState(coverageType: CoverageType, isExpanded: boolean): void {
        this.coverageExpandedState[coverageType.id] = isExpanded;
    }

    public getCoverageExpandedState(coverageType: CoverageType): boolean {
        if (!this.coverageExpandedState[coverageType.id]) {
            return false;
        }

        return this.coverageExpandedState[coverageType.id];
    }

    public getCoverageItemIndex(coverageItems: CoverageItem[], coverageTypeId: number): number {
        return coverageItems.findIndex(coverageItem =>
            coverageItem.coverage.coverageType.id === coverageTypeId);
    }

    private getCoverageItem(
        coverageType: CoverageType,
        selectedCoverages: Coverage[],
        leadLimits: {},
        leadExcesses: {},
        forceDefaults: boolean,
        isChild: boolean): CoverageItem {
        const existingCoverage = this.coverageService.getSelectedCoverage(selectedCoverages, coverageType, isChild);
        const coverageItem = this.createCoverageItem(coverageType, existingCoverage, forceDefaults);

        coverageItem.leadLimits = leadLimits;
        coverageItem.leadExcesses = leadExcesses;

        if (coverageType.childCoverageTypes && coverageType.childCoverageTypes.length > 0) {
            for (const childType of coverageType.childCoverageTypes) {
                const child = this.getCoverageItem(childType, selectedCoverages, leadLimits, leadExcesses, forceDefaults, true);
                child.coverage.coverageType.businessLine = coverageType.businessLine;
                child.coverage.coverageType.insuringClauseCode = coverageType.insuringClauseCode;
                coverageItem.childCoverageItems.push(child);
            }
        }

        return coverageItem;
    }

    private createCoverageItem(coverageType: CoverageType, existingCoverage: Coverage, forceDefaults: boolean): CoverageItem {
        const coverageItem = new CoverageItem();
        coverageItem.childCoverageItems = new Array<CoverageItem>();

        if (!!existingCoverage && forceDefaults) {
            /**
             * existingCoverage is a misnomer. It is actually supposed to be selectedCoverage
             * forceDefaults is another misnomer. It denotes if the wordingVersion has changed.
             * if a coverage was selected and wordingVersion was changed, then it is the first load
             * of the coverages tab and hence we need to consider the value of isSelectedByDefault
             */
            coverageItem.isSelected = coverageType.isSelectedByDefault;
        } else {
            coverageItem.isSelected = !!existingCoverage;
        }

        if (existingCoverage && !forceDefaults) {
            coverageItem.coverage = existingCoverage;
            this.addFullCoverageTypes(coverageItem.coverage, coverageType);
        } else {
            const newCoverage = this.instantiateNewCoverage(coverageType);
            coverageItem.coverage = newCoverage;
        }
        return coverageItem;
    }

    private addFullCoverageTypes(coverage: Coverage, coverageType: CoverageType) {
        coverage.coverageType = coverageType;
        if (coverage.limits) {
            coverage.limits.forEach(l => {
                l.coverageLimitType = coverageType.limitTypes.find(t => t.limitTypeCode === l.coverageLimitType.limitTypeCode);
            });
        }
        if (coverage.excesses) {
            coverage.excesses.forEach(e => {
                e.excessType = coverageType.excessTypes.find(t => t.excessTypeCode === e.excessType.excessTypeCode);
            });
        }
    }

    private instantiateNewCoverage(coverageType: CoverageType) {
        const newCoverage = new Coverage();
        newCoverage.coverageType = coverageType;
        newCoverage.childCoverages = new Array<Coverage>();

        if (coverageType.limitTypes) {
            newCoverage.limits = new Array<CoverageLimit>();
            for (const limitType of coverageType.limitTypes) {
                const covLimit = new CoverageLimit();
                covLimit.limitTypeId = limitType.limitTypeId;
                covLimit.limit = limitType.defaultLimit;
                if (limitType.defaultLimitBasis !== null && limitType.defaultLimitBasis !== undefined) {
                    covLimit.limitBasis = limitType.defaultLimitBasis;
                } else {
                    covLimit.limitBasis = null;
                }
                if (limitType.defaultCostBasis !== null && limitType.defaultCostBasis !== undefined) {
                    covLimit.costBasis = limitType.defaultCostBasis;
                } else {
                    covLimit.costBasis = null;
                }
                covLimit.subLimitCap = limitType.subLimitCap;
                covLimit.coverageLimitType = limitType;
                newCoverage.limits.push(covLimit);
            }
        }

        if (coverageType.excessTypes) {
            newCoverage.excesses = new Array<CoverageExcess>();
            for (const excessType of coverageType.excessTypes) {
                const xs = new CoverageExcess();
                xs.coverageExcessTypeId = excessType.coverageExcessTypeId;
                xs.excess = excessType.defaultExcess;
                if (excessType.defaultExcess !== null && excessType.defaultExcess !== undefined) {
                    xs.excessBasisId = excessType.defaultExcessBasis;
                } else {
                    xs.excessBasisId = null;
                }
                xs.excessType = excessType;
                newCoverage.excesses.push(xs);
            }
        }
        return newCoverage;
    }

    private addLeads(
        coverageItems: CoverageItem[],
        leadLimits: { [code: string]: CoverageLimit },
        leadExcesses: { [code: string]: CoverageExcess }
    ) {
        const allLimits: CoverageLimit[] = [];
        const allExcesses: CoverageExcess[] = [];
        coverageItems.forEach(c => {
            if (c.childCoverageItems && c.childCoverageItems.length > 0) {
                c.childCoverageItems.forEach(cc => {
                    if (cc.coverage) {
                        if (cc.coverage.limits) cc.coverage.limits.forEach(l => allLimits.push(l));
                        if (cc.coverage.excesses) cc.coverage.excesses.forEach(e => allExcesses.push(e));
                    }
                });
            }
        });

        this.addLeadLimits(allLimits, leadLimits);
        this.addLeadExcesses(allExcesses, leadExcesses);
    }

    private addLeadLimits(limits: CoverageLimit[], leads: { [code: string]: CoverageLimit }) {
        const followers = limits.filter(l => Array.isArray(l.coverageLimitType.followLimitCodes) && l.coverageLimitType.followLimitCodes.length > 0);
        followers.forEach(f => {
            const leaderLimitCodes = f.coverageLimitType.followLimitCodes;

            // preload follow based on lead
            if (leaderLimitCodes) {

                let leaderLimitTotal = 0;
                let leaderLimitLimitBasis = 0;
                let leaderLimitCostBasis = 0;

                leaderLimitCodes.forEach(leaderLimitCode => {
                    const leader = limits.find((e) => e.coverageLimitType.limitTypeCode === leaderLimitCode);

                    leaderLimitTotal += leader.limit;
                    leaderLimitLimitBasis = leader.limitBasis;
                    leaderLimitCostBasis = leader.costBasis;

                    leads[leaderLimitCode] = leader;
                });


                if (!f.limit) {
                    f.limit = leaderLimitTotal;
                }
                if (!f.limitBasis) {
                    f.limitBasis = leaderLimitLimitBasis;
                }
                if (!f.costBasis) {
                    f.costBasis = leaderLimitCostBasis;
                }
            }
        });
    }

    private addLeadExcesses(excesses: CoverageExcess[], leads: { [code: string]: CoverageExcess }) {
        const followers = excesses.filter(e => Array.isArray(e.excessType.followExcessCodes) && e.excessType.followExcessCodes.length > 0);
        followers.forEach((f) => {
            const leaderExcessCodes = f.excessType.followExcessCodes;

            // preload follow based on lead
            if (leaderExcessCodes) {

                let leaderExcessTotal = 0;
                let leaderExcessExcessBasis = 0;

                leaderExcessCodes.forEach(leaderExcessCode => {
                    const leader = excesses.find((e) => e.excessType.excessTypeCode === leaderExcessCode);

                    leaderExcessTotal += leader.excess
                    leaderExcessExcessBasis = leader.excessBasisId;

                    leads[leaderExcessCode] = leader;
                });

                // FIX: Use explicit null/undefined check instead of !f.excess
                // This prevents overwriting valid 0 values with leader's value
                const hasNoExcessValue = f.excess === null || f.excess === undefined;
                const hasNoExcessBasis = f.excessBasisId === null || f.excessBasisId === undefined;

                if (hasNoExcessValue) {
                    f.excess = leaderExcessTotal;
                }
                if (hasNoExcessBasis) {
                    f.excessBasisId = leaderExcessExcessBasis;
                }
            }
        });
    }
}
