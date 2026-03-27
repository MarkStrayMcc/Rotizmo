
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class PublishQuotePricingGroup {  
    public pricingGroupId: number;
    public productId: number;
    public pricingGroupUid: string;
    public productUid: string;
    public title: string;
    public minLimit: number;
    public maxLimit: number;
    public minExcess: number;
    public maxExcess: number;
    public premium: number;
    public increasedLimitFactor: string;
    public isMandatory: boolean;
    public isLimitEditable: boolean;
    public isExcessEditable: boolean;
    public fee: number;
    public leadLimitCode: string;
    public leadExcessCode: string;
    public pricingGroupLimitSteps: number[];
    public pricingGroupExcessSteps: number[];
    public quotePricingGroupRatings: Models.QuotePricingGroupRating[]; 
}
