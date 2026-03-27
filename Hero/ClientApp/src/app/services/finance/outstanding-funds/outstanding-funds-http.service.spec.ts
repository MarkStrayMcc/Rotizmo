import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { OutstandingFundsHttpService } from "./outstanding-funds-http.service";
import {
    OutstandingFundsResponse,
    OutstandingFundContributionsResponse,
    OutstandingFundsTransferRequest,
    OutstandingFundsTransferResponse,
    MultipleOperationsResultProblemDetails
} from "@app/models";
import {
    OFUNDS_MOCK_SAME_BANK_ACCOUNT_DIFFERENT_LEDGERS,
    OFUNDS_SLA_MOCK_RESPONSE,
    OFUNDS_MOCK_BANK_ACCOUNT_LEDGER_CURRENCY,
    OFUNDSCONTRIB_MOCK_SINGLE_RESPONSE,
    OFUNDSTRANSFER_SUCCESSFUL_RESPONSE,
    OFUNDSTRANSFER_SUCCESSFUL_AND_ERRORS_RESPONSE
} from "./outstanding-funds-mock-data";

/***
 * When testing HTTP Services or anything that involves subscribe, always capture both success and failure.
 * https://angular.io/guide/testing-services#testing-http-services - read the yellow information box.
 */
describe("OutstandingFundsHttpService", () => {
    let httpTestingController: HttpTestingController;
    let service: OutstandingFundsHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OutstandingFundsHttpService
            ],
            imports: [HttpClientTestingModule]
        });

        // inject http service and test controller for every test
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(OutstandingFundsHttpService);
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        httpTestingController.verify();
    });

    it("should getOutstandingFunds - when input: valid bank account", () => {
        const mockData: OutstandingFundsResponse = OFUNDS_MOCK_SAME_BANK_ACCOUNT_DIFFERENT_LEDGERS;
        const bankAccount = "CFCUCA-AUDC";
        const expectedUrl = `finance/outstandingfunds?bankAccount=${bankAccount}`;

        service.getOutstandingFunds(bankAccount, "", "")
            .subscribe(data => {
                expect(data).toEqual(mockData);
                expect(data.outstandingFunds.length).toEqual(2);
                expect(data.outstandingFunds[0].cfcBankAccount).toEqual(bankAccount);
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a GET.
        expect(testRequest.request.method).toEqual("GET");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should getOutstandingFunds - when input: currency isoCode", () => {
        const mockData: OutstandingFundsResponse = OFUNDS_MOCK_SAME_BANK_ACCOUNT_DIFFERENT_LEDGERS;
        const currencyIsoCode = "AUD";
        const expectedUrl = `finance/outstandingfunds?currencyIsoCode=${currencyIsoCode}`;

        service.getOutstandingFunds("", currencyIsoCode, "")
            .subscribe(data => {
                expect(data).toEqual(mockData);
                expect(data.outstandingFunds.length).toEqual(2);
                expect(data.outstandingFunds[0].currencyIsoCode).toEqual(currencyIsoCode);
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a GET.
        expect(testRequest.request.method).toEqual("GET");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should getOutstandingFunds - when input: ledger reference", () => {
        const mockData: OutstandingFundsResponse = OFUNDS_SLA_MOCK_RESPONSE;
        const ledgerReference = "SLA15053i";
        const expectedUrl = `finance/outstandingfunds?ledgerReference=${ledgerReference}`;

        service.getOutstandingFunds("", "", ledgerReference)
            .subscribe(data => {
                expect(data).toEqual(mockData);
                expect(data.outstandingFunds.length).toEqual(1);
                expect(data.outstandingFunds[0].ledgerReference).toEqual(ledgerReference);
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a GET.
        expect(testRequest.request.method).toEqual("GET");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should getOutstandingFunds - when input: currency and ledger reference", () => {
        const mockData: OutstandingFundsResponse = OFUNDS_SLA_MOCK_RESPONSE;
        const ledgerReference = "SLA15053i";
        const currencyIsoCode = "AUD";
        const expectedUrl = `finance/outstandingfunds?currencyIsoCode=${currencyIsoCode}&ledgerReference=${ledgerReference}`;
        service.getOutstandingFunds("", currencyIsoCode, ledgerReference)
            .subscribe(data => {
                expect(data).toEqual(mockData);
                expect(data.outstandingFunds.length).toEqual(1);
                expect(data.outstandingFunds[0].ledgerReference).toEqual(ledgerReference);
                expect(data.outstandingFunds[0].currencyIsoCode).toEqual(currencyIsoCode);
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a GET.
        expect(testRequest.request.method).toEqual("GET");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should getOutstandingFunds - when input: bankAccount, currency and ledger reference", () => {
        const mockData: OutstandingFundsResponse = OFUNDS_MOCK_BANK_ACCOUNT_LEDGER_CURRENCY;
        const bankAccount = "CFCUCA-AUDC";
        const currencyIsoCode = "AUD";
        const ledgerReference = "BA059760a";
        // tslint:disable-next-line: max-line-length
        const expectedUrl = `finance/outstandingfunds?bankAccount=${bankAccount}&currencyIsoCode=${currencyIsoCode}&ledgerReference=${ledgerReference}`;
        service.getOutstandingFunds(bankAccount, currencyIsoCode, ledgerReference)
            .subscribe(data => {
                expect(data).toEqual(mockData);
                expect(data.outstandingFunds.length).toEqual(1);
                expect(data.outstandingFunds[0].cfcBankAccount).toEqual(bankAccount);
                expect(data.outstandingFunds[0].currencyIsoCode).toEqual(currencyIsoCode);
                expect(data.outstandingFunds[0].ledgerReference).toEqual(ledgerReference);
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a GET.
        expect(testRequest.request.method).toEqual("GET");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should getOutstandingFundContributions - when input: valid OutstandingFundIs", () => {
        const mockData: OutstandingFundContributionsResponse = OFUNDSCONTRIB_MOCK_SINGLE_RESPONSE;
        const outstandingFundId = 1;
        const expectedUrl = `finance/outstandingfundcontributions/${outstandingFundId}`;

        service.getOutstandingFundCarrierContributions(outstandingFundId)
            .subscribe(data => {
                expect(data.outstandingFundContributions.length).toEqual(2);
                expect(data.outstandingFundContributions[0].carrierReferenceId).toEqual(2);
                expect(data.outstandingFundContributions[1].carrierReferenceId).toEqual(4);
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a GET.
        expect(testRequest.request.method).toEqual("GET");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should transferToOffice - returns OutstandingFundsTransferResponse object with no errors", () => {
        const mockData: OutstandingFundsTransferResponse = OFUNDSTRANSFER_SUCCESSFUL_RESPONSE;
        const outstandingFundRequest: OutstandingFundsTransferRequest = { outstandingFundIds: [1, 2] };
        const expectedUrl = `finance/transfertooffice`;

        service.transferToOffice(outstandingFundRequest)
            .subscribe(data => {
                expect(data.successes.length).toEqual(2);
                expect(data.successes[0]).toEqual(1);
                expect(data.successes[1]).toEqual(2);
                expect(data.failures).toBeUndefined();
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a POST.
        expect(testRequest.request.method).toEqual("POST");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should transferToOffice - returns MultipleOperationsResultProblemDetails object with success and errors", () => {
        const mockData: MultipleOperationsResultProblemDetails = OFUNDSTRANSFER_SUCCESSFUL_AND_ERRORS_RESPONSE;
        const outstandingFundRequest: OutstandingFundsTransferRequest = { outstandingFundIds: [1, 2, 3] };
        const expectedUrl = `finance/transfertooffice`;

        service.transferToOffice(outstandingFundRequest)
            .subscribe(data => {
                expect(data.successes.length).toEqual(2);
                expect(data.successes[0]).toEqual(1);
                expect(data.successes[1]).toEqual(2);
                expect(data.failures[0].reason).toEqual("Database Error");
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(expectedUrl);
        // Assert that the request is a POST.
        expect(testRequest.request.method).toEqual("POST");
        // Respond with mock data, causing Observable to resolve.
        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(mockData);
    });

    it("should delete and return 204 no content on success", () => {
        const outstandingFundId = 1;
        const deletedByContactId = 13;
        const expectedUrl = `finance/outstandingfunds/1`;

        service.delete(outstandingFundId, deletedByContactId)
            .subscribe(() => {
            }, fail);

        // The following `expectOne()` will match the request's URL.
        // If no requests or multiple requests matched that URL
        // `expectOne()` would throw.
        const testRequest = httpTestingController.expectOne(request => request.url === expectedUrl);

        // Assert that the request is a DELETE.
        expect(testRequest.request.method).toEqual("DELETE");
        expect(testRequest.request.headers).toBeDefined();
        const headerHasCfcContactId = testRequest.request.headers.has("cfc-contact-id");
        expect(headerHasCfcContactId).toBeTruthy("header has no cfc-contact-id");
        const cfcContactIdInHeader = testRequest.request.headers.get("cfc-contact-id");
        expect(cfcContactIdInHeader).toBeDefined();
        expect(cfcContactIdInHeader).toEqual("13");

        // Subscribe callback asserts that correct data was returned.
        testRequest.flush(null, { status: 204, statusText: "" });
    });
});
