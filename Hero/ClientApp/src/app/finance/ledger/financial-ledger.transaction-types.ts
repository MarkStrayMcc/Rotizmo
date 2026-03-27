import { FinancialTransactionType } from "@app/finance/ledger/financial-transaction-type";

export const FINANCIAL_TRANSACTION_TYPES: FinancialTransactionType[] = [
    {
        id: "MISC",
        name: "Misc"
    } as FinancialTransactionType,
    {
        id: "CC",
        name: "Cash Call"
    } as FinancialTransactionType,
    {
        id: "LF",
        name: "Loss Fund"
    } as FinancialTransactionType
];
