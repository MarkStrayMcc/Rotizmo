
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class PricingGroup { 
    public isEditable: boolean;
    public increasedLimitFactor: string; 
    public pricingGroupId: number;
    public productId: number;
    public title: string;
    public minLimit: number;
    public maxLimit: number;
    public minExcess: number;
    public maxExcess: number;
    public defaultMinLimit: number;
    public defaultMaxLimit: number;
    public defaultMinExcess: number;
    public defaultMaxExcess: number;
    public defaultExcessValue: number;
    public increasedLimitFactors: string[];
    public pricingGroupLimitSteps: number[];
    public pricingGroupExcessSteps: number[];
    public pricingGroupLimitExcessLeaders: Models.PricingGroupLimitExcessLeader[]; 
}
