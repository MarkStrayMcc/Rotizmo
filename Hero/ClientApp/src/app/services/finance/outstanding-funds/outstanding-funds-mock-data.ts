import { OutstandingFundsResponse, OutstandingFundContributionsResponse, MultipleOperationsResultProblemDetails, OutstandingFundsTransferResponse } from "@app/models";

export const OFUNDS_SLA_MOCK_RESPONSE: OutstandingFundsResponse = {
    outstandingFunds: [
        {
            outstandingFundId: 4,
            cfcBankAccount: "CFCUCA-AUDC",
            ledgerReference: "SLA15053i",
            binderDescription: "SME Cyber (EU)",
            transactionReference: "test",
            transactionType: "CC",
            tags: "JUL20",
            tpaFee: true,
            currencyIsoCode: "AUD",
            totalAmount: 6300.00,
            outstandingAmount: 38700.00,
            category: "TPA Fee",
            sectionShortCode: "1",
            lloydsRiskCode: "CY",
            binderYear: "i",
            notes: null,
            sectionId: null
        }
    ]
};

export const OFUNDS_MOCK_SAME_BANK_ACCOUNT_DIFFERENT_LEDGERS: OutstandingFundsResponse = {
    outstandingFunds: [
        {
            outstandingFundId: 4,
            cfcBankAccount: "CFCUCA-AUDC",
            ledgerReference: "SLA15053i",
            binderDescription: "SME Cyber (EU)",
            transactionReference: "test",
            transactionType: "CC",
            tags: "JUL20",
            tpaFee: true,
            currencyIsoCode: "AUD",
            totalAmount: 6300.00,
            outstandingAmount: 38700.00,
            category: "TPA Fee",
            sectionShortCode: "a",
            lloydsRiskCode: "CX",
            binderYear: "h",
            notes: "some notes",
            sectionId: 123
        },
        {
            outstandingFundId: 9,
            cfcBankAccount: "CFCUCA-AUDC",
            ledgerReference: "BA059760a",
            binderDescription: "SME Cyber (EU)",
            transactionReference: "Test",
            transactionType: "CC",
            tags: null, tpaFee: false, currencyIsoCode: "AUD",
            totalAmount: 100.00, outstandingAmount: -100.00, category: "",
            sectionShortCode: "b",
            lloydsRiskCode: "CI",
            binderYear: "j",
            notes: "some other notes",
            sectionId: 456
        }
    ]
};

export const OFUNDS_MOCK_BANK_ACCOUNT_LEDGER_CURRENCY: OutstandingFundsResponse = {
    outstandingFunds: [
        {
            outstandingFundId: 9,
            cfcBankAccount: "CFCUCA-AUDC",
            ledgerReference: "BA059760a",
            binderDescription: "SME Cyber (EU)",
            transactionReference: "Test",
            transactionType: "CC",
            tags: null, tpaFee: false, currencyIsoCode: "AUD",
            totalAmount: 100.00, outstandingAmount: -100.00, category: "",
            sectionShortCode: "1",
            lloydsRiskCode: "CY",
            binderYear: "i",
            notes: "some notes here",
            sectionId: 123
        }
    ]
};

export const OFUNDSCONTRIB_MOCK_SINGLE_RESPONSE: OutstandingFundContributionsResponse = {
    outstandingFundContributions: [
        {
            outstandingFundId: 1,
            carrierReferenceId: 2,
            originalAmount: 45000,
            bankAccountAmount: 4500,
            marketTypeId: 2,
            carrierName: "some carrier",
            financialTransactionId: 23,
            originalCurrencyIsoCode: "USD",
            bankAccountCurrencyIsoCode: "USD"
        },
        {
            outstandingFundId: 1,
            carrierReferenceId: 4,
            originalAmount: 45000,
            bankAccountAmount: 6500,
            marketTypeId: 2,
            carrierName: "some other carrier",
            financialTransactionId: 56,
            originalCurrencyIsoCode: "USD",
            bankAccountCurrencyIsoCode: "USD"
        }
    ]
};

export const OFUNDSTRANSFER_SUCCESSFUL_RESPONSE: OutstandingFundsTransferResponse = {
    successes: [1, 2]
};

export const OFUNDSTRANSFER_SUCCESSFUL_AND_ERRORS_RESPONSE = new MultipleOperationsResultProblemDetails();
OFUNDSTRANSFER_SUCCESSFUL_AND_ERRORS_RESPONSE.failures = [{ id: 3, reason: "Database Error" }, { id: 4, reason: "validation error" }];
OFUNDSTRANSFER_SUCCESSFUL_AND_ERRORS_RESPONSE.successes = [1, 2];
OFUNDSTRANSFER_SUCCESSFUL_AND_ERRORS_RESPONSE.status = 500;
