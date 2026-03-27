import { async } from "@angular/core/testing";
import { inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { PolicyHttpService } from "@app/services/policy-http.service";
import { Policy } from "@app/models/auto-generated/Policy";
import { Observable } from "rxjs";

describe("PolicyHttpService", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                PolicyHttpService
            ],
            imports: [HttpClientTestingModule]
        });
    }));

    it("Should be created",
        inject([XHRBackend, PolicyHttpService], (service: PolicyHttpService) => {
            expect(service).toBeTruthy();
        })
    );
    it("Should call HTTP GET to get policy search results",
        inject([XHRBackend, PolicyHttpService],
            (mockBackend: MockBackend, policyHttpService: PolicyHttpService) => {
                // Actors
                let url = "testUrl";

                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getPolicies),
                            status: 200
                        })));
                    });

                // Actions
                policyHttpService.getPolicySearchResults(url).subscribe(
                    (policies: Policy[]) =>
                    // Asserts
                    {
                        expect(policies.length).toBe(2);
                        expect(policies[0].reference).toBe("test1");
                        expect(policies[0].companyName).toBe("client1");
                        expect(policies[0].brokerName).toBe("CPM");
                        expect(policies[0].productName).toBe("CPM");
                        expect(policies[0].inceptionDate).toBe("CPM");
                        expect(policies[0].expirationDate).toBe("CPM");
                        expect(policies[0].policyType).toBe("CPM");
                    });
            })
        );

        it("Should return empty array if no policy results found from http call",
          inject([XHRBackend, PolicyHttpService],
            (mockBackend: MockBackend, policyHttpService: PolicyHttpService) => {
              // Actors
              let url = "testUrl";

              mockBackend.connections.subscribe(
                (connection: MockConnection) => {
                  connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(getPolicies),
                    status: 200
                  })));
                });

              // Actions
              policyHttpService.getPolicySearchResults(url).subscribe(
                (policies: Policy[]) =>
                // Asserts
                {
                  expect(policies.length).toBe(0);
                });
            })
        );

    function getPolicies() {
        return [
            {
                reference: "test1",
                companyName: "client1",
                brokerName: "broker1",
                productName: "CPM",
                inceptionDate: "",
                expirationDate: "",
                policyType: "RN"
            },
            {
                reference: "test2",
                companyName: "client1",
                brokerName: "broker1",
                productName: "CPA",
                inceptionDate: "",
                expirationDate: "",
                policyType:"NB"
            }
        ] as Policy[];
    }

});
