import { TestBed } from "@angular/core/testing";
import { SanctionStage } from "@app/enums/SanctionStage";
import { SanctionsCheckRequest } from "@app/models";
import { of } from "rxjs";
import { CheckClientSanctionsHttpService } from "./check-client-sanctions-http.service";
import { CheckClientSanctionsService } from "./check-client-sanctions.service";

describe("CheckClientSanctionsService", () => {
    let service: CheckClientSanctionsService;
    let mockHttpService: jasmine.SpyObj<CheckClientSanctionsHttpService>;

    beforeEach(() => {
        mockHttpService = jasmine.createSpyObj('CheckClientSanctionsHttpService', ['checkClientSanctions']);

        TestBed.configureTestingModule({
            providers: [
                CheckClientSanctionsService,
                { provide: CheckClientSanctionsHttpService, useValue: mockHttpService }
            ],
        });

        service = TestBed.inject(CheckClientSanctionsService);
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    it("should delegate to HTTP service with all parameters", () => {
        const clientName = "Test Client";
        const clientUid = "test-uid-123";
        const clientIdNumber = 123;
        const countryIsoCode = "GB";
        const stage = SanctionStage.PreQuote;
        const isSendEmail = true;
        const onGoingScreening = null;
        
        const expectedParams: SanctionsCheckRequest = {
            clientName,
            clientUid,
            clientId: clientIdNumber,
            countryIsoCode,
            stage,
            isSendEmail,
            onGoingScreening
        };

        mockHttpService.checkClientSanctions.and.returnValue(of(true));

        service.checkClientSanctions(
            clientName,
            clientUid,
            clientIdNumber,
            countryIsoCode,
            stage,
            isSendEmail,
            onGoingScreening
        ).subscribe(result => {
            expect(result).toBe(true);
        });

        expect(mockHttpService.checkClientSanctions).toHaveBeenCalledWith(expectedParams);
    });
});
