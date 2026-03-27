import { ActivityMap } from "@app/models";
import { ActivitySearchResponse } from "@app/quote/components/activities/activity-search/ActivitySearchResponse";
import { Observable, of } from "rxjs";
import { getTestQuote } from "test-helpers";

export const mockActivityService = {
    searchByProductCodeAndActivityName: fakeSearchActivityResponse,
    getActivityByProductCodeAndActivityCode: fakeGetActivityByProductCodeAndActivityCodeResponse,
    getActivityByProductIdAndParentId: () => jasmine.createSpy("getActivityByProductIdAndParentId")
}

export const mockQuoteService = {
    getQuoteReference: () => {
        return getTestQuote();
    }
}

export function fakeSearchActivityResponse(): Observable<ActivitySearchResponse[]> {
    return of(
        [
            {
                activityCode: "ED",
                searchableTerm: "Education",
                activityName: "Education",
                activityPath: ""
            },
            {
                activityCode: "ED03",
                searchableTerm: "Education > Colleges & Universities",
                activityName: "Colleges & Universities",
                activityPath: "Education"
            },
            {
                activityCode: "ED0301",
                searchableTerm: "Education > Colleges & Universities > Further Education College",
                activityName: "Further Education College",
                activityPath: "Education > Colleges & Universities"
            },
            {
                activityCode: "ED03010",
                searchableTerm: "Education > Colleges & Universities > Further Education College > The Last College",
                activityName: "The Last College",
                activityPath: "Education > ... > Further Education College"
            }
        ]
    );
}

export function fakeGetActivityByProductCodeAndActivityCodeResponse() {
    return of(
        [<ActivityMap>{
            activityMapId: 127,
            activityMasterId: 114,
            code: "ED",
            description: "Education",
            numberOfAvailableActivities: 15,
            parentActivityMapId: null,
            productId: 0
        },
        <ActivityMap>{
            activityMapId: 136,
            activityMasterId: 123,
            code: "ED03",
            description: "Colleges & Universities",
            numberOfAvailableActivities: 5,
            parentActivityMapId: 127,
            productId: 0
        },
        <ActivityMap>{
            activityMapId: 137,
            activityMasterId: 124,
            code: "ED0301",
            description: "Further Education College",
            numberOfAvailableActivities: 3,
            parentActivityMapId: 136,
            productId: 0
        }]
    );
}
