import { Injectable } from "@angular/core";
import { Coverage, CoverageLimit, Quote, QuoteState, UnderwriterRoleLimitValidationRule } from "@app/models";
import { Currency } from "@app/models/auto-generated/Currency";
import { QuoteService } from "@app/quote/services/quote.service";
import { LimitRuleFilter } from "@app/quote/view-models/LimitRuleFilter";
import { UserService } from "@app/services/user.service";
import { cloneDeep } from "lodash";
import { Observable, Subject } from "rxjs";

@Injectable()
export class UnderwriterCoverageAuthorityService {
    private readonly bindState = QuoteState.Bound;
    private warningEvent = new Subject<boolean>();
    private warningDictionary: { [key: number]: string; } = {};
    private isWarningEnabled: boolean = false;
    private quote: Quote;
    private gbpCurrencyIsoCode: string = "GBP";

    constructor(
        private readonly userService: UserService,
        private readonly quoteService: QuoteService) {
    }

    public setQuote(quote: Quote) {
        this.quote = quote;
    }

    public setWarningStatus(key: string, isWarningEnabled: boolean) {
        this.warningDictionary[key] = isWarningEnabled;
        this.checkWarningStatus();
    }

    public getWarningEvent(): Observable<boolean> {
        return this.warningEvent.asObservable();
    }

    public getCoverageForLimit(limitTypeCode: string) {
        if (!this.quote && !this.quote.coverages) {
            return;
        }

        const limit = this.quote.coverages.map(coverage => coverage?.childCoverages.map(childCoverage => childCoverage?.limits.find(limit => {
            if (limit.coverageLimitType.limitTypeCode === limitTypeCode) {
                return childCoverage;
            }
        })));
    }

    public hasValidLimitAuthority(limit: CoverageLimit, limitRuleFilter: LimitRuleFilter) {
        const underwriterRoleLimitValidationRule: UnderwriterRoleLimitValidationRule = this.getLimitAuthorityRuleByFilters(limitRuleFilter);
        let hasValidLimitAuthority = true;

        const isAnyOneClaim = +limit.limitBasis === 1;
        const isAboveMaxLimit = underwriterRoleLimitValidationRule && limit.limit > underwriterRoleLimitValidationRule.maxLimit;
        const shouldWarnAboutInvalidLimitAuthority = !underwriterRoleLimitValidationRule || (isAboveMaxLimit && isAnyOneClaim);
        if (shouldWarnAboutInvalidLimitAuthority) {
            hasValidLimitAuthority = false;
        }
        return hasValidLimitAuthority;
    }

    public hasValidCoveragesLimitAuthority(coverages: Coverage[]): boolean {
        for (const coverage of coverages) {
            if (!coverage.childCoverages) continue;
            for (const childCoverage of coverage.childCoverages) {
                if (!coverage.limits) continue;
                for (const limit of childCoverage.limits) {
                    const limitRuleFilter: LimitRuleFilter = this.getLimitAuthorityRuleFilter(
                        coverage.coverageType.businessLine.name,
                        coverage.coverageType.insuringClauseCode.name,
                        childCoverage.coverageType.insuringClauseSectionCode.name,
                        limit.coverageLimitType.limitTypeCode,
                        this.quoteService.getCurrency());

                    if (!this.hasValidLimitAuthority(limit, limitRuleFilter)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    public getLimitAuthorityRuleFilter(
        businessLine: string,
        insuringClauseCode: string,
        insuringClauseSectionCode: string,
        limitCode: string,
        currency: Currency): LimitRuleFilter {

        const filters = new LimitRuleFilter();
        filters.businessLineCode = businessLine;
        filters.insuringClauseCode = insuringClauseCode;
        filters.insuringClauseSectionCode = insuringClauseSectionCode;
        filters.limitTypeCode = limitCode;
        filters.currency = currency;
        return filters;
    }

    public getLimitAuthorityRuleByFilters(filters: LimitRuleFilter): UnderwriterRoleLimitValidationRule {
        const user = cloneDeep(this.userService.getUser());

        if (!user || !user.roles || user.roles.length === 0) {
            return null;
        }

        let rules = new Array<UnderwriterRoleLimitValidationRule>();
        for (const role of user.roles) {
            if (role.limitValidationRules && role.limitValidationRules.length > 0) {
                rules = rules.concat(role.limitValidationRules);
            }
        }

        const ruleResult = this.getBestMatchLimitRule(rules, filters);
        return ruleResult;
    }

    public isBoundQuote(): boolean {
        return this.quote && this.quote.state === this.bindState;
    }

    public isApprovedQuote(): boolean {
        return this.quote && this.quote.state >= QuoteState.Approved;
    }

    private getBestMatchLimitRule(rules: UnderwriterRoleLimitValidationRule[], filters: LimitRuleFilter): UnderwriterRoleLimitValidationRule {

        if (!rules || rules.length === 0) {
            return null;
        }

        rules = rules.filter(r =>
            (r.businessLineCode === null || r.businessLineCode === filters.businessLineCode)
            && (r.insuringClauseCode === null || r.insuringClauseCode === filters.insuringClauseCode)
            && (r.insuringClauseSectionCode === null || r.insuringClauseSectionCode === filters.insuringClauseSectionCode)
            && (r.limitTypeCode === null || r.limitTypeCode === filters.limitTypeCode)
        );

        if (rules.length === 0) return null;

        let currencySpecificRules = rules.filter(rule => rule.currencyIsoCode === filters.currency.isoCode);
        let generalRules = rules.filter(rule => rule.currencyIsoCode === this.gbpCurrencyIsoCode || !rule.currencyIsoCode);

        if (currencySpecificRules && currencySpecificRules.length > 0) {
            return currencySpecificRules.sort((r1, r2) => r1.maxLimit - r2.maxLimit)[0];
        } else if (generalRules && generalRules.length > 0) {
            let selectedRule = generalRules.sort((r1, r2) => r1.maxLimit - r2.maxLimit)[0];
            selectedRule.maxLimit = this.convertToQuoteCurrency(selectedRule.maxLimit, filters.currency.rate);
            return selectedRule;
        } else {
            return null;
        }
    }

    private convertToQuoteCurrency(value: number, quoteCurrencyRate: number): number {
        return value * quoteCurrencyRate;
    }

    private checkWarningStatus() {
        if (this.quote && this.quote.state === this.bindState) {
            return;
        }

        for (const key in this.warningDictionary) {
            const isEnabled = this.warningDictionary[key];
            if (this.isWarningEnabled && isEnabled) {
                return;
            }
            if (!this.isWarningEnabled && isEnabled) {
                this.raiseWarningEvent(true);
                return;
            }
        }

        if (this.isWarningEnabled) {
            this.raiseWarningEvent(false);
        }
    }

    private raiseWarningEvent(isEnabled: boolean) {
        this.isWarningEnabled = isEnabled;
        this.warningEvent.next(isEnabled);
    }
}
