import { Observable, of } from "rxjs";

import { CachedLookupBaseService } from "@app/finance/lookups/cached-lookup-base.service";

describe("CachedLookupBaseService", () => {
    class TestCachedLookupBaseService extends CachedLookupBaseService<any> {
        public testReturnValue = of("test_data");

        public getData(): Observable<any> {
            return this.data$;
        }

        protected requestData(): Observable<any> {
            return this.testReturnValue;
        }
    }

    let testObj: TestCachedLookupBaseService;

    beforeEach(() => {
        testObj = new TestCachedLookupBaseService();
    });

    it("getData returns requestData value", () => {
        // arrange
        let result = "";

        // act
        testObj.getData().subscribe(data => result = data);

        // assert
        expect(result).toEqual("test_data");
    });

    it("getData uses cache after the first call", () => {
        // arrange
        let result = "";

        // act
        testObj.getData().subscribe(data => result = data);
        testObj.testReturnValue = of("test");
        testObj.getData().subscribe(data => result = data);

        // assert
        expect(result).toEqual("test_data");
    });

    it("forceReload invalidates the cache", () => {
        // arrange
        let result = "";

        // act
        testObj.getData().subscribe(data => result = data);
        testObj.testReturnValue = of("test");
        testObj.forceReload();
        testObj.getData().subscribe(data => result = data);

        // assert
        expect(result).toEqual("test");
    });
});