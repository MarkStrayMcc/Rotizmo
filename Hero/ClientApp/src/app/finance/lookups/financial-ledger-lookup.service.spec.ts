import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";

import { FinancialLedgerLookup } from "@app/models";
import { FinancialLedgerLookupService } from "@app/finance/lookups/financial-ledger-lookup.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";

describe("FinancialLedgerLookupService", () => {
    class MockLedgerReferenceHttpService {
        public getLedgerLookups(): Observable<FinancialLedgerLookup[]> {
            return of([
                createFinancialLedgerLookup(1, "ref1"),
                createFinancialLedgerLookup(2, "ref2"),
                createFinancialLedgerLookup(3, "ref3")
            ]);
        }
    }

    let service: FinancialLedgerLookupService;
    let ledgerReferenceHttpService: LedgerReferenceHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FinancialLedgerLookupService,
                { provide: LedgerReferenceHttpService, useClass: MockLedgerReferenceHttpService }
            ]
        });
        
        service = TestBed.inject(FinancialLedgerLookupService);
        ledgerReferenceHttpService = TestBed.inject(LedgerReferenceHttpService);
    });

    it("getData calls LedgerReferenceHttpService", () => {
        // arrange
        spyOn(ledgerReferenceHttpService, "getLedgerLookups").and.callThrough();

        // act
        service.getData().subscribe();

        // assert
        expect(ledgerReferenceHttpService.getLedgerLookups).toHaveBeenCalledTimes(1);
    });

    it("getData returns not filtered data if called without parameter", () => {
        // arrange
        let result: Array<FinancialLedgerLookup> = [];

        // act
        service.getData().subscribe(data => result = data);

        // assert
        expect(result.length).toEqual(3);
        expect(result[1].ledgerReference).toEqual("ref2");
    });

    function createFinancialLedgerLookup(id: number, ledgerReference: string) {
        const result = new FinancialLedgerLookup();
        result.financialLedgerId = id;
        result.ledgerReference = ledgerReference;
        return result;
    }
});
