/// <reference path="../../../node_modules/@types/jasmine/index.d.ts" />
import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { EcfReconciliationGroupRequest } from "@app/models";
import { EcfReconciliationGroupHttpService } from "@app/services/ecf-reconciliation-group-http.service";

xdescribe("EcfReconciliationGroupHttpService", () => {
    let httpMock: HttpTestingController;
    let ecfReconciliationGroupHttpService: EcfReconciliationGroupHttpService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [EcfReconciliationGroupHttpService],
            imports: [HttpClientTestingModule]
        });
        ecfReconciliationGroupHttpService = TestBed.inject(EcfReconciliationGroupHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    }));

    it("should call reconcileEcfReconciliations endpoint with an ecf reconciliation group request and the response should be OK with an ecf reconciliation group request", () => {
        const ecfReconcilationRequest: EcfReconciliationGroupRequest = {
            ecfReconciliationIds: [1, 2, 3],
            reconciledByCfcContactId: 123
        };

        ecfReconciliationGroupHttpService.reconcileEcfReconciliations(ecfReconcilationRequest).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body).toEqual(ecfReconcilationRequest);
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliationGroup/reconcile`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("POST");
        mockReq.flush(null);

        httpMock.verify();
    });

    it("should call unreconcileEcfReconciliation endpoint and send a list of numbers and the response should be OK with a list of numbers", () => {
        const data = [1, 2, 3];

        ecfReconciliationGroupHttpService.unreconcileEcfReconciliation(data).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body.length).toBe(3);
                    expect(responseEvent.body).toEqual(data);
            }
        });

        const mockReq = httpMock.expectOne(`ecfReconciliationGroup/unreconcile`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("POST");
        mockReq.flush(null);

        httpMock.verify();
    });
});
