import { TestBed, waitForAsync } from "@angular/core/testing";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { CoverageType } from "@app/models";
import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { MultiplePropertyBusinessLines } from "@app/quote/models/MultiplePropertyBusinessLines";
import { HttpClient } from "@angular/common/http";
import { Data } from "@angular/router";

describe("CoverageHttpService", () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let service: CoverageHttpService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [CoverageHttpService],
            imports: [HttpClientTestingModule],
        });
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(CoverageHttpService);
    }));

    it("Should be created", () => {
        expect(service).toBeTruthy();
    });

    it("Should call HTTP GET once to get all available coverages", () => {
        // Actors
        httpClient
            .get<Data>("/api/Coverage/GetAvailable")
            .subscribe((coverageTypes: CoverageType[]) => {
                expect(coverageTypes).toBeDefined();
                expect(coverageTypes.length).toBe(6);
                expect(coverageTypes[0].name).toBe("Directors & Officers");
                expect(coverageTypes[0].childCoverageTypes.length).toBe(2);
                expect(coverageTypes[0].childCoverageTypes[0].name).toBe(
                    "Non-Executive Liability"
                );
            });

        const req = httpTestingController.expectOne(
            "/api/Coverage/GetAvailable"
        );

        expect(req.request.method).toEqual("GET");

        req.flush(getTestCoverageTypes());

        httpTestingController.verify();
    });

    it("Should call HTTP GET to get all available multiple property business lines products", () => {
        // Actors
        httpClient.get<Data>("/api/templates/GetMultiplePropertyBusinessLineProducts/MD")
            .subscribe((multiplePropertyBusinessLines: MultiplePropertyBusinessLines) => {
                    expect(multiplePropertyBusinessLines).toBeDefined();
                    expect(multiplePropertyBusinessLines.products.length).toBeGreaterThanOrEqual(1);
                    expect(multiplePropertyBusinessLines.products[0].productName).toBe("T&S");
                }
            );

        const req = httpTestingController.expectOne("/api/templates/GetMultiplePropertyBusinessLineProducts/MD");

        expect(req.request.method).toEqual("GET");

        req.flush(getBusinessLines());

        httpTestingController.verify();
    });

    function getTestCoverageTypes() {
        return [
            {
                id: 1,
                name: "Directors & Officers",
                childCoverageTypes: [
                    {
                        id: 7,
                        name: "Non-Executive Liability",
                    },
                    {
                        id: 8,
                        name: "Entity",
                    },
                ],
            },
            {
                id: 2,
                name: "Corporate Liability",
            },
            {
                id: 3,
                name: "Employment Practices Liability",
                childCoverageTypes: [
                    {
                        id: 9,
                        name: "Wage & Hour",
                    },
                ],
            },
            {
                id: 4,
                name: "Cyber, Privacy, Media",
                childCoverageTypes: [
                    {
                        id: 10,
                        name: "Cyber",
                    },
                    {
                        id: 11,
                        name: "Privacy",
                    },
                    {
                        id: 12,
                        name: "Privacy Breach Notification",
                    },
                    {
                        id: 13,
                        name: "System Damage",
                    },
                    {
                        id: 14,
                        name: "System Interruption",
                    },
                ],
            },
            {
                id: 5,
                name: "Crime",
            },
            {
                id: 6,
                name: "Kidnap & Ransom",
                childCoverageTypes: [
                    {
                        id: 15,
                        name: "Covered Person Personal Accident",
                    },
                    {
                        id: 16,
                        name: "Emergency Evacuation Expenses",
                    },
                ],
            },
        ] as CoverageType[];
    }

    function getBusinessLines(): MultiplePropertyBusinessLines {
        var multiplePropertyBusinessLines = {
            businessLine: "MD",
            products: [
                {
                    productName: "T&S",
                    productId: 1,
                    productUid: "1",
                    productDisplay: "T&S",
                },
            ],
        } as MultiplePropertyBusinessLines;
        return multiplePropertyBusinessLines;
    }
});
