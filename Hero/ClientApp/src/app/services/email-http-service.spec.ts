import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { MtaEmailTemplate } from "@app/policy/models/MtaEmailTemplate";
import { UserService } from "@app/services/user.service";
import { Guid } from "guid-typescript";
import { EmailHttpService } from "./email-http.service";

describe("EmailHttpService", () => {
    let service: EmailHttpService;
    let httpMock: HttpTestingController;

    const testMtaId = Guid.create();
    const testPolicyNumber = "test";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                EmailHttpService,
                {
                    provide: UserService,
                    useValue: { isFeatureAccessible: () => true },
                },
            ],
        });

        service = TestBed.inject(EmailHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    describe("getEmailTemplateForMta", () => {
        it("should POST the manual change MTA request to v2 endpoint", () => {
            testPostManualChangeMta(`/api/policy/${testPolicyNumber}/mta/${testMtaId}/email-template`);
        });

        it("should POST the manual change MTA request to v1 endpoint when feature is toggled off", () => {
            TestBed.inject(UserService).isFeatureAccessible = () => false;
            testPostManualChangeMta(`/mta/mtatemplate/${testPolicyNumber}/${testMtaId}`);
        });

        const testPostManualChangeMta = (expectedUrl: string) => {
            // Arrange
            const expectedMtaEmailTemplate = <MtaEmailTemplate>{ subject: "Test Subject" };

            service
                .getEmailTemplateForMta(testPolicyNumber, testMtaId)
                .subscribe((mtaEmailTemplate: MtaEmailTemplate) => expect(mtaEmailTemplate).toEqual(expectedMtaEmailTemplate), fail);

            const request = httpMock.expectOne(expectedUrl);

            // Act
            request.flush(expectedMtaEmailTemplate);

            // Assert
            expect(request.request.method).toBe("GET");
        };
    });
});
