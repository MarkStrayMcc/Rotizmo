import { Observable, of } from "rxjs";
import { AddTransactionFormValue } from "../models/AddTransactionFormValue";
import {
    CfcBankAccount,
    FinancialLedgerInfo,
    Currency,
    DropDownItem,
    BinderSectionParticipation,
    OutstandingFundContributionsResponse
} from "@app/models";
import { OutstandingFund } from "@app/finance/models/OutstandingFund"
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import {
    getAllTestCfcBankAccounts,
    getTestLedgerReferencesInfo,
    createCurrencyLookup,
    getTestCurrencyDropdownItems,
    getTestBinderSectionParticipation,
    getTestOutstandingFundContributionResponse
} from "../FakeDataSource";
import { OutstandingFundContextValueRetriever } from "./outstanding-fund-context-value-retriever";
import { TransactionModalContext } from "../modal-service/TransactionModalContext";
import { OutstandingFundsHttpService } from "../../outstanding-funds/outstanding-funds-http.service";

describe("OutstandingFundContextValueRetriever without Angular Testbed", () => {
    let service: OutstandingFundContextValueRetriever;

    const fakeCfcBankAccountService = {
        getBankAccounts: (): Observable<CfcBankAccount[]> => {
            return of(getAllTestCfcBankAccounts());
        }
    } as CfcBankAccountService;

    const fakeLedgerReferenceService = {
        getLedgerReferences: (): Observable<FinancialLedgerInfo[]> => {
            return of(getTestLedgerReferencesInfo());
        }
    } as LedgerReferenceHttpService;

    const fakeCurrencyService = {
        getCurrencies: (): Observable<Currency[]> => {
            return of([
                createCurrencyLookup(1, "EUR"),
                createCurrencyLookup(2, "USD"),
                createCurrencyLookup(5, "AUD")
            ]);
        }
    } as CurrencyHttpService;

    const fakeDropdownService = {
        getCurrencies: (): Observable<DropDownItem[]> => {
            return of(getTestCurrencyDropdownItems());
        }
    } as DropdownService;

    const fakeBinderSectionParticipationLookupService = {
        getData: (): Observable<Array<BinderSectionParticipation>> => {
            return of(getTestBinderSectionParticipation());
        }
    } as BinderSectionParticipationLookupService;

    const fakeOutstandingFundsHttpService = {
        getOutstandingFundCarrierContributions:
            (oFundId: number): Observable<OutstandingFundContributionsResponse> => {
                return of(getTestOutstandingFundContributionResponse());
            }
    } as OutstandingFundsHttpService;

    const outstandingFund: OutstandingFund = {
        outstandingFundId: 1,
        cfcBankAccount: "CFCUCA-EURC",
        ledgerReference: "SLA15053i",
        binderDescription: "Specialty Liability A1 US General Liability 2019",
        transactionReference: "TEST",
        transactionType: "LF",
        tags: "JUL20",
        currencyIsoCode: "EUR",
        tpaFee: true,
        totalAmount: 30,
        outstandingAmount: -114.2,
        category: "TPA Fee",
        sectionShortCode: "H1",
        lloydsRiskCode: "CY",
        binderYear: "i",
        notes: "some notes here",
        sectionId: 123
    } as OutstandingFund;

    it("should get initialValues", () => {
        service = new OutstandingFundContextValueRetriever(
            fakeCfcBankAccountService,
            fakeLedgerReferenceService,
            fakeCurrencyService,
            fakeDropdownService,
            fakeBinderSectionParticipationLookupService,
            fakeOutstandingFundsHttpService
        );
        const transactionModalContext: TransactionModalContext = {
            outstandingFund
        } as TransactionModalContext;
        const formValue = service.getFormValue$(transactionModalContext);

        expect(formValue).toBeDefined();
        expect(formValue).toEqual(jasmine.any(Observable));
        formValue.subscribe((atv: AddTransactionFormValue) => {
            expect(atv).toBeDefined();
            expect(atv.cfcBankAccountId).toBeDefined();
            expect(atv.cfcBankAccountId.bankAccountName).toBe("CFCUCA-EURC");

            expect(atv.financialLedgerId).toBeDefined();
            expect(atv.financialLedgerId.ledgerReference).toBe("SLA15053i");

            expect(atv.bankAccountCurrencyId).toBeDefined();
            expect(atv.bankAccountCurrencyId.id).toBeDefined();
            expect(atv.bankAccountCurrencyId.id).toBe(1);
            expect(atv.bankAccountCurrencyId.isoCode).toBeDefined();
            expect(atv.bankAccountCurrencyId.isoCode).toBe("EUR");
            expect(atv.tpaFee).toBeDefined();
            expect(atv.tpaFee).toBe(true);
            expect(atv.totalAccountAmount).toBeDefined();
            expect(atv.totalAccountAmount).toBe(30);
            expect(atv.notes).toBeDefined();
            expect(atv.notes).toBe("some notes here");
        }, fail);
    });
});


