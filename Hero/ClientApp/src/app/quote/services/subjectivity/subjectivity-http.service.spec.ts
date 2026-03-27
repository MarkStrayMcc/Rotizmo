import { async, inject, TestBed } from "@angular/core/testing";
import {  RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { getTestQuote } from "../../../../test-helpers/index";
import { SubjectivityHttpService } from "@app/quote/services/subjectivity/subjectivity-http.service";
import { Subjectivity } from "@app/models";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("SubjectivityHttpService",
    () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: XHRBackend,
                        useClass: MockBackend,
                    },
                    SubjectivityHttpService,
                ],
                imports: [HttpClientTestingModule],
            });
        }));

        it("Should be created",
            inject([XHRBackend, SubjectivityHttpService], (service: SubjectivityHttpService) => {
                expect(service).toBeTruthy();
            }),
        );

        it("Should call HTTP GET once to get all available subjectivities",
            inject([XHRBackend, SubjectivityHttpService],
                (mockBackend: MockBackend, service: SubjectivityHttpService) => {
                    // Actors
                    let connectionCount = 0;
                    const testQuote = getTestQuote();
                    testQuote.draftQuoteId = "Quote:abc123";

                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            // Asserts
                            let url = `/subjectivity/getsubjectivity?productId=${testQuote.product.productId}&languageId=${testQuote.languageId}&countryId=${testQuote.clientLocation.countryId}&isAdmitted=${testQuote.product.isAdmitted}`;
                            expect(connection.request.method).toBe(RequestMethod.Get);
                            expect(connection.request.url).toBe(url);

                            connectionCount++;

                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(getTestSubjectivities()),
                                status: 200,
                            })));
                        });

                    // Actions
                    service.getMainData(testQuote.product.productId, testQuote.languageId, testQuote.clientLocation.countryId, testQuote.product.isAdmitted).subscribe(
                        (subjectivities: Subjectivity[]) => {
                            // Asserts
                            expect(subjectivities).toBeDefined();
                            expect(subjectivities.length).toBe(3);
                            expect(subjectivities[0].subjectivityId).toBe(1);
                            expect(subjectivities[0].text).toBe("Subjectivity1");
                            expect(connectionCount).toBe(1);
                        });
                }),
        );

        function getTestSubjectivities() {
            return [
                {
                    subjectivityId: 1,
                    text: "Subjectivity1"
                },
                {
                    subjectivityId: 2,
                    text: "Subjectivity2"
                },
                {
                    subjectivityId: 3,
                    text: "Subjectivity3"
                },
            ] as Subjectivity[];
        }
    });
