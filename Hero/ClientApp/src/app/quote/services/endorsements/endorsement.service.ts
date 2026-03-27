import { Injectable } from "@angular/core";
import { Document } from "@app/models";
import { AutoAttachingEndorsementsRequest } from "@app/quote/models/endorsements/AutoAttachingEndorsementsRequest";
import { AvailableEndorsementsRequest } from "@app/quote/models/endorsements/AvailableEndorsementsRequest";
import { Observable } from "rxjs";
import { EndorsementHttpService } from "./endorsement-http.service";

@Injectable({ providedIn: "root" })
export class EndorsementService {
    constructor(private endorsementHttpService: EndorsementHttpService) {}

    public getAvailable(request: AvailableEndorsementsRequest): Observable<Document[] | any> {
        return this.endorsementHttpService.getAvailable(request);
    }

    public getAutoAttaching(request: AutoAttachingEndorsementsRequest): Observable<Document[] | any> {
        return this.endorsementHttpService.getAutoAttaching(request);
    }
}
