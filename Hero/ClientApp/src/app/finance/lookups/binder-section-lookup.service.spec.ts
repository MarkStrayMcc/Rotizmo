import { TestBed } from "@angular/core/testing";
import { Observable , of} from "rxjs";

import { BinderLookup, BinderSectionLookup } from "@app/models";
import { BinderSectionLookupService } from "@app/finance/lookups/binder-section-lookup.service";
import { BinderHttpService } from "@app/services/binder-http.service";

describe("BinderSectionLookupService", () => {
    class MockBinderHttpService {
        public getBinderLookups(): Observable<BinderLookup[]> {
            return of([]);
        }

        public getBinderSectionLookups(): Observable<BinderSectionLookup[]> {
            return of([
                createBinderSectionLookup(1, 12, "test1"),
                createBinderSectionLookup(2, 12, "test2"),
                createBinderSectionLookup(3, 13, "test3")
            ]);
        }
    }

    let service: BinderSectionLookupService;
    let binderHttpService: BinderHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BinderSectionLookupService,
                { provide: BinderHttpService, useClass: MockBinderHttpService }
            ]
        });
        
        service = TestBed.inject(BinderSectionLookupService);
        binderHttpService = TestBed.inject(BinderHttpService);
    });

    it("getData calls binderService if called with parameter", () => {
        // arrange
        const binder = new BinderLookup();
        binder.binderId = 12;
        spyOn(binderHttpService, "getBinderSectionLookups").and.callThrough();

        // act
        service.getData(binder).subscribe();

        // assert
        expect(binderHttpService.getBinderSectionLookups).toHaveBeenCalledTimes(1);
    });

    it("getData returns empty array if called without parameter", () => {
        // arrange
        let result: Array<BinderSectionLookup> = [];

        // act
        service.getData().subscribe(data => result = data);

        // assert
        expect(result.length).toEqual(0);
    });

    it("getData returns filtered data if called with binder as parameter", () => {
        // arrange
        let result: Array<BinderSectionLookup> = [];
        const binder = new BinderLookup();
        binder.binderId = 12;

        // act
        service.getData(binder).subscribe(data => result = data);

        // assert
        expect(result.length).toEqual(2);
        expect(result[1].sectionDescription).toEqual("test2");
    });

    function createBinderSectionLookup(id: number, binderId: number, description: string) {
        const result = new BinderSectionLookup();
        result.sectionId = id;
        result.binderId = binderId;
        result.sectionDescription = description;
        return result;
    }
});
