import { CommonModule } from "@angular/common";
import { Client, Quote } from "@app/models";
import { ToastrService } from "@app/shared/toastr/toastr.service";
import { MountResponse } from "cypress/angular";
import { Observable, of } from "rxjs";
import { QuoteService } from '@app/quote/services/quote.service';
import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { DropzoneFileInputComponent } from './dropzone-file-input.component';
import { MultiplePropertyUploadHttpService } from '../multiple-property-upload.http-service';

/// <reference types="cypress" />

class MockMultiplePropertyUploadHttpService {
    public upload(file: File, clientId: number, wordingVersionId: number): Observable<PropertyLimit[]> {
        return of([]);
    }
}

class MockQuoteService {
    public getQuote(): Quote {
        return {
            inceptionDate: new Date('2024-01-01'),
            expiryDate: new Date('2025-01-01')
        } as Quote;
    }

    public getClient(): Client {
        return { id: 1 } as Client;
    }

    public getWordingVersionId(): number {
        return 1;
    }
}

describe("Dropzone File Input Component", () => {
	let dropZoneFileInputComponent: DropzoneFileInputComponent;
	const multiplePropertiesXlsxFilePath = "cypress/fixtures/TestTerrorismTemplate.xlsx";
	const multiplePropertiesJsonFilePath = "cypress/fixtures/multiple-properties-xlsx-example.json";

	beforeEach(() => {
		cy.mount(DropzoneFileInputComponent, {
			imports: [CommonModule],
			providers: [
				{ provide: MultiplePropertyUploadHttpService, useClass: MockMultiplePropertyUploadHttpService },
                { provide: QuoteService, useClass: MockQuoteService },
				ToastrService
			],
		}).then((component: MountResponse<DropzoneFileInputComponent>) => {
			dropZoneFileInputComponent = component.fixture.componentInstance;
		});
	});
	it("should mount component", () => {
		cy.get("[id=dropzone-file-input]").should("not.be.visible");
	});

	it("Should select file when clicked", () => {
		cy.get("[id=dropzone-file-label]").click();
		cy.get("[id=dropzone-file-input]").selectFile("cypress/fixtures/example.json", { force: true });
        dropZoneFileInputComponent.fileName = "example.json";
		cy.get("[id=file-name]").should("exist");
		cy.get("[id=file-name]").should("have.text".trim(), "example.json");
	});

	it("Should not show error message when file is selected", () => {
		cy.get("[id=dropzone-file-label]").click();
		cy.get("[id=dropzone-file-input]").selectFile(multiplePropertiesXlsxFilePath, { force: true });
        dropZoneFileInputComponent.fileName = "TestTerrorismTemplate.xlsx";
		cy.get("[id=error-message]").should("not.exist");
	});

	it("Should show file name when file is selected", () => {
		cy.get("[id=dropzone-file-label]").click();
		cy.get("[id=dropzone-file-input]").selectFile("cypress/fixtures/example.json", { force: true });
        dropZoneFileInputComponent.fileName = "example.json";
		cy.get("[id=selected-file]").should("exist");
		cy.get("[id=file-name]").should("exist");
		cy.get("[id=file-name]").should("have.text".trim(), "example.json");
	});

	it("Should remove file when replace file clicked", () => {
		cy.get("[id=dropzone-file-label]").click();
		cy.get("[id=dropzone-file-input]").selectFile("cypress/fixtures/example.json", { force: true });
        dropZoneFileInputComponent.fileName = "example.json";
		cy.get("[id=replace-file]").should("exist");
		cy.get("[id=replace-file]").click();
		cy.get("[id=selected-file]").should("not.exist");
		cy.get("[id=file-name]").should("not.exist");
		cy.get("[id=dropzone-file-input]").should("exist");
	});

	it("Should not show error message when file is below 1GB", () => {
		cy.get("[id=dropzone-file-label]").click();
		cy.get("[id=dropzone-file-input]").selectFile(multiplePropertiesXlsxFilePath, { force: true });
        dropZoneFileInputComponent.fileName = "TestTerrorismTemplate.xlsx";
		dropZoneFileInputComponent.maxFileSize = 1048576;

		cy.get("[id=error-message]").should("not.exist");
	});

	it("Should show error message when file is above Max File Size", () => {
		dropZoneFileInputComponent.maxFileSize = 10;

		cy.get("[id=dropzone-file-label]").click();
		cy.get("[id=dropzone-file-input]").selectFile(multiplePropertiesXlsxFilePath, { force: true });
		cy.get("[id=error-message]").should("exist");
	});

	it("Should show error message when file type is not xlsx", () => {
		cy.get("[id=dropzone-file-label]").click();
		cy.get("[id=dropzone-file-input]").selectFile(multiplePropertiesJsonFilePath, { force: true });
		cy.get("[id=error-message]").should("exist");
	});
});
