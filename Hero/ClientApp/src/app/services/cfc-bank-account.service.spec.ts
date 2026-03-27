import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { CfcBankAccount, Currency, PaymentRequest} from "@app/models";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

function getAllTestCfcBankAccounts(): CfcBankAccount[] {
    return [
        {
            cfcBankAccountId: 2,
            bankAccountName: "CFCBANK009876-EURA",
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
        } as CfcBankAccount,
        {
            cfcBankAccountId: 19,
            bankAccountName: "889001146",
            bankAccountType: "US TPA Fee",
            bankAccountCurrencyId: 3,
            bankAccountCurrencyName: "USD"
        }
    ];
}

describe("CfcBankAccounts Test",
    () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: XHRBackend,
                        useClass: MockBackend
                    }, CfcBankAccountService
                ],
                imports: [HttpClientTestingModule]
            });
        }));

        it("Get all bank accounts - getBankAccounts",
            inject([XHRBackend, CfcBankAccountService],
                (mockBackend: MockBackend, cfcBankAccountService: CfcBankAccountService) => {
                    const mockCfcBankAccounts = getAllTestCfcBankAccounts();
                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            expect(connection.request.method).toBe(RequestMethod.Get);
                            expect(connection.request.url).toBe("cfcbankaccount/cfcbankaccounts");
                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(mockCfcBankAccounts),
                                status: 200
                            })));
                        });
                    cfcBankAccountService.getBankAccounts().subscribe(
                        (cfcBankAccounts: CfcBankAccount[]) => {
                            expect(cfcBankAccounts).toBeDefined();
                            expect(cfcBankAccounts.length).toBe(5);
                        });
                }));

        it('returns a bank account based on currency of request', inject([CfcBankAccountService],
            (cfcBankAccountService: CfcBankAccountService) => {
                // arrange
                let mockAccounts = getAllTestCfcBankAccounts();
                let mockPaymentRequest = new PaymentRequest();
                mockPaymentRequest.classification = {
                    classificationId: 1,
                    name: "CoverageCosts",
                    subclassificationId: 1
                };
                mockPaymentRequest.currency = {
                    id: 2,
                    isoCode: 'GBP',
                    name: 'Pound',
                    symbol: '£',
                    rate: 1.0
                };

                // act
                let bankAccount: CfcBankAccount =
                    cfcBankAccountService.getSuggestedAccount(mockAccounts, mockPaymentRequest);

                // assert
                expect(bankAccount.bankAccountCurrencyId).toBe(mockPaymentRequest.currency.id);
            }));

        it('returns a non loss bank account based on currency and payment type of cash call', inject([CfcBankAccountService],
            (cfcBankAccountService: CfcBankAccountService) => {
                // arrange
                // cash call - non loss fund
                // everything else - loss fund
                let mockAccounts = getAllTestCfcBankAccounts();
                let mockPaymentRequest = new PaymentRequest();
                mockPaymentRequest.classification = {
                    classificationId: 1,
                    name: "CoverageCosts",
                    subclassificationId: 1
                };
                mockPaymentRequest.currency = {
                    id: 2,
                    isoCode: 'GBP',
                    name: 'Pound',
                    symbol: '£',
                    rate: 1.0
                };
                mockPaymentRequest.paymentType = "CashCall";

                // act
                let bankAccount: CfcBankAccount =
                    cfcBankAccountService.getSuggestedAccount(mockAccounts, mockPaymentRequest);

                // assert
                expect(bankAccount.bankAccountCurrencyId).toBe(mockPaymentRequest.currency.id);
                expect(bankAccount.bankAccountType).toBe("Non Loss Fund");
        }));

        it('returns a loss bank account based on currency and payment type of not cash call', inject([CfcBankAccountService],
            (cfcBankAccountService: CfcBankAccountService) => {
                // arrange
                // cash call - non loss fund
                // everything else - loss fund
                let mockAccounts = getAllTestCfcBankAccounts();
                let mockPaymentRequest = new PaymentRequest();
                mockPaymentRequest.classification = {
                    classificationId: 1,
                    name: "CoverageCosts",
                    subclassificationId: 1
                };
                mockPaymentRequest.currency = {
                    id: 2,
                    isoCode: 'GBP',
                    name: 'Pound',
                    symbol: '£',
                    rate: 1.0
                };
                mockPaymentRequest.paymentType = "Other";

                // act
                let bankAccount: CfcBankAccount =
                    cfcBankAccountService.getSuggestedAccount(mockAccounts, mockPaymentRequest);

                // assert
                expect(bankAccount.bankAccountCurrencyId).toBe(mockPaymentRequest.currency.id);
                expect(bankAccount.bankAccountType).toBe("Loss Fund");
            }));

        it('returns tpa fee bank account if payment request classification is TPA Fee', inject([CfcBankAccountService],
            (cfcBankAccountService: CfcBankAccountService) => {
                // arrange
                let mockAccounts = getAllTestCfcBankAccounts();
                let mockPaymentRequest = new PaymentRequest();
                mockPaymentRequest.classification = {
                  classificationId: 14,
                  name: "TPA Fee",
                  subclassificationId: 1
                };
                mockPaymentRequest.currency = {
                    id: 23,
                    isoCode: 'ZAR',
                    name: 'Rand',
                    symbol: 'Z',
                    rate: 1.0
                };
                mockPaymentRequest.binderSection = {
                    binderId: 1,
                    binderDescription: "Transaction Liability",
                    sectionId: 2,
                    binderYear: "K",
                    binderSectionDescription: "UK",
                    binderYearNo: 3,
                    shortCode: "A",
                    coverholder: "CFC Underwriting"
                };

                // act
                let bankAccount: CfcBankAccount =
                    cfcBankAccountService.getSuggestedAccount(mockAccounts, mockPaymentRequest);

                // assert
                expect(bankAccount.cfcBankAccountId).toBe(mockAccounts[4].cfcBankAccountId);
            }));

        it('returns US tpa fee bank account if payment request classification is TPA Fee and coverholder is CFC USA', inject([CfcBankAccountService],
            (cfcBankAccountService: CfcBankAccountService) => {
                // arrange
                let mockAccounts = getAllTestCfcBankAccounts();
                let mockPaymentRequest = new PaymentRequest();
                mockPaymentRequest.classification = {
                    classificationId: 14,
                    name: "TPA Fee",
                    subclassificationId: 1
                };

                mockPaymentRequest.currency = {
                    id: 3,
                    isoCode: 'USD',
                    name: 'Dollars',
                    symbol: '$',
                    rate: 1.0
                };

                mockPaymentRequest.binderSection = {
                    binderId : 1,
                    binderDescription: "US Admitted SME Cyber",
                    sectionId : 2,
                    binderYear : "K",
                    binderSectionDescription : "US",
                    binderYearNo : 3,
                    shortCode : "A",
                    coverholder : "CFC USA"
                };

                // act
                let bankAccount: CfcBankAccount =
                    cfcBankAccountService.getSuggestedAccount(mockAccounts, mockPaymentRequest);

                // assert
                expect(bankAccount.bankAccountName).toBe(mockAccounts[5].bankAccountName);
            }));

        it('returns tpa fee bank account if payment request classification is TPA Fee and coverholder is not CFC USA', inject([CfcBankAccountService],
            (cfcBankAccountService: CfcBankAccountService) => {
                // arrange
                let mockAccounts = getAllTestCfcBankAccounts();
                let mockPaymentRequest = new PaymentRequest();
                mockPaymentRequest.classification = {
                    classificationId: 14,
                    name: "TPA Fee",
                    subclassificationId: 1
                };

                mockPaymentRequest.currency = {
                    id: 3,
                    isoCode: 'USD',
                    name: 'Dollars',
                    symbol: '$',
                    rate: 1.0
                };

                mockPaymentRequest.binderSection = {
                    binderId: 1,
                    binderDescription: "Transaction Liability",
                    sectionId: 2,
                    binderYear: "K",
                    binderSectionDescription: "UK",
                    binderYearNo: 3,
                    shortCode: "A",
                    coverholder: "CFC Underwriting"
                };

                // act
                let bankAccount: CfcBankAccount =
                    cfcBankAccountService.getSuggestedAccount(mockAccounts, mockPaymentRequest);

                // assert
                expect(bankAccount.cfcBankAccountId).toBe(mockAccounts[4].cfcBankAccountId);
            }));

        it('returns the first bank account if nothing matches', inject([CfcBankAccountService],
            (cfcBankAccountService: CfcBankAccountService) => {
                // arrange
                let mockAccounts = getAllTestCfcBankAccounts();
                let mockPaymentRequest = new PaymentRequest();
                mockPaymentRequest.classification = {
                  classificationId: 1,
                  name: "CoverageCosts",
                  subclassificationId: 1
                };
                mockPaymentRequest.currency = {
                    id: 23,
                    isoCode: 'ZAR',
                    name: 'Rand',
                    symbol: 'Z',
                    rate: 1.0
                };

                // act
                let bankAccount: CfcBankAccount =
                    cfcBankAccountService.getSuggestedAccount(mockAccounts, mockPaymentRequest);

                // assert
                expect(bankAccount.cfcBankAccountId).toBe(mockAccounts[0].cfcBankAccountId);
            }));
    });
