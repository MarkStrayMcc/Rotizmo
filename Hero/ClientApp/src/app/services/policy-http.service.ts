import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Policy } from "@app/models/auto-generated/Policy";

@Injectable()
export class PolicyHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    getPolicySearchResults(searchParams: string): Observable<Policy[]> {
      const filters = "allpolicies";
      const url = `/portfolio/getportfolioitems?SearchTerm=${searchParams}&Filters=${filters}`;

      return this.http.get(url).pipe(
        map((data: any[]) => data.map((item: any) => {
          let searchResult = item.policy;
          return searchResult;
        }))
      );
    }
}


