import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { flush, TestBed } from "@angular/core/testing";

import { TransactionHttpService } from "./transaction-http.service";

describe("TransactionHttpService", () => {
	let service: TransactionHttpService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [TransactionHttpService],
		});

		service = TestBed.inject(TransactionHttpService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});

	describe("getTransactionsByPolicyNumber", () => {
		it("should GET and return the transactions by policy number", () => {
			// Arrange
			const policyNumber = "ESL0039627290";
			const transactionList: any = [
				{ transactionId: 1, policyNumber: "ESL0039627290" },
				{ transactionId: 2, policyNumber: "ESL0039627290" },
			];

			service.getTransactionsByPolicyNumber(policyNumber).subscribe((transaction) => {
				expect(transaction.length > 0).toBe(true);
			}, fail);

			const request = httpMock.expectOne(`/transactions/policyNumber/${policyNumber}`);

			// Act
			request.flush(transactionList, { status: 200, statusText: null });

			// Assert
			expect(request.request.method).toBe("GET");
		});

		it("should return null if a 404 is returned", () => {
			// Arrange
			const policyNumber = "ESL00396272800";

			service.getTransactionsByPolicyNumber(policyNumber).subscribe((transactions) => {
				// Assert
				expect(transactions).toBeNull();
			}, fail);

			const request = httpMock.expectOne(`/transactions/policyNumber/${policyNumber}`);

			// Act
			request.flush([], { status: 404, statusText: null });
		});
	});
});
