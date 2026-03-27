import { async, inject, TestBed } from "@angular/core/testing";
import {  RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { TriaHttpService } from "@app/services/tria-http.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { PricingInformation } from "@app/models/auto-generated/PricingInformation";

describe("TriaService", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend,
                },
                TriaHttpService
            ],
            imports: [HttpClientTestingModule],
        });
    }));

    it("Should be created",
        inject([XHRBackend, TriaHttpService], (service: TriaHttpService) => {
            expect(service).toBeTruthy();
        }),
    );

    it("Should call HTTP POST to calculate TRIA Premium",
        inject([XHRBackend, TriaHttpService],
            (mockBackend: MockBackend, service: TriaHttpService) => {
                // Arrange
                const url = "/pricing/tria";
                const quotePricingInformation = getPricingInformation();
                const triaPremiumResult = 3500;

                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Post);
                        expect(connection.request.url).toBe(url);

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(triaPremiumResult),
                            status: 200,
                        })));
                    });

                service.calculateTriaPremium(quotePricingInformation)
                    .subscribe(triaPremium => {
                        // Asserts
                        expect(triaPremium).toBeDefined();
                        expect(triaPremium).toBe(triaPremiumResult);
                    });
            }),
    );

    function getPricingInformation(): PricingInformation[] {
        return [
            {
                quoted: 1000,
                businessLine: { name: "CP", description: "Cyber And Privacy"}
            },
            {
                quoted: 2000,
                businessLine: { name: "GL", description: "General Liability" }
            }
        ] as PricingInformation[];
    }

});
