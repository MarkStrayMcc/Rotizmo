import { inject, TestBed } from "@angular/core/testing";
import { Coverage } from "@app/models/auto-generated/Coverage";
import { Quote } from "@app/models/auto-generated/Quote";
import { PricingInformation } from "@app/quote/models/pricing/PricingInformation";
import { QuoteService } from "@app/quote/services/quote.service";
import { TriaHttpService } from "@app/services/tria-http.service";
import { TriaService } from "@app/services/tria.service";
import { of } from "rxjs";

describe("TriaService", () => {
    const mockTriaHttpService: TriaHttpService = jasmine.createSpyObj([""]);
    let quoteService: QuoteService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TriaService,
                {
                    provide: TriaHttpService,
                    useValue: mockTriaHttpService
                },
                {
                    provide: QuoteService,
                    useValue: { getQuote: () => getQuote(), setPropertyValue: jasmine.createSpy("setPropertyValue") }
                }
            ]
        });
        quoteService = TestBed.inject(QuoteService);
    });

    it("Should update tria premium to 0 when there is no premium",
        inject([TriaService], (triaService: TriaService) => {
            // Arrange
            const quote = getQuote();
            quote.premium = 0;
            quoteService.getQuote = jasmine.createSpy("getQuote").and.returnValue(quote);

            // Act
            triaService.updateTriaPremium();

            // Assert
            expect(quoteService.setPropertyValue).toHaveBeenCalledWith("triaPremium", 0);
        }));

    it("Should update tria premium to 0 when there is pricingInformation",
        inject([TriaService], (triaService: TriaService) => {
            // Arrange
            const quote = getQuote();
            quote.pricingInformation = [];
            quoteService.getQuote = jasmine.createSpy("getQuote").and.returnValue(quote);

            // Act
            triaService.updateTriaPremium();

            // Assert
            expect(quoteService.setPropertyValue).toHaveBeenCalledWith("triaPremium", 0);
        }));

    it("Should update tria premium to 0 when there is not TRIA coverage",
        inject([TriaService], (triaService: TriaService) => {
            // Arrange
            const quote = getQuote();
            quote.coverages = [];
            quoteService.getQuote = jasmine.createSpy("getQuote").and.returnValue(quote);

            // Act
            triaService.updateTriaPremium();

            // Assert
            expect(quoteService.setPropertyValue).toHaveBeenCalledWith("triaPremium", 0);
        }));

    it("Should update tria premium with value when all conditions are met",
        inject([TriaService, TriaHttpService], (triaService: TriaService, mockTriaHttpService: TriaHttpService) => {
            // Arrange
            const expectedValue = 150;
            const quote = getQuote();
            quote.coverages[1] = { coverageType: { isAdditionalCoverage: true, name: "TRIA" } } as Coverage;
            quoteService.getQuote = jasmine.createSpy("getQuote").and.returnValue(quote);

            const ob = of(expectedValue);

            mockTriaHttpService.calculateTriaPremium = jasmine.createSpy("calculateTriaPremium").and.returnValue(ob);

            // Act
            triaService.updateTriaPremium();

            // Assert
            expect(mockTriaHttpService.calculateTriaPremium).toHaveBeenCalled();
            expect(quoteService.setPropertyValue).toHaveBeenCalledWith("triaPremium", expectedValue);
        }));

    function getQuote(): Quote {
        const quote = {
            triaPremium: -1,
            premium: 122,
            coverages: [],
            pricingInformation: []
        } as Quote;

        quote.coverages[0] = { coverageType: { isAdditionalCoverage: false, name: "TEST" } } as Coverage;
        quote.pricingInformation[0] = {} as PricingInformation;

        return quote;
    }

});
