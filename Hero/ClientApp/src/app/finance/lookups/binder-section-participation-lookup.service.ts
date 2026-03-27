import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";
import { BinderSectionParticipationHttpService } from "@app/services/binder-section-participation-http.service";
import { BinderSectionParticipation } from "@app/models";

@Injectable()
export class BinderSectionParticipationLookupService extends CachedLookupBaseService<Array<BinderSectionParticipation>> {
    constructor(private readonly binderSectionParticipationService: BinderSectionParticipationHttpService) {
        super();
    }

    public getData(binderDescription?: string, sectionShortCode?: string, binderYear?: string, sectionId?: number): Observable<Array<BinderSectionParticipation>> {
        if (!!sectionId) {
            return this.data$.pipe(map(lookups => {
                return lookups.filter(lookup => lookup.sectionId === sectionId);
            }));
        }

        if (binderDescription && sectionShortCode && binderYear) {
            return this.data$.pipe(map(lookups => {
                return lookups.filter(lookup => lookup.binderDescription === binderDescription
                  && lookup.sectionShortCode === sectionShortCode
                  && lookup.binderYear === binderYear);
            }));
        }

        return this.data$;
    }

    protected requestData(): Observable<Array<BinderSectionParticipation>>  {
        return this.binderSectionParticipationService.getBinderSectionParticipationLookups();
    }
}
