import { CfcBankAccount, FinancialLedgerInfo, DropDownItem, Carrier } from "@app/models";
import * as moment from "moment";
import { CfcBankAccountCurrency } from "@finance/shared/cfc-bank-account-currency";
import { CarrierContribution } from "./CarrierContribution";

export class AddTransactionFormValue {
    public cfcBankAccountId: CfcBankAccount;
    public paidDate = moment();
    public transactionType: string;
    public financialLedgerId: FinancialLedgerInfo;
    public bankAccountCurrencyId: CfcBankAccountCurrency;
    public totalAccountAmount: number;
    public entryType: string;
    public binderDescription: string;
    public binderYear: string;
    public sectionShortCode: string;
    public lloydsRiskCode: string;
    public transactionReference: string;
    public tags: string[];
    public tpaFee: boolean;
    public carrierContributions: Array<CarrierContribution>;
    public remainingCarriers: Carrier[];
    public carrier: Carrier;
    public notes: string;
    public carrierParticipationPercentage: number;
}
