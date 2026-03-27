import { HttpErrorResponse } from "@angular/common/http";
import {
	HttpClientTestingModule,
	HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ClientLocation } from "@app/models";
import { TemplateUploadResult } from "@app/models/template-upload-result";
import { PropertyLimit } from "@app/quote/models/property-limit.model";
import { MultiplePropertyUploadHttpService } from "./multiple-property-upload.http-service";

describe("MultiplePropertyUploadHttpService", () => {
	let service: MultiplePropertyUploadHttpService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [MultiplePropertyUploadHttpService],
		});

		service = TestBed.inject(MultiplePropertyUploadHttpService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it("should create service", () => {
		expect(service).toBeTruthy();
	});

	it("should create client location list", () => {
		// Arrange
		const file: File = new File([""], "filename");
		const clientId = 1;
		const wordingVersionId = 123456;
		const clientLocation: ClientLocation = {
			countryId: 1,
			clientLocationId: 1,
			clientId: 1,
			address1: "address1",
			address2: "address2",
			address3: "address3",
			city: "city",
			postcode: "postcode",
			isPrimaryLocation: true,
			stateProvinceCode: "stateProvinceCode",
			county: "county",
			disabledOn: new Date(),
			country: null,
		};
		const propertyLimit: PropertyLimit[] = [
			{
				insuredAddress: clientLocation,
				totalInsuredValue: 1000,
			},
		];

		service.upload(file, clientId, wordingVersionId).subscribe((response: TemplateUploadResult) => {
			expect(propertyLimit.length).toEqual(response.propertyLimits.length);
			expect(propertyLimit[0].insuredAddress.countryId).toEqual(response.propertyLimits[0].insuredAddress.countryId);
			expect(propertyLimit[0].insuredAddress.clientLocationId).toEqual(response.propertyLimits[0].insuredAddress.clientLocationId);
		}, fail);

		const request = httpMock.expectOne(`templates/upload`);

		// Act
		request.flush({ propertyLimits : propertyLimit });

		// Assert
		expect(request.request.method).toBe("POST");
		expect(request.request.body.get('clientId')).toEqual(clientId.toString());
		expect(request.request.body.get('wordingVersionId')).toEqual(wordingVersionId.toString());
		expect(request.request.body.get('files')).toEqual(file);
	});

	it("should return a TemplateUploadResult on successful upload", () => {
		const file: File = new File([""], "filename");
		const clientId = 1;
		const wordingVersionId = 123456;
		const clientLocation: ClientLocation = {
			countryId: 1,
			clientLocationId: 1,
			clientId: 1,
			address1: "address1",
			address2: "address2",
			address3: "address3",
			city: "city",
			postcode: "postcode",
			isPrimaryLocation: true,
			stateProvinceCode: "stateProvinceCode",
			county: "county",
			disabledOn: new Date(),
			country: null,
		};

		const propertyLimit: PropertyLimit[] = [
			{
				insuredAddress: clientLocation,
				totalInsuredValue: 1000,
			},
		];

		const mockResult: TemplateUploadResult = {
			propertyLimits: propertyLimit,
			validationResults: [],
			templateValidationError: null,
		};

		service
			.upload(file, clientId, wordingVersionId)
			.subscribe((response: TemplateUploadResult) => {
				expect(response).toEqual(mockResult);
			}, fail);

		const request = httpMock.expectOne(`templates/upload`);

		request.flush(mockResult);

		expect(request.request.method).toBe("POST");
		expect(request.request.body.get("clientId")).toEqual(clientId.toString());
		expect(request.request.body.get("wordingVersionId")).toEqual(wordingVersionId.toString());
		expect(request.request.body.get("files")).toEqual(file);
	});

	it("should transform a 400 error with string message into a TemplateUploadResult", () => {
		const file: File = new File([""], "filename.xlsx");
		const clientId = 1;
		const wordingVersionId = 1;
		const errorMessage = "Template mismatch";

		service.upload(file, clientId, wordingVersionId).subscribe((result) => {
			expect(result.templateValidationError).toBe(errorMessage);
			expect(result.propertyLimits).toEqual([]);
			expect(result.validationResults).toEqual([]);
		});

		const req = httpMock.expectOne("templates/upload");
		expect(req.request.method).toBe("POST");

		req.flush(errorMessage, {
			status: 400,
			statusText: "Bad Request",
		});
	});

	it("should transform a 400 error with object message into a TemplateUploadResult", () => {
		const file: File = new File([""], "filename.xlsx");
		const clientId = 1;
		const wordingVersionId = 1;
		const errorMessage = "Template mismatch";

		service.upload(file, clientId, wordingVersionId).subscribe((result) => {
			expect(result.templateValidationError).toBe(errorMessage);
			expect(result.propertyLimits).toEqual([]);
			expect(result.validationResults).toEqual([]);
		});

		const req = httpMock.expectOne("templates/upload");
		expect(req.request.method).toBe("POST");

		req.flush(
			{ templateValidationError: errorMessage },
			{ status: 400, statusText: "Bad Request" }
		);
	});

	it("should throw an error for non-400 HTTP errors", () => {
		const file: File = new File([""], "filename.xlsx");
		const clientId = 1;
		const wordingVersionId = 1;

		service.upload(file, clientId, wordingVersionId).subscribe({
			next: () => fail("should have failed with 500 error"),
			error: (error: HttpErrorResponse) => {
				expect(error.status).toBe(500);
			},
		});

		const req = httpMock.expectOne("templates/upload");
		expect(req.request.method).toBe("POST");

		req.flush("Something went wrong", {
			status: 500,
			statusText: "Internal Server Error",
		});
	});
});
