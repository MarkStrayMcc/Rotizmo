import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { getTestQuote } from "../../test-helpers/index";
import { QuoteHttpService } from "@app/services/quote-http.service";
import { Quote, QuoteBindRequest, QuoteBindResponse } from "@app/models";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Injectable } from "@angular/core";
import { UserService } from "@app/services/user.service";

describe("QuoteHttpService",
    () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: XHRBackend,
                        useClass: MockBackend,
                    },
                    QuoteHttpService,
                    { provide: UserService, useClass: MockUserService }
                ],
                imports: [ HttpClientTestingModule ],
            });
        }));

        it("Should call HTTP POST once to save draft quote",
            inject([XHRBackend, QuoteHttpService],
                (mockBackend: MockBackend, quoteHttpService: QuoteHttpService) => {
                    // Actors
                    let connectionCount = 0;
                    const testQuote = getTestQuote();

                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            // Asserts
                            expect(connection.request.method).toBe(RequestMethod.Post);
                            expect(connection.request.url).toBe("/Quote/SaveDraft");

                            connectionCount++;
                            testQuote.draftQuoteId = "Quote:abc123";

                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(testQuote),
                                status: 200,
                            })));
                        });

                    // Actions
                    quoteHttpService.saveDraft(testQuote).subscribe(
                        (quote: Quote) => {
                            // Asserts
                            expect(quote.draftQuoteId).toBe("Quote:abc123");
                            expect(connectionCount).toBe(1);
                        },
                    );
                }),
        );

        it("Should call HTTP POST to bind quote",
            inject([XHRBackend, QuoteHttpService],
                (mockBackend: MockBackend, quoteHttpService: QuoteHttpService) => {
                    const testRequest = new QuoteBindRequest();
                    const testReponse = new QuoteBindResponse();
                    testReponse.policyNumber = "TestPolicy";

                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            // Asserts
                            expect(connection.request.method).toBe(RequestMethod.Post);
                            expect(connection.request.url).toBe("/Quote/Bind");

                            testRequest.quoteId = 999;
                            testRequest.inceptionDate = new Date("20180401+00:00");
                            testRequest.expiryDate = new Date("20190401+00:00");
                            testRequest.receivedDate = new Date("20180401+00:00");

                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(testReponse),
                                status: 200,
                            })));
                        });

                    // Actions
                    quoteHttpService.bindQuote(testRequest).subscribe(
                        (response: QuoteBindResponse) => {
                            // Asserts
                            expect(response.policyNumber).toBe(testReponse.policyNumber);
                        },
                    );

                }
            )
        );
    });

@Injectable()
class MockUserService {
    public isFeatureAccessible(feature: string) { return true; };
}
