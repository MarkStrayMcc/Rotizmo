import {
    CfcBankAccount,
    FinancialLedgerInfo,
    Currency,
    DropDownItem,
    BinderSectionParticipation,
    Carrier,
    OutstandingFundContribution,
    OutstandingFundContributionsResponse
} from "@app/models";

export function getTestBinderSectionParticipation() {
    return [
        {
            binderDescription: "Specialty Liability",
            sectionShortCode: "H1",
            sectionDescription: "US Property",
            sectionId: 123,
            binderYear: "i",
            carriers: [
                {
                    carrierName: "Peleus Insurance Company",
                    participationPercent: 20,
                    syndicates: []
                } as Carrier,
                {
                    carrierName: "Fidelis Underwriting Limited",
                    participationPercent: 25,
                    syndicates: []
                } as Carrier,
                {
                    carrierName: "Lloyds",
                    participationPercent: 55,
                    syndicates: [
                        {
                            shortName: "XLC 2003",
                            participationPercent: 20
                        },
                        {
                            shortName: "ASP 4711",
                            participationPercent: 10
                        },
                        {
                            shortName: "AMA 1200",
                            participationPercent: 10
                        },
                        {
                            shortName: "AXS 1686",
                            participationPercent: 7.5
                        },
                        {
                            shortName: "MKL 3000",
                            participationPercent: 5
                        },
                        {
                            shortName: "HDU 382",
                            participationPercent: 2.5
                        }
                    ]
                } as Carrier
            ]
        } as BinderSectionParticipation
    ];
}

export function getAllTestCfcBankAccounts(): CfcBankAccount[] {
    return [
        {
            cfcBankAccountId: 2,
            bankAccountName: "CFCUCA-EURC",
            bankAccountType: "Non Loss Fund",
            bankAccountCurrencyId: 1,
            bankAccountCurrencyName: "EUR"
        } as CfcBankAccount,
        {
            cfcBankAccountId: 1,
            bankAccountName: "CFCBANK009876-GBPA",
            bankAccountType: "Non Loss Fund",
            bankAccountCurrencyId: 2,
            bankAccountCurrencyName: "GBP"
        } as CfcBankAccount,
        {
            cfcBankAccountId: 3,
            bankAccountName: "Another-EURC",
            bankAccountType: "Loss Fund",
            bankAccountCurrencyId: 1,
            bankAccountCurrencyName: "EUR"
        } as CfcBankAccount,
        {
            cfcBankAccountId: 4,
            bankAccountName: "Whatever-GBPC",
            bankAccountType: "Loss Fund",
            bankAccountCurrencyId: 2,
            bankAccountCurrencyName: "GBP"
        } as CfcBankAccount,
        {
            cfcBankAccountId: 5,
            bankAccountName: "24159607",
            bankAccountType: "TPA Fee",
            bankAccountCurrencyId: 2,
            bankAccountCurrencyName: "GBP"
        }
    ];
}

export function getTestLedgerReferencesInfo(): FinancialLedgerInfo[] {
    return [
        {
            financialLedgerId: 398,
            ledgerReference: "SLA15053i",
            binderId: 1,
            binderYear: "i",
            sectionId: 1,
            lloydsRiskCode: null,
            description: null,
            binderDescription: "Specialty Liability",
            allowedLloydsRiskCodes: ["E3", "E5", "E7", "E9"],
            shortCode: "H1",
            binderYearNo: 2019
        } as FinancialLedgerInfo,
        {
            financialLedgerId: 315,
            ledgerReference: "BA090080Y",
            binderId: 2,
            binderYear: "f",
            sectionId: 1,
            lloydsRiskCode: null,
            description: null,
            binderDescription: "BroSurance for brothers",
            allowedLloydsRiskCodes: ["B3", "B5", "B7", "B9"],
            shortCode: "B",
            binderYearNo: 2001
        } as FinancialLedgerInfo
    ];
}

export function createCurrencyLookup(id: number, isoCode: string) {
    const result = new Currency();
    result.id = id;
    result.isoCode = isoCode;
    return result;
}

export function getTestCurrencyDropdownItems() {
    return [
        {
            value: "1",
            text: "€ | EUR | Euro",
            img: null,
            hidden: null
        } as DropDownItem,
        {
            value: "2",
            text: "$ | USD | United States Dollars",
            img: null,
            hidden: null
        } as DropDownItem,
        {
            value: "5",
            text: "$ | AUD | Australian Dollars",
            img: null,
            hidden: null
        } as DropDownItem
    ];
}

export function getTestOutstandingFundContributionResponse(): OutstandingFundContributionsResponse {
    return {
        outstandingFundContributions: [
            {
                bankAccountAmount: 100,
                bankAccountCurrencyIsoCode: "AUD",
                carrierName: "Peleus Insurance Company",
                carrierReferenceId: 99,
                financialTransactionId: 1038446,
                marketTypeId: 2,
                originalAmount: 100,
                originalCurrencyIsoCode: "AUD",
                outstandingFundId: 24
            } as OutstandingFundContribution,
            {
                bankAccountAmount: 50,
                bankAccountCurrencyIsoCode: "AUD",
                carrierName: "Zurich Insurance Inc.",
                carrierReferenceId: 99,
                financialTransactionId: 1038456,
                marketTypeId: 2,
                originalAmount: 50,
                originalCurrencyIsoCode: "AUD",
                outstandingFundId: 24
            } as OutstandingFundContribution
        ]
    } as OutstandingFundContributionsResponse;
}
