import { FinancialTransactionDetail, CfcBankAccount, FinancialLedgerInfo, Currency } from "@app/models";
import { OutstandingFund } from "@app/finance/models/OutstandingFund";

export class TransactionModalContext {
    public outstandingFund: OutstandingFund;
    public financialTransactionDetail: FinancialTransactionDetail;
    public cfcBankAccount: CfcBankAccount;
    public financialLedger: FinancialLedgerInfo;
    public originalCurrency: Currency;
}
