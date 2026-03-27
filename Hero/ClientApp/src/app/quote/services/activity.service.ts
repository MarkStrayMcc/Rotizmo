import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { ActivitySearchResponse } from "../components/activities/activity-search/ActivitySearchResponse";
import { ActivityHttpService } from "./activity-http.service";
import { QuoteService } from "./quote.service";

@Injectable()
export class ActivityService {
    constructor(
        private activityHttpService: ActivityHttpService,
        private quoteService: QuoteService) { }

    public searchByProductCodeAndActivityName(productCode: string, activityName: string): Observable<ActivitySearchResponse[]> {
        return this.activityHttpService.searchByProductCodeAndActivityName(productCode, activityName);
    }

    public getActivityByProductIdAndParentId(productId: number, parentId?: number): Observable<any[] | any> {
        return this.activityHttpService.getActivityByProductIdAndParentId(productId, parentId);
    }

    public getActivityByProductCodeAndActivityCode(activityCode: string): Observable<any[] | any> {
        const quote = this.quoteService.getQuoteReference();
        if (quote.product) {
            const productCode = quote.product.productName;
            return this.activityHttpService.getActivityByProductCodeAndActivityCode(productCode, activityCode)
        } else {
            return of(null);
        }
    }
}
