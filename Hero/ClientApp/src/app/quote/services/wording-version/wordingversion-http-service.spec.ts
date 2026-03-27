import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { DropDownItem } from "@app/models";
import { WordingVersionHttpService } from "@app/quote/services/wording-version/wording-version-http-service";
import { getTestQuote } from "../../../../test-helpers/index";
import { getTestWordingVersions, getTestExcessWordingVersions } from "./wording-version.service.mock";

describe("WordingVersionHttpService", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                WordingVersionHttpService
            ],
            imports: [HttpClientTestingModule]
        });
    }));

    it("Should be created",
        inject([XHRBackend, WordingVersionHttpService], (service: WordingVersionHttpService) => {
            expect(service).toBeTruthy();
        })
    );

    it("Should call HTTP Get once to get all available wording versions",
        inject([XHRBackend, WordingVersionHttpService],
            (mockBackend: MockBackend, wordingversionHttpService: WordingVersionHttpService) => {
                // Actors
                let connectionCount = 0;
                const productCode = "CPM";
                const countryCode = "US";
                const languageCode = "en";
                const testQuote = getTestQuote();
                testQuote.draftQuoteId = "Quote:abc123";
                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Get);
                        expect(connection.request.url).toBe(`/dropdown/getWordingVersions?productCode=${productCode}&countryCode=${countryCode}&languageCode=${languageCode}`);
                        connectionCount++;

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getTestWordingVersions()),
                            status: 200
                        })));
                    });

                // Actions
                wordingversionHttpService.getWordingVersions(productCode, countryCode, languageCode).subscribe(
                    (wordingVersions: DropDownItem[]) => {
                        // Asserts
                        expect(wordingVersions).toBeDefined();
                        expect(wordingVersions.length).toBe(3);
                        expect(wordingVersions[0].text).toBe("Excess 1.0");
                        expect(wordingVersions[0].value).toBe("1");
                        expect(connectionCount).toBe(1);
                    });
            })
    );

    it("Should call HTTP Get once to get all available excess wording versions",
        inject([XHRBackend, WordingVersionHttpService],
            (mockBackend: MockBackend, wordingversionHttpService: WordingVersionHttpService) => {
                // Actors
                let connectionCount = 0;
                const productCode = "CPM";
                const countryCode = "US";
                const languageCode = "en";
                const testQuote = getTestQuote();
                testQuote.draftQuoteId = "Quote:abc123";
                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Get);
                        expect(connection.request.url).toBe(`/dropdown/getExcessWordingVersions?productCode=${productCode}&countryCode=${countryCode}&languageCode=${languageCode}`);
                        connectionCount++;

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getTestExcessWordingVersions()),
                            status: 200
                        })));
                    });

                // Actions
                wordingversionHttpService.getExcessWordingVersions(productCode, countryCode, languageCode).subscribe(
                    (wordingVersions: DropDownItem[]) => {
                        // Asserts
                        expect(wordingVersions).toBeDefined();
                        expect(wordingVersions.length).toBe(3);
                        expect(wordingVersions[0].text).toBe("Wording 1.0");
                        expect(wordingVersions[0].value).toBe("1");
                        expect(connectionCount).toBe(1);
                    });
            })
    );
});
