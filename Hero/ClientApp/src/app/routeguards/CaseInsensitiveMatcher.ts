import { Route, UrlMatchResult, UrlSegment, UrlSegmentGroup } from "@angular/router";

declare type PositionalParamMap = {
    [name: string]: UrlSegment;
}

/**
 * The function returns an object of type UrlMatchResult which is used by Angular's router to correctly
 * route a url path - https://v4.angular.io/api/router/UrlMatchResult
 * @param urlSegments
 * @param matchedSegmentsFromUrl
 */
function getPathAndParamsObject(urlSegments: UrlSegment[], matchedSegmentsFromUrl: string[]): UrlMatchResult {
    const urlSegmentArray: UrlSegment[] = [];
    const parameterSegmentMap: { [name: string]: UrlSegment } = {};

    for (let index = 0; index < matchedSegmentsFromUrl.length; ++index) {
        const urlSegmentLowerCasedString = urlSegments[index].toString().toLowerCase();
        const matchedSegment = matchedSegmentsFromUrl[index];

        if (isSegmentAParameter(matchedSegment)) {
            addParameterSegmentToMap(parameterSegmentMap, matchedSegment.slice(1), urlSegments[index]);
            urlSegmentArray.push(urlSegments[index]);
        } else if (urlSegmentLowerCasedString === matchedSegment.toLowerCase()) {
            urlSegmentArray.push(urlSegments[index]);
        } else {
            return null;
        }
    }
    return {
        consumed: urlSegmentArray,
        posParams: parameterSegmentMap
    };
}

function isSegmentAParameter(matchedSegment: string) {
    return matchedSegment.startsWith(":");
}

function addParameterSegmentToMap(parameterSegmentMap: PositionalParamMap, parameterName: string, urlSegment: UrlSegment) {
    parameterSegmentMap[parameterName] = urlSegment;
}

/**
 * Based on the solution:
 * https://stackoverflow.com/questions/36154672/angular2-make-route-paths-case-insensitive/47428947#47428947  
 * @param url
 */
export function caseInsensitiveMatcher(url: string) {
    return function(
        segments: UrlSegment[],
        segmentGroup: UrlSegmentGroup,
        route: Route
    ) {
        const matchedSegmentsFromUrl = url.split("/");
        if (
            matchedSegmentsFromUrl.length > segments.length ||
                (matchedSegmentsFromUrl.length !== segments.length && route.pathMatch === "full")
        ) {
            return null;
        }
        return getPathAndParamsObject(segments, matchedSegmentsFromUrl);
    };
}
