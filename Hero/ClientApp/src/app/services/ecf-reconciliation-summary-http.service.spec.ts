/// <reference path="../../../node_modules/@types/jasmine/index.d.ts" />
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { EcfReconciliationSummary } from "@app/models";
import { EcfReconciliationSummaryHttpService } from "@app/services/ecf-reconciliation-summary-http.service";

describe("EcfReconciliationSummaryHttpService", () => {
    let httpMock: HttpTestingController;
    let ecfReconciliationSummaryHttpService: EcfReconciliationSummaryHttpService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [EcfReconciliationSummaryHttpService],
            imports: [HttpClientTestingModule]
        });
        ecfReconciliationSummaryHttpService = TestBed.inject(EcfReconciliationSummaryHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    }));

    it("should call getEcfReconciliationSummaries endpoint with all paramaters and the response should be ecf reconciliation summary object list", () => {
        // Arrange
        const params = {
            ucr: "UCR_TEST",
            currencyId: 1,
            financialLedgerId: 1,
            binderId: 1,
            sectionId: 1,
            riskCode: "RC",
            unreconciledOnly: true
        };

        const mockEcfReconciliationSummary = new EcfReconciliationSummary();
        mockEcfReconciliationSummary.ecfAmount = 1000;
        mockEcfReconciliationSummary.ecfReconciliationId = 1;

        ecfReconciliationSummaryHttpService
            .getEcfReconciliationSummaries(params.ucr, params.currencyId, params.financialLedgerId, params.binderId, params.sectionId, params.riskCode, params.unreconciledOnly)
            .subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(mockEcfReconciliationSummary);
                }
            });

        const expectedUrl = `ecfReconciliation/ecfReconciliationSummaries?ucr=${params.ucr}&currencyId=${params.currencyId}`
            + `&financialLedgerId=${params.financialLedgerId}&binderId=${params.binderId}&sectionId=${params.sectionId}`
            + `&riskCode=${params.riskCode}&unreconciledOnly=${params.unreconciledOnly}`;

        const mockReq = httpMock.expectOne(expectedUrl);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(mockEcfReconciliationSummary);

        httpMock.verify();
    });

    it("should call getEcfReconciliationSummaries endpoint with only a few paramaters and the response should be ecf reconciliation summary object list", () => {
        const params = {
            ucr: "UCR_TEST",
            currencyId: 1,
            financialLedgerId: 1,
            binderId: 1,
            sectionId: 1,
            riskCode: "RC",
            unreconciledOnly: true
        };

        const mockEcfReconciliationSummary = new EcfReconciliationSummary();
        mockEcfReconciliationSummary.ecfAmount = 1000;
        mockEcfReconciliationSummary.ecfReconciliationId = 1;

        ecfReconciliationSummaryHttpService
            .getEcfReconciliationSummaries(null, null, params.financialLedgerId, null, params.sectionId, null, params.unreconciledOnly)
            .subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(mockEcfReconciliationSummary);
                }
            });

        const expectedUrl = `ecfReconciliation/ecfReconciliationSummaries?financialLedgerId=${params.financialLedgerId}`
            + `&sectionId=${params.sectionId}`
            + `&unreconciledOnly=${params.unreconciledOnly}`;

        const mockReq = httpMock.expectOne(expectedUrl);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(mockEcfReconciliationSummary);

        httpMock.verify();
    });

    it("should call getEcfReconciliationSummaries endpoint with no paramaters and the response should be ecf reconciliation summary object list", () => {
        const mockEcfReconciliationSummary = new EcfReconciliationSummary();
        mockEcfReconciliationSummary.ecfAmount = 1000;
        mockEcfReconciliationSummary.ecfReconciliationId = 1;

        ecfReconciliationSummaryHttpService
            .getEcfReconciliationSummaries(null, null, null, null, null, null, null)
            .subscribe((responseEvent: HttpEvent<any>) => {
                switch (responseEvent.type) {
                    case HttpEventType.Response:
                        expect(responseEvent.ok).toBeTruthy();
                        expect(responseEvent.body).toEqual(mockEcfReconciliationSummary);
                }
            });

        const expectedUrl = `ecfReconciliation/ecfReconciliationSummaries`;

        const mockReq = httpMock.expectOne(expectedUrl);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(mockEcfReconciliationSummary);

        httpMock.verify();
    });
});
