import { Injectable } from "@angular/core";
import { EnrichedData } from "@app/models/enrichedData";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { EnrichmentAdapterHttpService } from "./enrichment-adapter.http-service";

@Injectable()
export class EnrichmentAdapterService {
	constructor(private readonly enrichmentAdapterHttpService: EnrichmentAdapterHttpService) {}

	public getEnrichmentDataByClientUid(clientUid: string): Observable<EnrichedData[] | null> {
		return this.enrichmentAdapterHttpService.getEnrichmentDataByClientUid(clientUid).pipe(
			map((response: EnrichedData) => {
				const enrichedData: EnrichedData[] = [];
				Object.keys(response).forEach((key) => {
					enrichedData.push({ key: key, value: response[key] });
				});
				return enrichedData;
			}),
			catchError((error: any) => {
				console.error(error);
				return of(null);
			})
		);
	}
}
