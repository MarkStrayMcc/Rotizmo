import { inject, TestBed } from "@angular/core/testing";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";
import { QuoteSubjectivity, Subjectivity } from "@app/models";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("QuoteSubjectivityService", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuoteSubjectivityService]
        });
    });

    it("Should be created", inject([QuoteSubjectivityService], (service: QuoteSubjectivityService) => {
        expect(service).toBeTruthy();
    }));

    it("Should return prior binding display text", inject([QuoteSubjectivityService], (quoteSubjectivityService: QuoteSubjectivityService) => {
        // Actors
        const subjectivities = getTestSubjectivities();

        // Actions
        const result = quoteSubjectivityService.formatSubjectivityDisplayText(subjectivities[0]);

        // Asserts
        expect(result).toBe("Test subjectivity 1 (prior to binding)");
    }));

    it("Should return post binding display text", inject([QuoteSubjectivityService], (quoteSubjectivityService: QuoteSubjectivityService) => {
        // Actors
        const subjectivities = getTestSubjectivities();

        // Actions
        const result = quoteSubjectivityService.formatSubjectivityDisplayText(subjectivities[1]);

        // Asserts
        expect(result).toBe("Test subjectivity 2 (14 days after binding)");
    }));

    function getTestSubjectivities() {
        return [
            {
                subjectivity: {
                    subjectivityId: 1,
                    text: "Test subjectivity 1"
                } as Subjectivity,
                isPost: false,
                days: 0,
            },
            {
                subjectivity: {
                    subjectivityId: 2,
                    text: "Test subjectivity 2"
                } as Subjectivity,
                isPost: true,
                days: 14,
            }
        ] as QuoteSubjectivity[];
    }
});
