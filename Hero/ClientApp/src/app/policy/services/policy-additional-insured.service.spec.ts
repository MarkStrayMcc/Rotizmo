import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { UserService } from "@app/services/user.service";
import { mockAdditionalInsured } from "../mta/popups/additional-insured/mta-additional-insured.component.mock";
import { PolicyAdditionalInsuredService } from "./policy-additional-insured.service";

describe("PolicyAdditionalInsuredService", () => {
    let service: PolicyAdditionalInsuredService;
    let httpMock: HttpTestingController;

    const testAdditionalInsureds = [mockAdditionalInsured];
    const testPolicyNumber = "test";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PolicyAdditionalInsuredService,
                {
                    provide: UserService,
                    useValue: { isFeatureAccessible: () => true },
                },
            ],
        });

        service = TestBed.inject(PolicyAdditionalInsuredService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    describe("get", () => {
        it("should GET the additional insured from a given policy from the v2 endpoint", () => {
            testGet(`/api/policy/${testPolicyNumber}/additional-insured`);
        });

        it("should GET the additional insured from a given policy from the v1 endpoint when feature is toggled off", () => {
            TestBed.inject(UserService).isFeatureAccessible = () => false;
            testGet(`/policy/${testPolicyNumber}/additional-insured`);
        });

        const testGet = (expectedUrl: string) => {
            // Arrange
            service
                .get(testPolicyNumber)
                .subscribe(result => expect(result).toEqual(testAdditionalInsureds), fail);

            const request = httpMock.expectOne(expectedUrl);

            // Act
            request.flush(testAdditionalInsureds);

            // Assert
            expect(request.request.method).toBe("GET");
        };
    });
});
