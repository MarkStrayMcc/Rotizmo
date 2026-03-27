import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Email, EmailType, MessageResult } from "@app/models";
import { QuoteEmailHttpService } from "@app/services/quote-email-http.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("QuoteEmailHttpService",
    () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: XHRBackend,
                        useClass: MockBackend
                    },
                    QuoteEmailHttpService
                ],
                imports: [HttpClientTestingModule]
            });
        }));

        it("Should retrieve quote email template",
            inject([XHRBackend, QuoteEmailHttpService],
                (mockBackend: MockBackend, quoteEmailHttpService: QuoteEmailHttpService) => {
                    // Actors
                    let connectionCount = 0;
                    const result = new MessageResult();
                    result.succeeded = true;
                    let quoteId = 1;

                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            // Asserts
                            expect(connection.request.method).toBe(RequestMethod.Get);
                            expect(connection.request.url).toBe(`/quote/${quoteId}/email-template`);

                            connectionCount++;

                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(result),
                                status: 200
                            })));
                        });

                    // Actions
                    quoteEmailHttpService.getEmailTemplateForQuote(quoteId).subscribe(
                        (x: MessageResult) => {
                            // Asserts
                            expect(connectionCount).toBe(1);
                        }
                    );
                })
        );
    });
