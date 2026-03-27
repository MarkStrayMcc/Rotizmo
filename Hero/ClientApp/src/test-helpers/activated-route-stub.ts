import { convertToParamMap, ParamMap, Params } from "@angular/router";
import { BehaviorSubject } from "rxjs";

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setQueryParamMap()` method to add the next `paramMap` value.
 * https://remypenchenat.blogspot.com/2018/02/angular-testing-activatedroute.html
 * There is more on angular.io - https://angular.io/guide/testing#activatedroutestub
 */
export class ActivatedRouteStub {

    // Observable that contains a map of the parameters
    private subjectParamMap = new BehaviorSubject(convertToParamMap(this.testParamMap));
    paramMap = this.subjectParamMap.asObservable();

    private _testParamMap: ParamMap;
    get testParamMap() {
        return this._testParamMap;
    }
    set testParamMap(params: {}) {
        this._testParamMap = convertToParamMap(params);
        this.subjectParamMap.next(this._testParamMap);
    }

    //  Observable that contains a map of the query parameters
    private subjectQueryParamMap = new BehaviorSubject(convertToParamMap(this.testParamMap));
    queryParamMap = this.subjectQueryParamMap.asObservable();

    private _testQueryParamMap: ParamMap;
    get testQueryParamMap() {
        return this._testQueryParamMap;
    }
    set testQueryParamMap(params: {}) {
        this._testQueryParamMap = convertToParamMap(params);
        this.subjectQueryParamMap.next(this._testQueryParamMap);
    }

    get snapshot() {
        return {
            paramMap: this.testParamMap,
            queryParamMap: this.testQueryParamMap
        } ;
    }

}

export * from "./activated-route-stub";
