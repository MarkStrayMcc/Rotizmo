import { TransactionHttpService } from "./transaction-http.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { TransactionService } from "./transaction.service";

describe("TransactionService", () => {
	let service: TransactionService;
	let mockTransactionHttpService: TransactionHttpService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [TransactionService],
		});

		service = TestBed.inject(TransactionService);
		mockTransactionHttpService = TestBed.inject(TransactionHttpService);

		it("should be created", () => {
			expect(service).toBeTruthy();
		});

		it("should retrieve transactions", async () => {
			// Arrange
			const policyNumber = "ESL0039627255";

			// Act
			const result = await service.getTransactionsByPolicyNumber(policyNumber).toPromise();

			// Expect
			expect(result.length > 0).toBe(true);
		});

		it("should call to get transactions by policy number", async () => {
			// Arrange
			spyOn(mockTransactionHttpService, "getTransactionsByPolicyNumber").and.callThrough();
			const policyNumber = "ESL0039627295";

			// Act
			await service.getTransactionsByPolicyNumber(policyNumber).toPromise();

			// Expect
			expect(mockTransactionHttpService.getTransactionsByPolicyNumber).toHaveBeenCalledTimes(1);
			expect(mockTransactionHttpService.getTransactionsByPolicyNumber).toHaveBeenCalledWith(policyNumber);
		});
	});
});
