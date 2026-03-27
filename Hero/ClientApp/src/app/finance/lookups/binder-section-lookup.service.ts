import { Injectable } from "@angular/core";
import { Observable, of} from "rxjs";
import { map } from "rxjs/operators";
import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";
import { BinderHttpService } from "@app/services/binder-http.service";
import { BinderLookup, BinderSectionLookup } from "@app/models";

@Injectable()
export class BinderSectionLookupService extends CachedLookupBaseService<Array<BinderSectionLookup>> {
    constructor(private readonly binderService: BinderHttpService) {
        super();
    }

    public getData(binder?: BinderLookup): Observable<Array<BinderSectionLookup>> {
        if (binder) {
            return this.data$.pipe(map(lookups => {
                return lookups.filter(lookup => lookup.binderId === binder.binderId);
            }));
        }

        // no values returned if binder lookup isn't specified
        return of([]);
    }

    protected requestData(): Observable<Array<BinderSectionLookup>> {
        return this.binderService.getBinderSectionLookups();
    }
}
