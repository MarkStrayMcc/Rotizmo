import { Tag } from "@app/quote/models/pricing/Tag";
import { Binder } from "@app/quote/models/pricing/Binder";

export class PricingInformation {  
    public businessLine: Tag;
    public model: number;
    public suggested: number;
    public minimumPremium: number;
    public quoted: number;
    public discount: number;
    public isExpanded: boolean;
    public defaultFeePercentage: number;
    public fee: number;
    public binder: Binder;
    public binderSectionId: number;
    public isSelectedLine: boolean;
    public ratingEngineVersionId: number;
    public suggestedDiscount: number;
    public currentRateChangePremium: number;
    public expiringRateChangePremium: number;
    public expiringQuotedPremium: number;
    public rateChangePercentage: number;
    public filedPremium: number;
    public filedDiscount: number;
    public suggestedDiscountPercentage: number;
}
