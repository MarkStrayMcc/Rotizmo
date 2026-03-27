import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { EnrichmentAdapterHttpService } from "./enrichment-adapter.http-service";
import { EnrichedData } from "@app/models/enrichedData";

describe("EnrichmentAdapterHttpService", () => {
	let service: EnrichmentAdapterHttpService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [EnrichmentAdapterHttpService],
		});

		service = TestBed.inject(EnrichmentAdapterHttpService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it("should create service", () => {
		expect(service).toBeTruthy();
	});

	it("should retrieve the enrichment information for client", () => {
		// Arrange
		const clientUid = "5DD00A27-3FEC-4FF0-9813-F67710374D9C";
		const expectedEnrichmentData: EnrichedData = {
			key: "ENRICHED:IncorporationDate",
			value: { type: "Date", value: "1994-04-27T00:00:00" },
		};
		// Act
		service.getEnrichmentDataByClientUid(clientUid).subscribe((response) => {
			expect(response).toBe(expectedEnrichmentData);
		}, fail);

		const request = httpMock.expectOne(`/EnrichmentAdapter/get/${clientUid}`);

		// Act
		request.flush(expectedEnrichmentData);
	});
});
