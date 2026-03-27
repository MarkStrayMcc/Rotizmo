import { BusinessLinePremium } from "@app/quote/models/Fees/BusinessLinePremium";

export class FeeRequest { 
    public productName: string;
    public countryIsoCode: string;
    public stateIsoCode: string;
    public quoteType: string;
    public insuranceType: string;
    public programCode: string;
    public templateCode: string;
    public origin: string;
    public currencyIsoCode: string;
    public exchangeRate: number;
    public totalFee: number;
    public effectiveCommission: number;
    public standardCommission: number;
    public brokerGroupId: number;
    public businessLinePremiums: BusinessLinePremium[];  
}
