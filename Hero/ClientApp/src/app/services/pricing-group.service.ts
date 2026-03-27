import { Injectable } from "@angular/core";
import { PricingGroup, Coverage } from "@app/models";
import { PricingGroupStatus } from "@app/quote/view-models/PricingGroupStatus";

//This should be moved in the core api
@Injectable()
export class PricingGroupService {
    private pricingGroupStatus: PricingGroupStatus;

    public addQuotedLimitExcessValuesToSliders(pricingGroup: PricingGroup, coverages: Coverage[], leadLimitValues: any, leadExcessValues: any): PricingGroupStatus  {

        let leadLimitValue = 0;
        let leadExcessValue = 0;
        let limitExcessLeader = pricingGroup.pricingGroupLimitExcessLeaders.find(p => p.pricingGroupId === pricingGroup.pricingGroupId);
        this.pricingGroupStatus = null;

        if (limitExcessLeader != null) {
            leadLimitValue = this.getLeadLimitValue(coverages, limitExcessLeader.leadLimitCode, 0);
            leadExcessValue = this.getLeadExcessValue(coverages, limitExcessLeader.leadExcessCode, 0);

            leadLimitValues[pricingGroup.pricingGroupId] = leadLimitValue;
            leadExcessValues[pricingGroup.pricingGroupId] = leadExcessValue;

            let limitInAllowedRange =
                this.checkLimitWithinBoundaries(pricingGroup, leadLimitValue);

            this.checkExcessWithinBoundaries(pricingGroup, leadExcessValue);

            if ((pricingGroup.pricingGroupLimitSteps.indexOf(leadLimitValue) === -1) && limitInAllowedRange) {
                pricingGroup.pricingGroupLimitSteps.push(leadLimitValue);
            }

            this.processExcessSteps(leadExcessValue, pricingGroup);

        } else {
            this.pricingGroupStatus = {
                pricingGroupLimitExcessLeaderExists :false,
                isPublishable: false,
                isLimitOrExcessWithinRange:false
            }
        }

        return this.pricingGroupStatus;
    }

    private processExcessSteps(leadExcessValue: number, pricingGroup: PricingGroup) {

        if (!leadExcessValue || leadExcessValue === 0)
            leadExcessValue = pricingGroup.defaultExcessValue;

        let n = pricingGroup.pricingGroupExcessSteps.length;

        for (let i = 0; i < n; i++) {
            pricingGroup.pricingGroupExcessSteps[i] = pricingGroup.pricingGroupExcessSteps[i] * leadExcessValue;
        }

        if (pricingGroup.pricingGroupExcessSteps[n - 1] < pricingGroup.maxExcess) {
            pricingGroup.maxExcess = pricingGroup.pricingGroupExcessSteps[n - 1];
        }

        if (pricingGroup.pricingGroupExcessSteps[0] > pricingGroup.minExcess) {
            pricingGroup.pricingGroupExcessSteps.splice(0, 0, pricingGroup.minExcess);
        }

    }

    private getLeadLimitValue(coverages: Coverage[], limitLeaderCode: string, defaultValue: number): number {

        let leadLimitValue = defaultValue;

        for (let coverage of coverages) {

            if (coverage.coverageType.isAdditionalCoverage) {
                continue;
            }

            if (coverage.childCoverages) {
                leadLimitValue = this.getLeadLimitValue(coverage.childCoverages, limitLeaderCode, leadLimitValue);
            }

            if (coverage.limits) {
                for (let limit of coverage.limits) {
                    if (limit.coverageLimitType.limitTypeCode === limitLeaderCode) {
                        return limit.limit;
                    }
                }
            }
        }
        return leadLimitValue;
    }

    private getLeadExcessValue(coverages: Coverage[], excessLeaderCode: string, defaultValue: number): number {

        let leadExcessValue = defaultValue;

        for (let coverage of coverages) {

            if (coverage.coverageType.isAdditionalCoverage) {
                continue;
            }

            if (coverage.childCoverages) {
                leadExcessValue = this.getLeadExcessValue(coverage.childCoverages, excessLeaderCode, leadExcessValue);
            }

            if (coverage.excesses) {
                for (let excess of coverage.excesses) {
                    if (excess.excessType.excessTypeCode === excessLeaderCode) {
                        return excess.excess;
                    }
                }
            }
        }
        return leadExcessValue;
    }

    private checkExcessWithinBoundaries(pricingGroup: PricingGroup, quotedLeadExcessValue: number): void {

        if (quotedLeadExcessValue < pricingGroup.minExcess || quotedLeadExcessValue > pricingGroup.maxExcess) {
            this.pricingGroupStatus = {
                pricingGroupLimitExcessLeaderExists: true,
                isPublishable: false,
                isLimitOrExcessWithinRange: false
            }
        }
    }

    private checkLimitWithinBoundaries(pricingGroup: PricingGroup, quotedLeadLimitValue: number): boolean {

        if (quotedLeadLimitValue < pricingGroup.minLimit || quotedLeadLimitValue > pricingGroup.maxLimit) {
            this.pricingGroupStatus = {
                pricingGroupLimitExcessLeaderExists: true,
                isPublishable: false,
                isLimitOrExcessWithinRange: false
            }
            return false;
        }
        return true;
    }

}
