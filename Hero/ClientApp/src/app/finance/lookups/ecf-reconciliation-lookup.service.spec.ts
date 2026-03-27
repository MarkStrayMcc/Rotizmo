import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";

import { EcfReconciliation, UcrLookup } from "@app/models";
import { EcfReconciliationLookupService } from "@app/finance/lookups/ecf-reconciliation-lookup.service";
import { EcfReconciliationHttpService } from "@app/services/ecf-reconciliation-http.service";

describe("EcfReconciliationLookupService", () => {
    class MockEcfReconciliationHttpService {
        public getEcfReconciliationsFromUcr(ucr: string): Observable<EcfReconciliation[]> {
            return of([
                new EcfReconciliation(),
                new EcfReconciliation()
            ]);
        }
    }

    let service: EcfReconciliationLookupService;
    let ecfReconciliationHttpService: EcfReconciliationHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                EcfReconciliationLookupService,
                { provide: EcfReconciliationHttpService, useClass: MockEcfReconciliationHttpService }
            ]
        });
        
        service = TestBed.inject(EcfReconciliationLookupService);
        ecfReconciliationHttpService = TestBed.inject(EcfReconciliationHttpService);
    });

    it("getData calls EcfReconciliationHttpService if called with parameter", () => {
        // arrange
        const ucr = new UcrLookup();
        ucr.reference = "ucr_no001";

        spyOn(ecfReconciliationHttpService, "getEcfReconciliationsFromUcr").and.callThrough();

        // act
        service.getData(ucr).subscribe();

        // assert
        expect(ecfReconciliationHttpService.getEcfReconciliationsFromUcr).toHaveBeenCalledTimes(1);
    });

    it("getData does not call EcfReconciliationHttpService if called without parameter", () => {
        // arrange
        spyOn(ecfReconciliationHttpService, "getEcfReconciliationsFromUcr").and.callThrough();

        // act
        service.getData().subscribe();

        // assert
        expect(ecfReconciliationHttpService.getEcfReconciliationsFromUcr).toHaveBeenCalledTimes(0);
    });

    it("getData returns empty array if called without parameter", () => {
        // arrange
        let result: Array<EcfReconciliation> = null;

        // act
        service.getData().subscribe(data => result = data);

        // assert
        expect(result).toBeDefined();
        expect(result.length).toEqual(0);
    });
});
