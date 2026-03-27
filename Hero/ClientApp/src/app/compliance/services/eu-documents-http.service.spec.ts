import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Email, EmailType, MessageResult } from "@app/models";
import { EuDocumentsHttpService } from './eu-documents-http.service';
import { SendEuDocumentsRequest } from '@app/models/auto-generated/SendEuDocumentsRequest';

describe("EuDocumentsHttpService",
    () => {
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: XHRBackend,
                        useClass: MockBackend
                    },
                    EuDocumentsHttpService
                ],
                imports: [HttpClientTestingModule]
            });
        }));

        it("Should call HTTP POST when sending an EU document email",
            inject([XHRBackend, EuDocumentsHttpService],
                (mockBackend: MockBackend, emailHttpService: EuDocumentsHttpService) => {
                    // Actors
                    let connectionCount = 0;
                    const result = new MessageResult();
                    result.succeeded = true;

                    mockBackend.connections.subscribe(
                        (connection: MockConnection) => {
                            // Asserts
                            expect(connection.request.method).toBe(RequestMethod.Post);
                            expect(connection.request.url).toBe("/SendEuDocuments");

                            connectionCount++;

                            connection.mockRespond(new Response(new ResponseOptions({
                                body: JSON.stringify(result),
                                status: 200
                            })));
                        });

                    // Actions
                    emailHttpService.sendEuDocuments({
                        to: [{
                            email: "qa@cfcunderwriting.com",
                            firstName: "TestFirstName",
                            lastName: "TestLastName",
                            name: "TestFirstName TestLastName"
                        }],
                        dataAttachments: [],
                        sender: {
                            email: "qa@cfcunderwriting.com",
                            firstName: "TestFirstName",
                            lastName: "TestLastName",
                            name: "TestFirstName TestLastName"
                        },
                        subject: "Test",
                        emailType: EmailType.sendQuote,
                        emailBody: "Email body",
                        clientUid: "42b06583-6f27-4c54-b80c-5d7e5d3b4b5c",
                        cc: null,
                        bcc: null,
                        mergeFields: null,
                        serverSideAttachments: null,
                    }).subscribe(
                        (x: MessageResult) => {
                            // Asserts
                            expect(connectionCount).toBe(1);
                        }
                    );
                })
        );
    });
