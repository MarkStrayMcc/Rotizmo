import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ContactDetails } from "./contact-details.model";

import { DirectBillingHttpService } from "./direct-billing.http-service";

describe("DirectBillingHttpService", () => {
    let service: DirectBillingHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DirectBillingHttpService]
        });

        service = TestBed.inject(DirectBillingHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    describe("getPaymentLimits", () => {
        it("should GET and return the payment limits by country code", () => {
            // Arrange
            const expectedCountryCode = "NZ";
            const expectedLimit = { max: 1200, currency: expectedCountryCode };

            service.getPaymentLimit(expectedCountryCode).subscribe(limit => {
                expect(limit).toBe(expectedLimit);
            }, fail);

            const request = httpMock.expectOne(`/direct-billing/payments/limits/${expectedCountryCode}`);

            // Act
            request.flush(expectedLimit);

            // Assert
            expect(request.request.method).toBe("GET");
        });

        it("should return null if a 404 is returned", () => {
            // Arrange
            const countryCode = "IL";

            service.getPaymentLimit(countryCode).subscribe(limit => {
                // Assert
                expect(limit).toBeNull();
            }, fail);

            const request = httpMock.expectOne(`/direct-billing/payments/limits/${countryCode}`);

            // Act
            request.flush({ max: 1200, currency: countryCode }, { status: 404, statusText: null });
        });

        it("should cache the response based on the request", () => {
            // Arrange
            const parameter1 = "US";
            const parameter2 = "CA";

            // Act
            service.getPaymentLimit(parameter1).subscribe(() => { }, fail);
            service.getPaymentLimit(parameter1).subscribe(() => { }, fail);
            service.getPaymentLimit(parameter2).subscribe(() => { }, fail);

            // Assert
            httpMock.expectOne(`/direct-billing/payments/limits/${parameter1}`);
            httpMock.expectOne(`/direct-billing/payments/limits/${parameter2}`);

            expect().nothing();
        });
    });

    describe("getContactDetails", () => {
        it("should GET and return the contract details by the external customer reference (client uid)", () => {
            // Arrange
            const externalCustomerReference = "2bc92579-92ee-4ff2-8d44-1ca61542aa1b";
            const expectedContactDetails = {
                companyName: "Tomato Corp.",
                addressLine1: "rue des tomates, 33",
                city: "Paris",
                countryCode: "FR",
                email: "contactez@tomatocorp.fr"
            } as ContactDetails;

            service.getContactDetails(externalCustomerReference).subscribe(contactDetails => {
                expect(contactDetails).toBe(expectedContactDetails);
            }, fail);

            const request = httpMock.expectOne(`/direct-billing/${externalCustomerReference}/contact-details`);

            // Act
            request.flush(expectedContactDetails);

            // Assert
            expect(request.request.method).toBe("GET");
        });

        it("should return null if a 404 is returned", () => {
            // Arrange
            const externalCustomerReference = "1bc92579-92ee-4ff2-8d44-1ca61542aa1b";

            service.getContactDetails(externalCustomerReference).subscribe(contactDetails => {
                // Assert
                expect(contactDetails).toBeNull();
            }, fail);

            const request = httpMock.expectOne(`/direct-billing/${externalCustomerReference}/contact-details`);

            // Act
            request.flush(null, { status: 404, statusText: null });
        });

        it("should cache the response based on the request", () => {
            // Arrange
            const parameter1 = "8bc92579-92ee-4ff2-8d44-1ca61542aa1b";
            const parameter2 = "11T0M4T0-92ee-4ff2-8d44-1ca61542aa1b";

            // Act
            service.getContactDetails(parameter1).subscribe(() => { }, fail);
            service.getContactDetails(parameter1).subscribe(() => { }, fail);
            service.getContactDetails(parameter2).subscribe(() => { }, fail);

            // Assert
            httpMock.expectOne(`/direct-billing/${parameter1}/contact-details`);
            httpMock.expectOne(`/direct-billing/${parameter2}/contact-details`);

            expect().nothing();
        });
    });
});
