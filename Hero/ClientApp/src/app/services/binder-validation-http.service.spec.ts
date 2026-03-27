import { inject, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { MockConnection } from "@angular/http/testing";
import { BinderValidationCriteria } from "@app/models";
import { BinderValidationHttpService } from "@app/services/binder-validation-http.service";
import { DecimalPipe } from "@angular/common";

describe("BinderValidationHttpService", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                BinderValidationHttpService,
                DecimalPipe
            ],
            imports: [HttpClientTestingModule]
        });
    });

    it("Should be created", inject([BinderValidationHttpService], (service: BinderValidationHttpService) => {
        expect(service).toBeTruthy();
    }));

    it("Should call HTTP GET once to get all available coverages",
        inject([XHRBackend, BinderValidationHttpService],
            (mockBackend: MockBackend, binderValidationHttpService: BinderValidationHttpService) => {
                // Actors
                let connectionCount = 0;
                const endpointUrl = "/BinderValidation/GetBinderValidationCriterias";
                const testDraftQuoteId = "Quote:abc123";
                const testBusinessLineCodes = "DO,CL,MD";

                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Get);
                        expect(connection.request.url)
                            .toBe(`${endpointUrl}?draftQuoteId=${
                                testDraftQuoteId}&businessLineCodes=${
                                testBusinessLineCodes}`);

                        connectionCount++;

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getTestBinderValidationCriterias()),
                            status: 200
                        })));
                    });

                // Actions
                binderValidationHttpService.getBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes)
                    .subscribe(
                        (criterias: { [businessCategoryTagName: string]: BinderValidationCriteria[] }) => {
                            // Asserts
                            expect(criterias).toBeDefined();
                            expect(criterias.CL).toBeDefined();
                            expect(criterias.CL.length).toBe(2);
                            expect(criterias.CL[0].binderSectionId).toBe(1);
                            expect(criterias.CL[1].binderSectionId).toBe(3);
                            expect(connectionCount).toBe(1);
                        });
            })
    );

    function getTestBinderValidationCriterias(): { [businessCategoryTagName: string]: BinderValidationCriteria[] } {
        const criterias: { [businessCategoryTagName: string]: BinderValidationCriteria[] } = {};

        criterias.DO = [
            { binderSectionId: 1 },
            { binderSectionId: 2 }
        ] as BinderValidationCriteria[];
        criterias.CL = [
            { binderSectionId: 1 },
            { binderSectionId: 3 }
        ] as BinderValidationCriteria[];
        criterias.MD = [
            { binderSectionId: 4 }
        ] as BinderValidationCriteria[];

        return criterias;
    }
});
