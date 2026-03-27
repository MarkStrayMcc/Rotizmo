import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { EnrichmentAdapterHttpService } from "./enrichment-adapter.http-service";
import { EnrichedData } from "@app/models/enrichedData";
import { EnrichmentAdapterService } from "./enrichment-adapter.service";

describe("EnrichmentAdapterService", () => {
	let httpService: EnrichmentAdapterHttpService;
	let service: EnrichmentAdapterService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [EnrichmentAdapterHttpService, EnrichmentAdapterService],
		});

		httpService = TestBed.inject(EnrichmentAdapterHttpService);
		service = TestBed.inject(EnrichmentAdapterService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it("should create service", () => {
		expect(service).toBeTruthy();
	});

	it("should retrieve data with enrichment data ", () => {
		// Arrange
		const clientUid = "5DD00A27-3FEC-4FF0-9813-F67710374D9C";
		const expectedEnrichmentData: EnrichedData[] = [
			{
				key: "ENRICHED:IncorporationDate",
				value: { type: "Date", value: "1994-04-27T00:00:00" },
			},
		];

		// Act
		service.getEnrichmentDataByClientUid(clientUid).subscribe((response) => {
			expect(response.length).toEqual(expectedEnrichmentData.length);
			expect(response[0].key).toEqual(response[0].key);
			expect(response[0].value.type).toEqual(response[0].value.type);
			expect(response[0].value.value).toEqual(response[0].value.value);
		}, fail);

		const request = httpMock.expectOne(`/EnrichmentAdapter/get/${clientUid}`);

		// Act
		request.flush({ "ENRICHED:IncorporationDate": { type: "Date", value: null } });
	});

	it("should return null if client doesn't have any enriched data ", () => {
		// Arrange
		const clientUid = "5DD00A27-3FEC-4FF0-9813-F67710374D9C";
		const expectedEnrichmentData: EnrichedData[] = null;

		// Act
		service.getEnrichmentDataByClientUid(clientUid).subscribe((response) => {
			expect(response).toBe(expectedEnrichmentData);
		}, fail);

		const request = httpMock.expectOne(`/EnrichmentAdapter/get/${clientUid}`);

		// Act
		request.flush(expectedEnrichmentData, { status: 404, statusText: null });
	});
});
