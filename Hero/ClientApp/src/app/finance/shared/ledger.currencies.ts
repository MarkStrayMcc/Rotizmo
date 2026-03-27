import { CfcBankAccountCurrency } from "@app/finance/shared/cfc-bank-account-currency";

export const LEDGER_CURRENCIES: CfcBankAccountCurrency[] = [
    {
        id: 5,
        isoCode: "AUD",
        symbol: "$"
    } as CfcBankAccountCurrency,
    {
        id: 4,
        isoCode: "CAD",
        symbol: "$"
    } as CfcBankAccountCurrency,
    {
        id: 1,
        isoCode: "EUR",
        symbol: "€"
    } as CfcBankAccountCurrency,
    {
        id: 3,
        isoCode: "GBP",
        symbol: "£"
    } as CfcBankAccountCurrency,
    {
        id: 2,
        isoCode: "USD",
        symbol: "$"
    } as CfcBankAccountCurrency
];
