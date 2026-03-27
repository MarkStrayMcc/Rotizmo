import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { SanctionStage } from "@app/enums/SanctionStage";
import { SanctionsCheckRequest } from "@app/models";
import { CheckClientSanctionsHttpService } from "./check-client-sanctions-http.service";

describe("CheckClientSanctionsHttpService", () => {
    let service: CheckClientSanctionsHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CheckClientSanctionsHttpService]
        });

        service = TestBed.inject(CheckClientSanctionsHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    it("should call sanctions check API with all parameters", () => {
        const fullParams: SanctionsCheckRequest = {
            clientName: "Test Company",
            clientUid: "test-uid-123",
            clientId: 123,
            countryIsoCode: "GB",
            stage: SanctionStage.PreQuote,
            isSendEmail: true,
            onGoingScreening: false
        };

        service.checkClientSanctions(fullParams).subscribe(result => {
            expect(result).toBe(true);
        });

        const request = httpMock.expectOne('/clients/sanctions-check');
        expect(request.request.method).toBe("POST");
        expect(request.request.body).toEqual({
            ClientUid: fullParams.clientUid,
            ClientName: fullParams.clientName,
            CountryIsoCode: fullParams.countryIsoCode,
            IsSendEmail: fullParams.isSendEmail,
            Stage: 'PreQuote',
            ClientId: fullParams.clientId, 
            OnGoingScreening: fullParams.onGoingScreening
        });
        request.flush(true);
    });

    it("should throw error if clientUid is missing", () => {
        const paramsWithoutClientUid: SanctionsCheckRequest = {
            clientName: "Test Company",
            clientId: 123,
            countryIsoCode: "GB",
            stage: SanctionStage.PreQuote,
            isSendEmail: true
        } as any;

        expect(() => {
            service.checkClientSanctions(paramsWithoutClientUid);
        }).toThrowError('clientUid is required for the sanctions check API');
    });

    it("should throw error if clientId is missing", () => {
        const paramsWithoutClientId: SanctionsCheckRequest = {
            clientName: "Test Company",
            clientUid: "test-uid-123",
            countryIsoCode: "GB",
            stage: SanctionStage.PreQuote,
            isSendEmail: true
        } as any;

        expect(() => {
            service.checkClientSanctions(paramsWithoutClientId);
        }).toThrowError('clientId is required for the sanctions check API');
    });

    it("should throw error if countryIsoCode is missing", () => {
        const paramsWithoutCountryIsoCode: SanctionsCheckRequest = {
            clientName: "Test Company",
            clientUid: "test-uid-123",
            clientId: 123,
            stage: SanctionStage.PreQuote,
            isSendEmail: true
        } as any;

        expect(() => {
            service.checkClientSanctions(paramsWithoutCountryIsoCode);
        }).toThrowError('countryIsoCode is required for the sanctions check API');
    });

    it("should handle API errors", () => {
        const params: SanctionsCheckRequest = {
            clientName: "Error Company",
            clientUid: "test-uid-789",
            clientId: 789,
            countryIsoCode: "GB",
            stage: SanctionStage.PreQuote,
            isSendEmail: true,
            onGoingScreening: false
        };

        service.checkClientSanctions(params).subscribe({
            next: () => fail('Expected error'),
            error: (error) => {
                expect(error.status).toBe(500);
            }
        });

        const request = httpMock.expectOne('/clients/sanctions-check');
        request.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

});
