import { async } from "@angular/core/testing";
import { DocumentScopePipe } from "@app/quote/pipes/document-scope.pipe";
import { Document, DocumentScope } from "@app/models";

let mockEndorsements: Document[];

describe("DocumentScopePipe", () => {
    let pipe: DocumentScopePipe;

    beforeEach(async(() => {

        pipe = new DocumentScopePipe();

        mockEndorsements = [
            {
                documentId: 1,
                reference: "1",
                title: "USA AND CANADA JURISDICTION ENDORSEMENT",
                scopeId: DocumentScope.All
            } as Document,
            {
                documentId: 3,
                reference: "3",
                riskQuestionTags: ["four"],
                title: "USA JURISDICTION ENDORSEMENT",
                scopeId: DocumentScope.Quote
            } as Document,
            {
                documentId: 5,
                reference: "5",
                riskQuestionTags: ["three"],
                title: "PREMIUM PAYMENT ENDORSEMENT",
                scopeId: DocumentScope.Policy
            } as Document,
            {
                documentId: 6,
                reference: "6",
                title: "ENGLISH LANGUAGE AGREEMENT ENDORSEMENT",
                scopeId: DocumentScope.All
            } as Document,
            {
                documentId: 7,
                reference: "7",
                title: "TEST ENDORSEMENT",
                scopeId: DocumentScope.Quote
            } as Document
        ];
    }));

    it("should remove all endorsements with policy scope when filtering by quote scope", async(() => {
        const filteredEndorsements = pipe.transform(mockEndorsements, "quote");

        expect(filteredEndorsements.some(e => e.scopeId === DocumentScope.Policy)).toBe(false);
    }));

    it("should remove all endorsements with quote scope when filtering by policy scope", async(() => {
        const filteredEndorsements = pipe.transform(mockEndorsements, "policy");

        expect(filteredEndorsements.some(e => e.scopeId === DocumentScope.Quote)).toBe(false);
    }));
});
