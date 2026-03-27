import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from "@angular/core";

import { Coverage, CoverageExcess, CoverageLimit, CoverageType } from "@app/models";
import { LeadLimitConfiguration } from '../models/extendedModels/LeadLimitConfiguration';
import { LeadExcessConfiguration } from '../models/extendedModels/LeadExcessConfiguration';
import { CoverageItem } from '../quote/view-models/CoverageItem';

@Injectable()
export class CoverageCalculationService {

    public calculateLeadLimitValue(config: LeadLimitConfiguration) {

        let leaderTotal = 0;

        for (var leader of config.leaders) {
            if (!leader) {
                continue;
            }

            leaderTotal += leader.limit;
        }

        return Math.round(leaderTotal * config.multiplicationFactor);
    }

    public calculateLeadExcessValue(config: LeadExcessConfiguration) {

        let leaderTotal = 0;

        for (var leader of config.leaders) {
            if (!leader) {
                continue;
            }

            leaderTotal += leader.excess;
        }

        return Math.round(leaderTotal * config.multiplicationFactor);
    }

    public calculateLeadDefaultLimitValue(config: LeadLimitConfiguration) {

        let leadDefaultTotal = 0;

        for (var leader of config.leaders) {

            if (!leader) {
                continue;
            }

            leadDefaultTotal += leader.coverageLimitType.defaultLimit;
        }

        return Math.round(leadDefaultTotal * config.multiplicationFactor);
    }

    public calculateLeadDefaultExcessValue(config: LeadExcessConfiguration) {

        let leadDefaultTotal = 0;

        for (var leader of config.leaders) {
            if (!leader) {
                continue;
            }

            leadDefaultTotal += leader.excessType.defaultExcess;
        }

        return Math.round(leadDefaultTotal * config.multiplicationFactor);
    }

    public getLeadLimitValue(limit: CoverageLimit, coverageItem: CoverageItem): number {
        const leadLimitTypeCodes = limit.coverageLimitType.followLimitCodes;
        if (!leadLimitTypeCodes || !leadLimitTypeCodes.length) {
            return null;
        }

        let leadLimitValue = 0;

        for (var code of leadLimitTypeCodes) {
            const leadLimit = coverageItem.leadLimits[code];
            leadLimitValue += leadLimit.limit;
        }
        return leadLimitValue;
    }

    public getLeadLimitBasis(limit: CoverageLimit, coverageItem: CoverageItem): number {
        const leadLimitTypeCodes = limit.coverageLimitType.followLimitCodes;

        if (!leadLimitTypeCodes || !leadLimitTypeCodes.length) {
            return null;
        }

        const leadLimit = coverageItem.leadLimits[leadLimitTypeCodes[0]];

        return leadLimit.limitBasis;
    }

    public getLeadCostBasis(limit: CoverageLimit, coverageItem: CoverageItem): number {
        const leadLimitTypeCodes = limit.coverageLimitType.followLimitCodes;

        if (!leadLimitTypeCodes || !leadLimitTypeCodes.length) {
            return null;
        }

        const leadLimit = coverageItem.leadLimits[leadLimitTypeCodes[0]];

        return leadLimit.costBasis;
    }

    public getLeadLimits(limit: CoverageLimit, coverageItem: CoverageItem): CoverageLimit[] {
        const leadLimitTypeCodes = limit.coverageLimitType.followLimitCodes;
        if (!leadLimitTypeCodes || !leadLimitTypeCodes.length) {
            return null;
        }
        const leaders = [];

        for (var code of leadLimitTypeCodes) {
            const leadLimit = coverageItem.leadLimits[code];
            if (leadLimit) {
                leaders.push(leadLimit)
            }
        }

        if (leaders && leaders.length > 0) {
            return leaders;
        }
        return null;
    }

    public getLeadExcessValue(excess: CoverageExcess, coverageItem: CoverageItem): number {
        const leadExcessTypeCodes = excess.excessType.followExcessCodes;
        if (!leadExcessTypeCodes || !leadExcessTypeCodes.length) {
            return null;
        }

        let leadExcessValue = 0;

        for (var code of leadExcessTypeCodes) {
            const leadExcess = coverageItem.leadExcesses[code];
            leadExcessValue += leadExcess.excess;
        }
        return leadExcessValue;
    }

    public getLeadExcessBasis(excess: CoverageExcess, coverageItem: CoverageItem): number {
        const leadExcessTypeCodes = excess.excessType.followExcessCodes;

        if (!leadExcessTypeCodes || !leadExcessTypeCodes.length) {
            return null;
        }

        const leadExcess = coverageItem.leadExcesses[leadExcessTypeCodes[0]];

        return leadExcess.excessBasisId;
    }

    public getLeadExcesses(excess: CoverageExcess, coverageItem: CoverageItem): CoverageExcess[] {
        const leadExcessTypeCodes = excess.excessType.followExcessCodes;
        if (!leadExcessTypeCodes || !leadExcessTypeCodes.length) {
            return null;
        }
        const leaders = [];

        for (var code of leadExcessTypeCodes) {
            const leadExcess = coverageItem.leadExcesses[code];
            leaders.push(leadExcess)
        }

        if (leaders && leaders.length > 0) {
            return leaders;
        }
        return null;
    }
}
