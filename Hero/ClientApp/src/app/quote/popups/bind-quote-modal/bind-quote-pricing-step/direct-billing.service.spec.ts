import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { first } from "rxjs/operators";
import { ContactDetails } from "./contact-details.model";
import { DirectBillingHttpService } from "./direct-billing.http-service";
import { DirectBillingService } from "./direct-billing.service";
import { Limit } from "./limit.model";

describe("DirectBillingService", () => {
	let service: DirectBillingService;
	const expectedLimit: Limit = { max: 1000, currency: "GBP" };
	const expectedContactDetails = {
		companyName: "Tomato Corp.",
		addressLine1: "rue des tomates, 33",
		city: "Paris",
		countryCode: "FR",
		email: "contactez@tomatocorp.fr",
	} as ContactDetails;
	let mockDirectBillingHttpService: DirectBillingHttpService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				DirectBillingService,
				{
					provide: DirectBillingHttpService,
					useValue: { getPaymentLimit: (_: string) => of(expectedLimit), getContactDetails: (_: string) => of(expectedContactDetails) },
				},
			],
		});

		service = TestBed.inject(DirectBillingService);
		mockDirectBillingHttpService = TestBed.inject(DirectBillingHttpService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});

	it("should call to get payment limit", async () => {
		// Arrange
		spyOn(mockDirectBillingHttpService, "getPaymentLimit").and.callThrough();

		// Act
		await service.getPaymentLimit("GB").toPromise();

		// Expect
		expect(mockDirectBillingHttpService.getPaymentLimit).toHaveBeenCalledTimes(1);
		expect(mockDirectBillingHttpService.getPaymentLimit).toHaveBeenCalledWith("GB");
	});

	it("should retrieve Limit", async () => {
		// Act
		const result = await service.getPaymentLimit("GB").toPromise();

		// Expect
		expect(result).toBe(expectedLimit);
	});

	it("should retrieve Direct Billing rules configuration", () => {
		// Act
		const result = service.directBillingRules;

		// Expect
		expect(result && result.length).toBeTruthy();
	});

	it("should get contact details", async () => {
		// Act
		const result = await service.getContactDetails("2bc92579-92ee-4ff2-8d44-1ca61542aa1b").toPromise();

		// Expect
		expect(result).toBe(expectedContactDetails);
	});

	describe("isDirectBillingEnabled", () => {
		it("should set direct billing emabled to true", async () => {
			service.setIsDirectBillingEnabled(true);
			const isDirectBillingEnabled = await service.getIsDirectBillingEnabled().pipe(first()).toPromise();
			expect(isDirectBillingEnabled).toBe(true);
		});
	});
});
