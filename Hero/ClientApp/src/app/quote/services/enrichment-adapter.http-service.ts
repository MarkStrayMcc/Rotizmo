import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EnrichedData } from "@app/models/enrichedData";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class EnrichmentAdapterHttpService extends BaseService {
	constructor(http: HttpClient) {
		super(http);
	}

	public getEnrichmentDataByClientUid(clientUid: string): Observable<EnrichedData> {
		const url: string = `/EnrichmentAdapter/get/${clientUid}`;
		return this.http.get<EnrichedData>(url);
	}
}
