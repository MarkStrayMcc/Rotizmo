import { Coverage, CoverageLimit } from '@app/models';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';

export function getLimitValue(coverages: Coverage[], limitTypeCode: string): CoverageLimit {
    for (let coverage of coverages) {
        for (let childCoverage of coverage.childCoverages) {
            return childCoverage.limits.find((limit) => limit.coverageLimitType.limitTypeCode == limitTypeCode);
        }
    }
    return null;
}

export function sumFloatingValues(floatingValue: PropertyLimitFloatingValues): number {
    if (!floatingValue) {
        return 0;
    }
    return (floatingValue.contentsDamageLimit ?? 0) +
        (floatingValue.actualLossSustainedLimit ?? 0) +
        (floatingValue.increasedCostOfWorkingLimit ?? 0) +
        (floatingValue.lossOfRentLimit ?? 0) +
        (floatingValue.alternativeAccommodationLimit ?? 0);
}
