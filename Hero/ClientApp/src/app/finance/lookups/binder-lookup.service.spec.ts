import { TestBed, fakeAsync } from "@angular/core/testing";
import { Observable, of } from "rxjs";

import {
    BinderLookup,
    BinderSectionLookup,
    FinancialLedgerLookup
} from "@app/models";
import { BinderLookupService } from "@app/finance/lookups/binder-lookup.service";
import { BinderHttpService } from "@app/services/binder-http.service";

describe("BinderLookupService", () => {
    class MockBinderHttpService {
        public getBinderLookups(): Observable<BinderLookup[]> {
            return of([
                createBinderLookup(1, "test1"),
                createBinderLookup(2, "test2"),
                createBinderLookup(3, "test3")
            ]);
        }

        public getBinderSectionLookups(): Observable<BinderSectionLookup[]> {
            return of([]);
        }
    }

    let service: BinderLookupService;
    let binderHttpService: BinderHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BinderLookupService,
                { provide: BinderHttpService, useClass: MockBinderHttpService }
            ]
        });

        service = TestBed.inject(BinderLookupService);
        binderHttpService = TestBed.inject(BinderHttpService);
    });

    it("getData calls binderService", () => {
        // arrange
        spyOn(binderHttpService, "getBinderLookups").and.callThrough();

        // act
        service.getData().subscribe();

        // assert
        expect(binderHttpService.getBinderLookups).toHaveBeenCalledTimes(1);
    });

    it("getData returns not filtered data if called without parameter", fakeAsync(() => {
        // arrange
        let result: Array<BinderLookup> = [];

        // act
        service.getData().subscribe(data => result = data);

        // assert
        expect(result.length).toEqual(3);
    }));

    it("getData returns filtered data if called with ledger as parameter", fakeAsync(() => {
        // arrange
        let result: Array<BinderLookup> = [];
        const ledger = new FinancialLedgerLookup();
        ledger.binderId = 2;

        // act
        service.getData(ledger).subscribe(data => result = data);

        // assert
        expect(result.length).toEqual(1);
        expect(result[0].binderDescription).toEqual("test2");
    }));

    function createBinderLookup(id: number, description: string) {
        const result = new BinderLookup();
        result.binderId = id;
        result.binderDescription = description;
        return result;
    }
});
