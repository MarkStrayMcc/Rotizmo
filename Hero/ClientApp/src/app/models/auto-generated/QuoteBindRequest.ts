
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
import { CommissionInformation } from "@app/quote/models/pricing/CommissionInformation";
import { PolicyLocationPremiums } from "@app/quote/models/pricing/PolicyLocationPremiums";
export class QuoteBindRequest { 
    public insuredLocation: Models.ClientLocation;
    public product: Models.Product;
    public premium: number; 
    public quoteId: number;
    public cfcContactId: number;
    public inceptionDate: Date;
    public expiryDate: Date;
    public receivedDate: Date;
    public totalPremium: number;
    public surplusLineBroker: Models.SurplusLine;
    public localBroker: Models.BrokerTeam;
    public commissionInformation: CommissionInformation;
    public quoteSubjectivities: Models.QuoteSubjectivity[];
    public pricingInformation: Models.PricingInformation[];
    public australianBusinessNumber: string;
    public brokerTeam: Models.BrokerTeam; 
    public isDirectBilling: boolean;
    public payment: Models.Payment;
    public policyLocationPremiums: PolicyLocationPremiums[];
    public currency : Models.Currency;
}
