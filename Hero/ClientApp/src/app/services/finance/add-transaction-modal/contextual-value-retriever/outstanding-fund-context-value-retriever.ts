import { ContextualFormValueRetriever } from "./contextual-value-retriever";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { Observable, forkJoin } from "rxjs";
import { AddTransactionFormValue } from "../models/AddTransactionFormValue";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { map } from "rxjs/operators";
import {
    CfcBankAccount,
    FinancialLedgerInfo,
    Currency,
    DropDownItem,
    BinderSectionParticipation,
    OutstandingFundContributionsResponse,
    OutstandingFundContribution,
    Carrier
} from "@app/models";
import { OutstandingFund } from "@app/finance/models/OutstandingFund";
import * as moment from "moment";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";
import { CarrierContribution } from "@app/services/finance/add-transaction-modal/models/CarrierContribution";

export class OutstandingFundContextValueRetriever extends ContextualFormValueRetriever {
    constructor(private readonly cfcBankAccountHttpService: CfcBankAccountService,
                private readonly ledgerReferenceHttpService: LedgerReferenceHttpService,
                private readonly currencyService: CurrencyHttpService,
                private readonly dropdownService: DropdownService,
                private readonly binderSectionParticipationLookupService: BinderSectionParticipationLookupService,
                private readonly outstandingFundsHttpService: OutstandingFundsHttpService,
    ) {
        super();
    }

    private getCarrierContributions(
        outstandingFundContributions: OutstandingFundContribution[],
        binderSectionParticipation: BinderSectionParticipation,
        currencies: Currency[],
        currencyDropDownItems: DropDownItem[]
    ): Array<CarrierContribution> {
        const carrierContributions = new Array<CarrierContribution>();
        for (const ofc of outstandingFundContributions) {
            const participationForCarrier = binderSectionParticipation.carriers.find(carrier => carrier.carrierName === ofc.carrierName);
            if (participationForCarrier) {
                const originalCurrency = currencies.find(c => c.isoCode === ofc.originalCurrencyIsoCode);
                const bankAccountCurrency = currencies.find(c => c.isoCode === ofc.bankAccountCurrencyIsoCode);
                const originalCurrencyDisplayText = currencyDropDownItems.find(cddi => cddi.value.toString() === originalCurrency.id.toString()).text;

                carrierContributions.push({
                    carrierName: ofc.carrierName,
                    contributionPercentage: participationForCarrier.participationPercent,
                    accountAmount: ofc.bankAccountAmount,
                    originalAmount: ofc.originalAmount,
                    currencyDisplayText: originalCurrencyDisplayText,
                    accountCurrency: bankAccountCurrency,
                    originalCurrency
                } as CarrierContribution);
            }
        }

        return carrierContributions;
    }

    private getRemainingCarriers(carrierContributions: CarrierContribution[], binderSectionParticipation: BinderSectionParticipation): Carrier [] {
        return binderSectionParticipation
            .carriers
            .filter(bspc => !carrierContributions.some(cc => cc.carrierName === bspc.carrierName));
    }

    public getFormValue$(transactionModalContext: TransactionModalContext): Observable<AddTransactionFormValue> {
        return this.initialiseArraysOfStaticValues(transactionModalContext.outstandingFund);
    }

    private initialiseArraysOfStaticValues(outstandingFund): Observable<AddTransactionFormValue> {
        return forkJoin([
            this.cfcBankAccountHttpService
                .getBankAccounts(),
            this.ledgerReferenceHttpService
                .getLedgerReferences(),
            this.currencyService
                .getCurrencies(),
            this.dropdownService
                .getCurrencies(),
            this.binderSectionParticipationLookupService
                .getData(),
            this.outstandingFundsHttpService
                .getOutstandingFundCarrierContributions(outstandingFund.outstandingFundId)
        ]).pipe(map(results => {
            return this.createAddTransactionFormValues(results, outstandingFund);
        }));
    }

    private createAddTransactionFormValues(
        results: [
            CfcBankAccount[],
            FinancialLedgerInfo[],
            Currency[],
            DropDownItem[],
            BinderSectionParticipation[],
            OutstandingFundContributionsResponse
        ],
        outstandingFund: OutstandingFund
    ) {
        let cfcBankAccount: CfcBankAccount;
        let financialLedgerInfo: FinancialLedgerInfo;

        const bankAccounts: CfcBankAccount[] = results[0];
        const financialLedgerInfos: FinancialLedgerInfo[] = results[1];
        const currencies: Currency[] = results[2];
        const currenciesDropdownItems: DropDownItem[] = results[3];
        const binderSectionParticipations: BinderSectionParticipation[] = results[4];
        const outstandingFundCarrierContributions: OutstandingFundContributionsResponse = results[5];

        cfcBankAccount = bankAccounts.find(cba => cba.bankAccountName === outstandingFund.cfcBankAccount);
        financialLedgerInfo = financialLedgerInfos.find(fli => fli.ledgerReference === outstandingFund.ledgerReference);
        const ledgerBinderSectionParticipation = this.getLedgerBinderSectionParticipation(binderSectionParticipations,
            outstandingFund, financialLedgerInfo);
        const bankAccountCurrency = currencies.find(c => c.isoCode === outstandingFund.currencyIsoCode);
        const carrierContributions: CarrierContribution[] =
            this.getCarrierContributions(outstandingFundCarrierContributions.outstandingFundContributions,
                ledgerBinderSectionParticipation, currencies, currenciesDropdownItems);
        const remainingCarriers = this.getRemainingCarriers(carrierContributions, ledgerBinderSectionParticipation);

        const addTransFormValue: AddTransactionFormValue = {
            cfcBankAccountId: cfcBankAccount,
            paidDate: moment(),
            transactionType: outstandingFund.transactionType,
            financialLedgerId: financialLedgerInfo,
            bankAccountCurrencyId: {
                id: bankAccountCurrency.id,
                isoCode: bankAccountCurrency.isoCode,
                symbol: bankAccountCurrency.symbol
            },
            totalAccountAmount: outstandingFund.totalAmount,
            entryType: outstandingFund.totalAmount > 0 ? "DB" : "CR",
            binderDescription: financialLedgerInfo.binderDescription, // ofund "binderDescription" is actually a combination of several fields
            binderYear: outstandingFund.binderYear,
            sectionShortCode: outstandingFund.sectionShortCode,
            lloydsRiskCode: outstandingFund.lloydsRiskCode,
            transactionReference: outstandingFund.transactionReference,
            tags: outstandingFund.tags ? outstandingFund.tags.split(",") : [],
            tpaFee: outstandingFund.tpaFee,
            carrierContributions,
            remainingCarriers,
            carrier: null,
            carrierParticipationPercentage: null,
            notes: outstandingFund.notes
        };
        return addTransFormValue;
    }

    private getLedgerBinderSectionParticipation(binderSectionParticipations: BinderSectionParticipation[],
                                                outstandingFund: OutstandingFund,
                                                financialLedgerInfo: FinancialLedgerInfo){
        const filteredLedgerBinderSectionParticipation = binderSectionParticipations.filter(bsp =>
            bsp.binderDescription === financialLedgerInfo.binderDescription &&
            bsp.sectionShortCode === outstandingFund.sectionShortCode &&
            bsp.binderYear === outstandingFund.binderYear);

        if (!!outstandingFund.sectionId) {
            return filteredLedgerBinderSectionParticipation.find(bsp => bsp.sectionId === outstandingFund.sectionId)
        } else {
            return filteredLedgerBinderSectionParticipation[0];
        }
    }
}
