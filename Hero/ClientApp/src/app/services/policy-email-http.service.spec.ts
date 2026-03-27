import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { MessageResult } from "@app/models";
import { PolicyEmailHttpService } from "@app/services/policy-email-http.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("PolicyEmailHttpService",
    () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: XHRBackend,
                        useClass: MockBackend
                    },
                    PolicyEmailHttpService
                ],
                imports: [HttpClientTestingModule]
            });
        }));

        it("Should retrieve policy email template",
            inject([XHRBackend, PolicyEmailHttpService],
                (mockBackend: MockBackend, policyEmailHttpService: PolicyEmailHttpService) => {
                    // Actors
                    let connectionCount = 0;
                    const result = new MessageResult();
                    result.succeeded = true;
                    const policyNumber = "TEST123456";

                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            // Asserts
                            expect(connection.request.method).toBe(RequestMethod.Get);
                            expect(connection.request.url).toBe(`/policy/${policyNumber}/email-template`);

                            connectionCount++;

                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(result),
                                status: 200
                            })));
                        });

                    // Actions
                    policyEmailHttpService.getEmailTemplateForPolicy(policyNumber).subscribe(
                        (x: MessageResult) => {
                            // Asserts
                            expect(connectionCount).toBe(1);
                        }
                    );
                })
        );
    });
