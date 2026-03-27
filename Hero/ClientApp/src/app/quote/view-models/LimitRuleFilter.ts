import { Currency } from "@app/models/auto-generated/Currency";

export class LimitRuleFilter {
    public businessLineCode: string;
    public insuringClauseCode: string;
    public insuringClauseSectionCode: string;
    public limitTypeCode: string;
    public currency: Currency;
}
