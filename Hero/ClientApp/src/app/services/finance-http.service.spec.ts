import { async, inject, TestBed } from "@angular/core/testing";
import { Response, ResponseOptions } from "@angular/http";
import { FinancialTransactionDetail, FinancialTransactionsResult } from "@app/models";
import { FinanceHttpService } from "@app/services/finance-http.service";
import { TRANSACTIONS } from "@app/test/financial-transactions-mock-data";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

function getAllTestFinancialTransactions(): FinancialTransactionsResult {
    return TRANSACTIONS;
}

function getTestFinancialTransactionsForLedgerAndAccountName(
    ledgerReference: string,
    bankAccountName: string): FinancialTransactionsResult {
    const transactionDetails = new Array<FinancialTransactionDetail>();
    const bankAccountAmountFieldName = "bankAccountAmount";
    const ledgerReferenceFieldName = "ledgerReference";
    const bankAccountNameFieldName = "bankAccountName";
    let sumTotal = 0;

    for (const transactionDetail of TRANSACTIONS.financialTransactionDetails) {
        if (transactionDetail[ledgerReferenceFieldName] === ledgerReference &&
            transactionDetail[bankAccountNameFieldName] === bankAccountName) {
            sumTotal += transactionDetail[bankAccountAmountFieldName];
            transactionDetails.push(transactionDetail);
        }
    }
    // tslint:disable-next-line:prefer-const
    const financialTransactionsResult = new FinancialTransactionsResult();
    financialTransactionsResult.financialTransactionDetails = transactionDetails;
    financialTransactionsResult.sumBankAccountAmount = sumTotal;
    return financialTransactionsResult;
}

/**
 * Tests for Financial Transaction Service.
 * Currently the service does not make a real http call
 * It only just fetches mock transaction data from transactions-mockdata.ts
 * However it will be extended to make an actual http request to fetch data
 * from the WebApi. This test spec will have to change accordingly.
 */
describe("FinancialTransactionHttpService",
    () => {
        let httpMock: HttpTestingController;
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [FinanceHttpService
                ],
                imports: [HttpClientTestingModule]
            });
            httpMock = TestBed.inject(HttpTestingController);
        }));

        it("Given bankAccountCurrencyId but other fields null should return valid transaction result",
            inject([FinanceHttpService],
                (financialTransactionHttpService: FinanceHttpService) => {
                    const testFinancialTransactions = getAllTestFinancialTransactions();

                    financialTransactionHttpService.getTransactions(undefined, undefined, 1).subscribe(
                        (transactionResult: FinancialTransactionsResult) => {
                            expect(transactionResult).toBeDefined();
                            expect(transactionResult.financialTransactionDetails).toBeDefined();
                            expect(transactionResult.sumBankAccountAmount).toBeDefined();
                            expect(transactionResult.sumBankAccountAmount).toBeGreaterThan(10);
                        }
                    );

                    let req = httpMock.expectOne("finance/financialTransactions?bankAccountCurrencyId=1");
                    expect(req.request.method).toBe("GET");
                    req.flush(testFinancialTransactions);
                }
            ));

        it("Given ledgerReference and bankAccountName but bankAccountCurrencyId is null should return valid transaction result",
            inject([FinanceHttpService],
                (financialTransactionHttpService: FinanceHttpService) => {
                    const ledgerReferenceValue = "CH000000a";
                    const bankAccountNameValue = "CFCUNTG-EURA";
                    const testFinancialTransactions = getTestFinancialTransactionsForLedgerAndAccountName(
                        ledgerReferenceValue,
                        bankAccountNameValue);

                    let apiUrl = `finance/financialTransactions?ledgerReference=${ledgerReferenceValue}`;
                    apiUrl += `&bankAccountName=${bankAccountNameValue}`;

                    financialTransactionHttpService
                        .getTransactions(bankAccountNameValue, ledgerReferenceValue, undefined).subscribe(
                            (transactionResult: FinancialTransactionsResult) => {
                                expect(transactionResult).toBeDefined();
                                expect(transactionResult.financialTransactionDetails).toBeDefined();
                                expect(transactionResult.financialTransactionDetails.length).toBe(3);
                                expect(transactionResult.financialTransactionDetails[0].ledgerReference)
                                    .toBe(ledgerReferenceValue);
                                expect(transactionResult.financialTransactionDetails[0].bankAccountName)
                                    .toBe(bankAccountNameValue);
                                expect(transactionResult.sumBankAccountAmount).toBeDefined();
                                expect(transactionResult.sumBankAccountAmount).toBe(75);
                            }
                        );

                    let req = httpMock.expectOne(apiUrl);
                    expect(req.request.method).toBe("GET");
                    req.flush(testFinancialTransactions);
                }
            ));

        it("Given a good Financial Transaction Detail DTO the addTransaction method should return successfully",
            inject([FinanceHttpService],
                (financialTransactionHttpService: FinanceHttpService) => {
                    const financialTransactionDetailObjectToSend = new FinancialTransactionDetail();
                    financialTransactionDetailObjectToSend.entryDate = new Date();
                    financialTransactionDetailObjectToSend.bankAccountName = "CFCUND-EURA";
                    financialTransactionDetailObjectToSend.bankAccountCurrencyId = 1;
                    financialTransactionDetailObjectToSend.bankAccountCurrencyName = "EUR";
                    financialTransactionDetailObjectToSend.paidDate = new Date("2018-06-07");
                    financialTransactionDetailObjectToSend.transactionType = "CC";
                    financialTransactionDetailObjectToSend.ledgerReference = "CH000000a";
                    financialTransactionDetailObjectToSend.bankAccountAmount = 22;
                    financialTransactionDetailObjectToSend.entryType = "DB";
                    financialTransactionDetailObjectToSend.originalAmountCurrencyId = 1;
                    financialTransactionDetailObjectToSend.originalAmount = 22;
                    financialTransactionDetailObjectToSend.sectionShortCode = "SL";
                    financialTransactionDetailObjectToSend.lloydsRiskCode = "E9";
                    financialTransactionDetailObjectToSend.transactionReference = "Test";
                    financialTransactionDetailObjectToSend.financialTransactionId = 0;
                    financialTransactionDetailObjectToSend.addedOn = new Date();

                    const financialTransactionsApiUrl = "finance/financialTransactions";

                    financialTransactionHttpService.addTransaction(financialTransactionDetailObjectToSend)
                        .subscribe(
                            (transactionDetailReturned: FinancialTransactionDetail) => {
                                expect(transactionDetailReturned).toBeDefined();
                                expect(transactionDetailReturned.bankAccountName).toBe("CFCUND-EURA");
                            });

                    let req = httpMock.expectOne(financialTransactionsApiUrl);
                    expect(req.request.method).toBe("POST");
                    req.flush(financialTransactionDetailObjectToSend);
                }
            ));

        it("Given a bad Financial Transaction Detail DTO the addTransaction method should return error!",
            inject([FinanceHttpService],
                (financialTransactionHttpService: FinanceHttpService) => {
                    const financialTransactionDetailObjectToSend = new FinancialTransactionDetail();
                    financialTransactionDetailObjectToSend.entryDate = new Date();
                    financialTransactionDetailObjectToSend.bankAccountName = "CFCUND-EURA";
                    financialTransactionDetailObjectToSend.bankAccountCurrencyId = 1;
                    financialTransactionDetailObjectToSend.bankAccountCurrencyName = "EUR";
                    financialTransactionDetailObjectToSend.paidDate = new Date("2018-06-07");
                    financialTransactionDetailObjectToSend.transactionType = "CC";
                    financialTransactionDetailObjectToSend.ledgerReference = "BADLedger";
                    financialTransactionDetailObjectToSend.bankAccountAmount = 22;
                    financialTransactionDetailObjectToSend.entryType = "DB";
                    financialTransactionDetailObjectToSend.originalAmountCurrencyId = 1;
                    financialTransactionDetailObjectToSend.originalAmount = 22;
                    financialTransactionDetailObjectToSend.sectionShortCode = "SL";
                    financialTransactionDetailObjectToSend.lloydsRiskCode = "E9";
                    financialTransactionDetailObjectToSend.transactionReference = "Test";
                    financialTransactionDetailObjectToSend.financialTransactionId = 0;
                    financialTransactionDetailObjectToSend.addedOn = new Date();

                    const financialTransactionsApiUrl = "finance/financialTransactions";

                    function Listener() {
                        return {
                            onNext(v) {
                                expect(v).toBeDefined();
                            },
                            onError(err) {
                                expect(err).toBeDefined();
                                expect(err.body)
                                    .toBe(
                                        "Financial Transaction Id should not be greater than 0 when creating a new Transaction.");
                            },
                            onCompleted() {
                                expect("completed").toBeDefined();
                            }
                        }
                    }

                    financialTransactionHttpService.addTransaction(financialTransactionDetailObjectToSend)
                        .subscribe(Listener);

                    let req = httpMock.expectOne(financialTransactionsApiUrl);
                    expect(req.request.method).toBe("POST");
                    req.flush(new Response(new ResponseOptions({
                        statusText: "Financial Transaction Id should not be greater than 0 when creating a new Transaction.",
                        status: 400
                    })));
                }
            ));
    });
