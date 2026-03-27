import { Injectable } from "@angular/core";
import { Quote, QuoteState } from "@app/models";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserService } from "@app/services/user.service";

@Injectable()
export class WarningService {
    constructor(
        private readonly underwriterCoverageAuthorityService: UnderwriterCoverageAuthorityService,
        private readonly underwriterActivityValidationService: UnderwriterActivityValidationService,
        private readonly underwriterRiskValidationService: UnderwriterRiskValidationService,
        private readonly underwriterDiscountAuthorityService: UnderwriterDiscountAuthorityService,
        private readonly userService: UserService
    ) { }

    public hasWarning(quote: Quote): boolean {
        if (quote.state >= QuoteState.Approved) {
            return false;
        }

        return !this.underwriterCoverageAuthorityService.hasValidCoveragesLimitAuthority(quote.coverages)
            || this.underwriterActivityValidationService.doActivityDetailsHaveWarning(quote.activities)
            || !this.underwriterRiskValidationService.hasValidRiskAnswers(undefined)
            || this.underwriterDiscountAuthorityService.hasPricingDiscountWarning(quote.pricingInformation)
            || !this.userService.isLocationAllowedToBind(quote.client.primaryLocation.country.isoCode, quote.client.primaryLocation.stateProvinceCode);
    }
}
