/// <reference path="../../../node_modules/@types/jasmine/index.d.ts" />
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { EcfReconciliation, EcfReconciliationFinancialTransaction, FinancialTransactionEcfReconciliationRequest } from "@app/models";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";

describe("EcfReconciliationHttpService", () => {
    let httpMock: HttpTestingController;
    let ecfReconciliationHttpService: EcfReconciliationHttpService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [EcfReconciliationHttpService],
            imports: [HttpClientTestingModule]
        });
        ecfReconciliationHttpService = TestBed.inject(EcfReconciliationHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    }));

    it("should call deleteEcfReconciliation endpoint sending in an id and get an OK response", () => {
        const ecfReconciliationId = 1;

        ecfReconciliationHttpService.deleteEcfReconciliation(ecfReconciliationId).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliation/ecfReconciliations/${ecfReconciliationId}`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("DELETE");
        mockReq.flush({});

        httpMock.verify();
    });

    it("should call addOrUpdateEcfReconciliation endpoint with ecf reconciliation request and receive an OK response with an ecf reconciliation object", () => {
        ecfReconciliationHttpService.addOrUpdateEcfReconciliation(ecfReconciliationMock).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body).toEqual(ecfReconciliationMock);
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliation/ecfReconciliations`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("POST");
        expect(mockReq.request.body).toEqual(ecfReconciliationMock);
        mockReq.flush({});

        httpMock.verify();
    });

    it("should call getEcfUcrLookups endpoint with a search string and receive an OK response with an ecf reconciliation object list", () => {
        const ecfUcrLookups = ["test", "test2"];
        ecfReconciliationHttpService.getEcfUcrLookups().subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body).toEqual(ecfUcrLookups);
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliation/ecfUcrLookups`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(ecfUcrLookups);

        httpMock.verify();
    });

    it("should call getEcfReconciliationsFromUcr passing in a strig and the response should be an ecf reconciliation object list", () => {
        const ecfUcrLookups = ["test", "test2"];
        ecfReconciliationHttpService.getEcfReconciliationsFromUcr("TestUcr").subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body).toEqual(ecfUcrLookups);
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliation/ecfReconciliations?ucr=TestUcr`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(ecfUcrLookups);

        httpMock.verify();
    });

    it("should call getEcfFinancialTransactions with expected parameters and the response should be an ecf reconciliation financial transaction object list", () => {
        const ecfReconciliationFinancialTransaction = new EcfReconciliationFinancialTransaction();
        ecfReconciliationFinancialTransaction.insuredCompanyName = "test company";

        ecfReconciliationHttpService.getEcfFinancialTransactions(1, 123, 1234, 99, "CY", "JAN18").subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body.length).toBe(1);
                    expect(responseEvent.body[0].insuredCompanyName).toBe("test company");
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliation/ecfReconciliationFinancialTransactions?ecfReconciliationId=1&financialLedgerId=123&binderId=1234&sectionId=99&riskCode=CY&tags=JAN18`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush([ecfReconciliationFinancialTransaction]);

        httpMock.verify();
    });

    it("should call reconcileEcfFinancialTransactions endpoint with expected parameters and the response should be an ecf reconciliation financial transaction object list", () => {
        // Arrange
        const ecfReconciliationRequests: FinancialTransactionEcfReconciliationRequest[] =
            [
                {
                    financialTransactionId: 1000,
                    isReconciled: false,
                    ecfReconciliationId: 123,
                    reconciledByCfcContactId: 567
                },
                {
                    financialTransactionId: 1000,
                    isReconciled: true,
                    ecfReconciliationId: 123,
                    reconciledByCfcContactId: 567
                }
            ];

        const ecfReconciliationFinancialTransaction = new EcfReconciliationFinancialTransaction();
        ecfReconciliationFinancialTransaction.insuredCompanyName = "test company";

        ecfReconciliationHttpService.reconcileEcfFinancialTransactions(ecfReconciliationRequests).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body.length).toBe(1);
                    expect(responseEvent.body[0].insuredCompanyName).toBe("test company");
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliation/reconcileEcfFinancialTransactions`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("POST");
        mockReq.flush([ecfReconciliationFinancialTransaction]);

        httpMock.verify();
    });
});

const ecfReconciliationMock: EcfReconciliation = {
    ecfReconciliationId: 1,
    ucr: "TestUcr",
    currencyId: 1,
    currencyIsoCode: "EUR",
    sequenceNo: 1,
    completedDate: new Date(Date.now()),
    amount: 100,
    reconciledGroupId: null,
    addedByCfcContactId: 111,
    addedOn: new Date(Date.now()),
    lastEditedByCfcContactId: 111,
    lastEditedOn: new Date(Date.now())
};
