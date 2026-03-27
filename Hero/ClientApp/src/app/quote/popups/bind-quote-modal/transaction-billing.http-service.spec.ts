import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { TransactionBillingHttpService } from "./transaction-billing.http-service";

describe("TransactionBillingHttpService", () => {
    let service: TransactionBillingHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TransactionBillingHttpService]
        });

        service = TestBed.inject(TransactionBillingHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    describe("put", () => {
        it("should update the policy transactions to be direct billing", () => {
            // Arrange
            const expectedPolicyNumber = "TEST-POLICY";
            const expectedContact = { firstName: "a", lastName: "b", email: "a@b.com" };

            service.put(expectedPolicyNumber, expectedContact).subscribe(() => {}, fail);

            const request = httpMock.expectOne(`/policy/${expectedPolicyNumber}/transactions/billing`);

            // Act
            request.flush(null);

            // Assert
            expect(request.request.method).toBe("PUT");
            expect(request.request.body).toEqual({ type: "Direct", contact: expectedContact });
        });
    });
});
