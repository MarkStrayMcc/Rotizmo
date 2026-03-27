import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { FeeHttpService } from "./fee-http.service";
import { Observable } from 'rxjs';
import { QuoteFeeRequest } from "@app/models/auto-generated/QuoteFeeRequest";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("FeeHttpService", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                FeeHttpService
            ],
            imports: [HttpClientTestingModule]
        });
    }));

    it("Should be created",
        inject([XHRBackend, FeeHttpService], (service: FeeHttpService) => {
            expect(service).toBeTruthy();
        })
    );

    it("Should call HTTP GET once to get maximum fee",
        inject([XHRBackend, FeeHttpService],
            (mockBackend: MockBackend, feeHttpService: FeeHttpService) => {
                // Actors
                let connectionCount = 0;
                const quoteFeeRequest: QuoteFeeRequest = {
                    countryCode: "",
                    stateCode: null,
                    productCode: "",
                    premium: 0,
                    defaultTotalFee: 0,
                    brokerGroupId: 0
                };


                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Post);
                        expect(connection.request.url).toBe("fee/getmaximumfee");

                        connectionCount++;

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getMockMaximumFee()),
                            status: 200
                        })));
                    });

                const request: QuoteFeeRequest = {
                    countryCode: "",
                    stateCode: null,
                    productCode: "",
                    premium: 0,
                    defaultTotalFee: 0,
                    brokerGroupId: 0
                };

                // Actions
                feeHttpService.getMaximumFee(request).subscribe(
                    (maxFee: number) => {
                        // Asserts
                        expect(maxFee).toBeDefined();
                        expect(maxFee).toBe(100);
                        expect(connectionCount).toBe(1);
                    });
            })
    );

    it("Should call HTTP GET once to get default fee",
        inject([XHRBackend, FeeHttpService],
            (mockBackend: MockBackend, feeHttpService: FeeHttpService) => {
                // Actors
                let connectionCount = 0;
                const quoteFeeRequest: QuoteFeeRequest = {
                    countryCode: "",
                    stateCode: null,
                    productCode: "",
                    premium: 0,
                    defaultTotalFee: 0,
                    brokerGroupId: 0
                };

                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Post);
                        expect(connection.request.url).toBe("fee/getdefaultfee");

                        connectionCount++;

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getMockDefaultFee()),
                            status: 200
                        })));
                    });

                const request: QuoteFeeRequest = {
                    countryCode: "",
                    stateCode: null,
                    productCode: "",
                    premium: 0,
                    defaultTotalFee: 0,
                    brokerGroupId: 0
                };

                // Actions
                feeHttpService.getDefaultFee(request).subscribe(
                    (defaultFee: number) => {
                        // Asserts
                        expect(defaultFee).toBeDefined();
                        expect(defaultFee).toBe(50);
                        expect(connectionCount).toBe(1);
                    });
            })
    );
    function getMockMaximumFee() {
        return 100;
    }
    function getMockDefaultFee() {
        return 50;
    }
});
