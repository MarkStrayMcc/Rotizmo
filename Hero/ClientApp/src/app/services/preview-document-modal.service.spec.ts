import { async, ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, inject, TestBed, tick } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { By } from "@angular/platform-browser";

import { Client, ClientLocation, Country, Document, Quote } from "@app/models";
import { DocumentPreviewTypes } from "@app/models/document-preview-types";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { getTestQuote } from "../../test-helpers/index";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Product } from "@app/models/auto-generated/Product";
import { BrokerTeam } from "@app/models/auto-generated/BrokerTeam";

describe("PreviewDocumentModalService", () => {
    let quote: Quote;
    let endorsement: Document;
    let previewDocumentModalService: PreviewDocumentModalService;
    let httpMock: HttpTestingController;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                PreviewDocumentModalService,
                ModalDialogService,
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                { provide: MatDialogRef, useClass: MockMatDialogRef }
            ],
            imports: [
                HttpClientTestingModule,
                MatDialogModule
            ]
        });
        httpMock = TestBed.inject(HttpTestingController);
    }));

    beforeEach(inject([PreviewDocumentModalService], service => previewDocumentModalService = service));

    describe("openPreviewClauseDialog", () => {
        beforeEach(() => {
            ({ quote, endorsement } = createTestData(quote, endorsement));
        });

        //Assert
        it("should open the modal for endorsement document preview", () => {
            const openDialogSpy = spyOn(previewDocumentModalService.modalDialogService, "openDialog").and.stub();
            previewDocumentModalService.openPreviewClauseDialog(endorsement, quote, "Preview Title");

            expect(openDialogSpy).toHaveBeenCalled();
        });
    });

    describe("openPreviewDocumentDialog", () => {
        beforeEach(() => {
            ({ quote, endorsement } = createTestData(quote, endorsement));
        });

        // Assert
        it("should open the modal for policy document preview", () => {
            const openDialogSpy = spyOn(previewDocumentModalService.modalDialogService, "openDialog").and.stub();
            const previewType = new DocumentPreviewTypes().policyDocumentPreview;
            previewDocumentModalService.openPreviewDocumentDialog(previewType, quote);

            expect(openDialogSpy).toHaveBeenCalled();
        });

        it("should open the modal for wording document preview", () => {
            const openDialogSpy = spyOn(previewDocumentModalService.modalDialogService, "openDialog").and.stub();
            const previewType = new DocumentPreviewTypes().wordingDocumentPreview;
            previewDocumentModalService.openPreviewDocumentDialog(previewType, quote);

            expect(openDialogSpy).toHaveBeenCalled();
        });

        it("should open the modal for quote document preview", () => {
            const openDialogSpy = spyOn(previewDocumentModalService.modalDialogService, "openDialog").and.stub();
            const previewType = new DocumentPreviewTypes().quoteDocumentPreview;
            previewDocumentModalService.openPreviewDocumentDialog(previewType, quote);

            expect(openDialogSpy).toHaveBeenCalled();
        });
    });
});

class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
}

function createTestData(quote: Quote, endorsement: Document) {
    quote = new Quote();
    quote.inceptionDate = new Date(2018, 12, 24);
    quote.policyNumber = "FI1234567890";
    quote.client = new Client();
    quote.client.companyName = "Something Inc.";
    quote.insuredLocation = new ClientLocation();
    quote.insuredLocation.country = new Country();
    quote.insuredLocation.country.countryId = 1;
    quote.insuredLocation.country.isoCode = "UK";
    quote.insuredLocation.country.name = "United Kingdom";
    quote.product = new Product();
    quote.product.isAdmitted = false;
    quote.brokerTeam = new BrokerTeam();
    quote.brokerTeam.id = 1;
    endorsement = new Document();
    endorsement.documentId = 123;
    endorsement.title = "Some title";
    endorsement.reference = "123";
    return { quote, endorsement };
}
