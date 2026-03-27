import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";

import { UcrLookup } from "@app/models";
import { UcrLookupService } from "@app/finance/lookups/ucr-lookup.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";

describe("UcrLookupService", () => {
    class MockEcfReconciliationHttpService {
        public getEcfUcrLookups(): Observable<string[]> {
            return of([
                "ucr1",
                "ucr2",
                "ucr3"
            ]);
        }
    }

    let service: UcrLookupService;
    let ecfReconciliationHttpService: EcfReconciliationHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UcrLookupService,
                { provide: EcfReconciliationHttpService, useClass: MockEcfReconciliationHttpService }
            ]
        });
        
        service = TestBed.inject(UcrLookupService);
        ecfReconciliationHttpService = TestBed.inject(EcfReconciliationHttpService);
    });

    it("getData calls EcfReconciliationHttpService", () => {
        // arrange
        spyOn(ecfReconciliationHttpService, "getEcfUcrLookups").and.callThrough();

        // act
        service.getData().subscribe();

        // assert
        expect(ecfReconciliationHttpService.getEcfUcrLookups).toHaveBeenCalledTimes(1);
    });

    it("getData returns not filtered data if called without parameter", () => {
        // arrange
        let result: Array<UcrLookup> = [];

        // act
        service.getData().subscribe(data => result = data);

        // assert
        expect(result.length).toEqual(3);
        expect(result[1].reference).toEqual("ucr2");
    });
});
