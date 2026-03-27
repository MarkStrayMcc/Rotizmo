import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";
import { BaseService } from "@app/services/base.service";
import { PricingInformation } from "@app/models/auto-generated/PricingInformation";
import { TriaPremiumRequest } from "@app/models/auto-generated/TriaPremiumRequest";
import { TriaPricingInformation } from "@app/models/auto-generated/TriaPricingInformation";

@Injectable()
export class TriaHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public calculateTriaPremium(pricingInformation: PricingInformation[]): Observable<number | any> {
        const url = "pricing/tria";
        const request = this.mapTriaRequest(pricingInformation);
        return this.http.post(url, request)
            .pipe(catchError(this.handleErrorObservable));
    }

    private mapTriaRequest(pricingInformation: PricingInformation[]): TriaPremiumRequest {
        const request = new TriaPremiumRequest();
        request.triaPricingInformation = pricingInformation.map(this.mapPricingInformation);
        return request;
    }

    private mapPricingInformation(quotePricing: PricingInformation): TriaPricingInformation {
        const triaPricing = new TriaPricingInformation();
        triaPricing.businessLine = quotePricing.businessLine.name;
        triaPricing.quotedPremium = quotePricing.quoted;
        return triaPricing;
    }

}
