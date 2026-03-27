import { BusinessLinePremium } from "@app/quote/models/Fees/BusinessLinePremium";

export class FeeResponse { 
    public businessLineFees: BusinessLinePremium[];
    public totalFee: number;
    public currencyIsoCode: string;
    public errorMessage: string;  
}
