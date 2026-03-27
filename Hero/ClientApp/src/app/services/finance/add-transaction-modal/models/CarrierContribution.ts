import { Currency, DropDownItem } from "@app/models";

export class CarrierContribution {
    carrierName: string;
    contributionPercentage: number;
    accountAmount: number;
    accountCurrency: Currency;
    currencyDisplayText: string;
    originalAmount: number;
    originalCurrency: Currency;
}
