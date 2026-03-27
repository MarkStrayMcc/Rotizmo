import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AdditionalInsuredMtaRequest } from "@app/policy/models/AdditionalInsuredMtaRequest";
import { UserService } from "@app/services/user.service";
import { Guid } from "guid-typescript";
import { GetCancellationPremiumResponse } from "../models/GetCancellationPremiumResponse";
import { CancellationMtaRequest } from "../models/CancellationMtaRequest";
import { ManualChangeMtaRequest } from "../models/ManualMtaRequest";
import { MtaResult } from "../models/MtaResult";
import { MtaService } from "./mta.service";
import * as moment from "moment";

describe("MtaService", () => {
    let service: MtaService;
    let httpMock: HttpTestingController;

    const testMtaId = Guid.create().toString();
    const testPolicyNumber = "test";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                MtaService,
                {
                    provide: UserService,
                    useValue: { isFeatureAccessible: () => true },
                },
            ],
        });

        service = TestBed.inject(MtaService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    describe("postManualChangeMta", () => {
        const expectedRequest = <ManualChangeMtaRequest>{ description: "test" };

        it("should POST the manual change MTA request to v2 endpoint", () => {
            testPostManualChangeMta(`/api/policy/${testPolicyNumber}/mta/manual`);
        });

        it("should POST the manual change MTA request to v1 endpoint when feature is toggled off", () => {
            TestBed.inject(UserService).isFeatureAccessible = () => false;
            testPostManualChangeMta(`/Mta/ManualChangeMta/${testPolicyNumber}`);
        });

        const testPostManualChangeMta = (expectedUrl: string) => {
            // Arrange
            service
                .postManualChangeMta(testPolicyNumber, expectedRequest)
                .subscribe(result => expect(result.mtaId).toEqual(testMtaId), fail);

            const request = httpMock.expectOne(expectedUrl);

            // Act
            request.flush(testMtaId);

            // Assert
            expect(request.request.method).toBe("POST");
        };
    });

    describe("getManualMtaTypes", () => {
        const expectedManualMtaTypes = [1, 3, 6, 7];

        it("should GET the manual change MTA types from the v2 endpoint", () => {
            testPostManualChangeMta(`/api/policy/${testPolicyNumber}/mta/manual/types`, testPolicyNumber);
        });

        it("should GET the manual change MTA types from the v1 endpoint when feature is toggled off", () => {
            TestBed.inject(UserService).isFeatureAccessible = () => false;
            testPostManualChangeMta(`/Mta/GetManualChangeMtaTypes/${testPolicyNumber}`, testPolicyNumber);
        });

        const testPostManualChangeMta = (expectedUrl: string, getManualMtaTypesPolicyNumber: string) => {
            // Arrange
            service
                .getManualMtaTypes(getManualMtaTypesPolicyNumber)
                .subscribe(manualMtaTypes => expect(expectedManualMtaTypes).toEqual(manualMtaTypes), fail);

            const request = httpMock.expectOne(expectedUrl);

            // Act
            request.flush(expectedManualMtaTypes);

            // Assert
            expect(request.request.method).toBe("GET");
        };
    });

    describe("postAdditionalInsuredMta", () => {
        const expectedRequest = <AdditionalInsuredMtaRequest>{ additionalInsureds: [{ entityName: "test" }] };

        it("should POST the Additional Insured MTA request to v2 endpoint", () => {
            testPostAdditionalInsuredMta(`/api/policy/${testPolicyNumber}/additional-insured`);
        });

        it("should POST the Additional Insured MTA request to v1 endpoint when feature is toggled off", () => {
            TestBed.inject(UserService).isFeatureAccessible = () => false;
            testPostAdditionalInsuredMta(`/Mta/AdditionalInsured/${testPolicyNumber}`);
        });

        const testPostAdditionalInsuredMta = (expectedUrl: string) => {
            // Arrange
            service
                .postAdditionalInsuredMta(testPolicyNumber, expectedRequest)
                .subscribe(result => expect(result.mtaId).toEqual(testMtaId), fail);

            const request = httpMock.expectOne(expectedUrl);

            // Act
            request.flush(<MtaResult>{ mtaId: testMtaId });

            // Assert
            expect(request.request.method).toBe("POST");
        };
    });

    describe("postCancellationMta", () => {
        const expectedRequest = <CancellationMtaRequest>{ cfcUserId: "123", cancellationReason: "ab-initio"};

        it("should POST the Cancellation MTA request to v2 endpoint", () => {
            testPostCancellationMta(`/api/policy/${testPolicyNumber}/cancellation`);
        });

        it("should POST the Cancellation MTA request to v1 endpoint when feature is toggled off", () => {
            TestBed.inject(UserService).isFeatureAccessible = () => false;
            testPostCancellationMta(`/Mta/Cancellation/${testPolicyNumber}`);
        });
        
        const testPostCancellationMta = (expectedUrl: string) => {
            // Arrange
            service
                .postCancellation(expectedRequest, testPolicyNumber)
                .subscribe(result => expect(result.mtaId).toEqual(testMtaId), fail);

            const request = httpMock.expectOne(expectedUrl);

            // Act
            request.flush(testMtaId);

            // Assert
            expect(request.request.method).toBe("POST");
        };
    })

    describe("getCancellationPremium", () => {
        const getCancellationPremiumResponse: GetCancellationPremiumResponse = {
            currencyIsoCode: "GBP",
            totalReturnPremium: 1000,
            returnFee: 10,
            taxRate: 2
        }

        it("should make a cancellation premium GET request to v2 endpoint", () => {
            const testEffectiveDate = moment().toDate();
            const expectedUrl = `/api/policy/${testPolicyNumber}/cancellation/premium?effectiveDate=${testEffectiveDate.toISOString()}`;
            
            testGetCancellationPremium(expectedUrl, testPolicyNumber, testEffectiveDate);
        });

        it("should make a cancellation premium GET request to v1 endpoint when feature is toggled off", () => {
            TestBed.inject(UserService).isFeatureAccessible = () => false;
            testGetCancellationPremium(`/Mta/CancellationPremium/${testPolicyNumber}`, testPolicyNumber);
        });

        const testGetCancellationPremium = (expectedUrl: string, testPolicyNumber: string, testDffectiveDate?: Date) => {
            // Arrange
            service
                .getCancellationPremium(testPolicyNumber, testDffectiveDate)
                .subscribe(result => expect(result).toEqual(getCancellationPremiumResponse), fail);

            const request = httpMock.expectOne(expectedUrl);

            // Act
            request.flush(getCancellationPremiumResponse);

            // Assert
            expect(request.request.method).toBe("GET");
        };
    });
});
