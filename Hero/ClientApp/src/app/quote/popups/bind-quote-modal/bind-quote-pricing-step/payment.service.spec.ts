import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { first } from "rxjs/operators";
import { ContactDetails } from "./contact-details.model";
import { DirectBillingHttpService } from "./direct-billing.http-service";
import { PaymentService } from "./payment.service";
import { Limit } from "./limit.model";

describe("Payment Service", () => {
	let service: PaymentService;

    beforeEach(() => {
		service = TestBed.inject(PaymentService);
	});


	it("should be created", () => {
        // Expect
		expect(service).toBeTruthy();
	});

	it("should retrieve Direct Billing rules configuration", () => {
		// Act
		const result = service.paymentPeriodRules;

		// Expect
		expect(result).toBeTruthy();
        expect(result.country).toBe("AU");
        expect(result.brokerGroupId).toBe(1097);
        expect(result.product).toBe("CPM");
	});

    it("should retrieve the relevant payment period from the getter", () => {
		// Expect
        service.getPaymentPeriod().subscribe(paymentPeriod => expect(paymentPeriod).toBe("Annual"));
	});

    it("should set the relevant payment period", () => {
		// Act
        service.setPaymentPeriod("Monthly")

        //Expect
        service.getPaymentPeriod().subscribe(paymentPeriod => expect(paymentPeriod).toBe("Monthly"));
	});
});
