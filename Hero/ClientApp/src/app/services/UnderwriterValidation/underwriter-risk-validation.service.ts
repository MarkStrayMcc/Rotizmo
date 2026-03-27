import { Injectable } from "@angular/core";
import { Operator } from "@app/enums/Operator";
import { UserService } from "@app/services/user.service";
import { RiskQuestionType } from "@app/enums/RiskQuestionType";
import {
    ActivityDetail,
    ActivityMap,
    CfcContact,
    RiskQuestionAnswer, UnderwriterRole,
    UnderwriterRoleRiskQuestionValidation
} from "@app/models";
import { Currency } from "@app/models/auto-generated/Currency";
import { QuoteService } from "@app/quote/services/quote.service";
import { cloneDeep } from "lodash";

@Injectable()
export class UnderwriterRiskValidationService {
    private gbpCurrencyIsoCode: string = "GBP";
    private selectedActivities: ActivityMap[] = [];
    private riskQuestionActivityValidation;

    constructor(private readonly userService: UserService,
        private quoteService: QuoteService) { }

    public hasValidRiskAnswers(step: number): boolean {
        let riskAnswers: RiskQuestionAnswer[] = this.quoteService.getRiskQuestionAnswers();

        if (!riskAnswers || riskAnswers.length === 0) {
            return true;
        }

        if (step) {
            riskAnswers = riskAnswers.filter(f => f.showOnStep === step);
        }

        for (const answer of riskAnswers) {
            const num = this.getNumberFromAnswer(answer);

            if (!num) continue;
            const isValid = this.isValidRiskQuestionAnswer(answer.riskQuestionTag, answer.riskQuestionType, num);
            if (!isValid) {
                return false;
            }
        }
        return true;
    }

    public isValidRiskQuestionAnswer(riskQuestionTag: string, riskQuestionType: RiskQuestionType, riskQuestionAnswerValue: number): boolean {
        // NOT CURRENCY
        if (!this.isCurrencyRiskQuestion(riskQuestionType)) {
            let validations = this.getRulesForRiskQuestionTag(riskQuestionTag);
            if (!riskQuestionAnswerValue || !validations || validations.length === 0) {
                return true;
            }
            return this.isValidNumber(riskQuestionAnswerValue, validations);
        }

        // NO RULES
        const rulesForRiskQuestionTag: UnderwriterRoleRiskQuestionValidation[] = this.getRulesForRiskQuestionTag(riskQuestionTag);

        if (!rulesForRiskQuestionTag || rulesForRiskQuestionTag.length === 0) {
            return true;
        }

        // GENERAL CURRENCY RULES
        const quoteCurrency: Currency = this.quoteService.getCurrency();

        // verify selected currency
        let rulesForSelectedCurrency = this.filterValidationsByCurrency(rulesForRiskQuestionTag, quoteCurrency);

        if (!rulesForSelectedCurrency || rulesForSelectedCurrency.length === 0) {
            return false;
        }

        let generalRulesForSelectedCurrency: UnderwriterRoleRiskQuestionValidation[] = rulesForSelectedCurrency.filter(rule => !rule.activityCode);

        // there's a currency activity rule, but no general currency rule - NO authority
        if (rulesForSelectedCurrency.length && !generalRulesForSelectedCurrency.length) {
            return false;
        }

        // check general currency rules and validate
        if (generalRulesForSelectedCurrency.length) {
            if (!this.isValidNumber(riskQuestionAnswerValue, generalRulesForSelectedCurrency)) {
                return false;
            }
        }

        // CURRENCY ACTIVITY RULES
        if (!this.riskQuestionActivityValidation) {
            return true;
        }

        let activitiesCurrencyRules: UnderwriterRoleRiskQuestionValidation[] = this.mapActivityValidation(this.riskQuestionActivityValidation);
        activitiesCurrencyRules = this.filterValidationsByCurrency(activitiesCurrencyRules, quoteCurrency);

        if (activitiesCurrencyRules && activitiesCurrencyRules.length > 0) {
            const isValidNumber = this.isValidNumberSplitByActivity(riskQuestionAnswerValue, activitiesCurrencyRules);
            if (!isValidNumber) {
                return false;
            }
        }

        return true;
    }

    private mapActivityValidation(activityValidation) {
        return activityValidation.map(activity => {
            activity.operator = activity.operatorId;
            return activity;
        });
    }

    public setRiskQuestionActivityValidation(riskQuestionActivityValidation) {
        this.riskQuestionActivityValidation = riskQuestionActivityValidation;
    }

    private isValidNumberSplitByActivity(riskQuestionAnswerValue, activitiesCurrencyRules) {
        return activitiesCurrencyRules.every(activity => {
            const percent: number = this.getActivityPercentage(activity.activityCode);
            const totalRevenueByActivity: number = riskQuestionAnswerValue * (percent / 100);
            return this.isValidNumber(totalRevenueByActivity, [activity])
        });
    }

    private getActivityPercentage(activityCode) {
        return this.quoteService.getActivities().find(quoteActivity => quoteActivity.activityMaps.find(activity => activity.code === activityCode)).percent;
    }

    private isCurrencyRiskQuestion(riskQuestionType): boolean {
        return riskQuestionType === RiskQuestionType.currency;
    }

    private getRulesForRiskQuestionTag(riskQuestionTag: string): UnderwriterRoleRiskQuestionValidation[] {
        const userProfile: CfcContact = cloneDeep(this.userService.getUser());

        if (!userProfile) {
            return null;
        }

        const roles: UnderwriterRole[] = userProfile.roles;

        if (!roles) {
            return null;
        }

        let list = new Array<UnderwriterRoleRiskQuestionValidation>();

        for (const role of roles) {
            if (role.riskQuestionValidations) {
                let validations = role.riskQuestionValidations.filter(x => x.riskQuestionTag === riskQuestionTag);

                list = list.concat(validations);
            }
        }

        return list;
    }

    private filterValidationsByCurrency(validations: UnderwriterRoleRiskQuestionValidation[], quoteCurrency: Currency): UnderwriterRoleRiskQuestionValidation[] {
        let currencySpecificValidations = validations.filter(validation => validation.currencyIsoCode === quoteCurrency.isoCode);
        let generalValidations = validations.filter(rule => (rule.currencyIsoCode === this.gbpCurrencyIsoCode || !rule.currencyIsoCode));

        if (currencySpecificValidations && currencySpecificValidations.length > 0) {
            return currencySpecificValidations;
        }

        if (generalValidations && generalValidations.length > 0) {
            for (const validation of generalValidations) {
                validation.value = this.convertValueToQuoteCurrency(parseInt(validation.value), quoteCurrency.rate).toString();
            }
            return generalValidations;
        } else {
            return null;
        }
    }

    private convertValueToQuoteCurrency(value: number, currencyRate: number): number {
        return value * currencyRate;
    }

    private isValidNumber(value: number, validations: UnderwriterRoleRiskQuestionValidation[]): boolean {
        if (!value || !validations || validations.length === 0) {
            return true;
        }

        const lowerOperators = [Operator.LessThan, Operator.LessThanOrEqualTo];
        const lowerValidations = this.getValidationsByOperators(validations, lowerOperators);
        const hasLowerRules = lowerValidations && lowerValidations.length > 0;
        if (hasLowerRules && !this.isValidNumberForAnyRule(value, lowerValidations)) {
            return false;
        }

        const upperOperators = [Operator.GreaterThan, Operator.GreaterThanOrEqualTo];
        const upperValidations = this.getValidationsByOperators(validations, upperOperators);
        const hasUpperRules = upperValidations && upperValidations.length > 0;

        if (hasUpperRules && !this.isValidNumberForAnyRule(value, upperValidations)) {
            return false;
        }

        if (hasLowerRules || hasUpperRules) {
            return true;
        }

        if (this.isValidNumberForAnyRule(value, validations)) {
            return true;
        }

        return false;
    }

    private getNumberFromAnswer(answer: RiskQuestionAnswer): number {
        if (answer.number) {
            return answer.number;
        }

        if (answer.currency) {
            return answer.currency;
        }

        if (answer.percentage) {
            return answer.percentage;
        }

        return null;
    }

    private getValidationsByOperators(
        validations: UnderwriterRoleRiskQuestionValidation[],
        operators: Operator[]): UnderwriterRoleRiskQuestionValidation[] {

        const list = new Array<UnderwriterRoleRiskQuestionValidation>();
        for (const v of validations) {
            for (const o of operators) {
                if (v.operator === o) {
                    list.push(v);
                }
            }
        }

        return list;
    }

    private isValidNumberForAnyRule(
        value: number,
        validations: UnderwriterRoleRiskQuestionValidation[]): boolean {
        for (const val of validations) {
            if (this.isValidNumberForRule(value, val)) {
                return true;
            }
        }
        return false;
    }

    private isValidNumberForRule(value: number, validation: UnderwriterRoleRiskQuestionValidation): boolean {
        const validationNumber: number = +validation.value;
        value = parseInt(value.toString().replace(/,/g, ''));
        
        switch (validation.operator) {
            case Operator.EqualTo:
                return value === validationNumber;
            case Operator.GreaterThan:
                return value > validationNumber;
            case Operator.GreaterThanOrEqualTo:
                return value >= validationNumber;
            case Operator.LessThan:
                return value < validationNumber;
            case Operator.LessThanOrEqualTo:
                return value <= validationNumber;
            case Operator.Distinct:
                return value !== validationNumber;
        }
        return false;
    }

    public setSelectedActivities() {
        this.selectedActivities = [];
        const quoteActivities: ActivityDetail[] = cloneDeep(this.quoteService.getActivities());
        quoteActivities.map(activity => this.setSelectedActivity(activity.activityMaps));
        return this.selectedActivities;
    }

    private setSelectedActivity(quoteActivities) {
        if (quoteActivities && quoteActivities.length > 0) {
            const root = [];
            // Cache found parent index
            const map = {};

            quoteActivities.forEach(activity => {
                // No parentActivityMapId means top level
                if (!activity.parentActivityMapId) return root.push(activity);

                // Insert node as child of parent in flat array
                let parentActivity = map[activity.parentActivityMapId];
                if (typeof parentActivity !== "number") {
                    parentActivity = quoteActivities.findIndex(el => el.activityMapId === activity.parentActivityMapId);
                    map[activity.parentActivityMapId] = parentActivity;
                }

                if (!quoteActivities[parentActivity].children) {
                    return quoteActivities[parentActivity].children = [activity];
                }

                quoteActivities[parentActivity].children.push(activity);
            });

            this.mapActivity(root);
        }
    }

    private mapActivity(activities) {
        activities.forEach(activity => {
            if (!activity.children) {
                this.selectedActivities.push(activity);
            } else {
                return this.mapActivity(activity.children);
            }
        });
    }
}
