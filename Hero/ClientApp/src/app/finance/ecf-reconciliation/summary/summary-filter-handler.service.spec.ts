import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";

import {
    BinderLookup,
    BinderSectionLookup,
    FinancialLedgerLookup
} from "@app/models";
import { BinderLookupService } from "@app/finance/lookups/binder-lookup.service";
import { BinderSectionLookupService } from "@app/finance/lookups/binder-section-lookup.service";
import { CurrencyLookupService } from "@app/finance/lookups/currency-lookup.service";
import { FinancialLedgerLookupService } from "@app/finance/lookups/financial-ledger-lookup.service";
import { RiskCodeLookupService } from "@app/finance/lookups/risk-code-lookup.service";
import { UcrLookupService } from "@app/finance/lookups/ucr-lookup.service";
import { SummaryFilterHandlerService } from "@app/finance/ecf-reconciliation/summary/summary-filter-handler.service";

describe("SummaryFilterHandlerService", () => {
    class MockLookupService
    {
        public getData(): Observable<any> {
            return of([]);
        }

        public forceReload(): void { }
    }

    let service: SummaryFilterHandlerService;
    let binderLookupService: BinderLookupService;
    let binderSectionLookupService: BinderSectionLookupService;
    let currencyLookupService: CurrencyLookupService;
    let financialLedgerLookupService: FinancialLedgerLookupService;
    let riskCodeLookupService: RiskCodeLookupService;
    let ucrLookupService: UcrLookupService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SummaryFilterHandlerService,
                { provide: BinderLookupService, useClass: MockLookupService },
                { provide: BinderSectionLookupService, useClass: MockLookupService },
                { provide: CurrencyLookupService, useClass: MockLookupService },
                { provide: FinancialLedgerLookupService, useClass: MockLookupService },
                { provide: RiskCodeLookupService, useClass: MockLookupService },
                { provide: UcrLookupService, useClass: MockLookupService }
            ]
        });

        service = TestBed.inject(SummaryFilterHandlerService);
        binderLookupService = TestBed.inject(BinderLookupService);
        binderSectionLookupService = TestBed.inject(BinderSectionLookupService);
        currencyLookupService = TestBed.inject(CurrencyLookupService);
        financialLedgerLookupService = TestBed.inject(FinancialLedgerLookupService);
        riskCodeLookupService = TestBed.inject(RiskCodeLookupService);
        ucrLookupService = TestBed.inject(UcrLookupService);
    });

    it("gets data from underlying lookup services on loadFilters", () => {
        // arrange
        spyOn(binderLookupService, "getData").and.callThrough();
        spyOn(binderSectionLookupService, "getData").and.callThrough();
        spyOn(currencyLookupService, "getData").and.callThrough();
        spyOn(financialLedgerLookupService, "getData").and.callThrough();
        spyOn(riskCodeLookupService, "getData").and.callThrough();
        spyOn(ucrLookupService, "getData").and.callThrough();

        // act
        service.loadFilters();

        // assert
        expect(binderLookupService.getData).toHaveBeenCalledTimes(1);
        expect(binderSectionLookupService.getData).toHaveBeenCalledTimes(1);
        expect(currencyLookupService.getData).toHaveBeenCalledTimes(1);
        expect(financialLedgerLookupService.getData).toHaveBeenCalledTimes(1);
        expect(riskCodeLookupService.getData).toHaveBeenCalledTimes(1);
        expect(ucrLookupService.getData).toHaveBeenCalledTimes(1);
    });

    it("gets data from binder section lookup service sending correct parameters on BinderChanged", () => {
        // arrange
        const selectedBinder = new BinderLookup();
        selectedBinder.binderId = 10;

        let result = 0;
        spyOn(binderSectionLookupService, "getData").and.callFake(function () {
            result = arguments[0].binderId;
            return of([]);
        });

        // act
        service.onBinderChanged(selectedBinder);

        // assert
        expect(binderSectionLookupService.getData).toHaveBeenCalledTimes(1);
        expect(result).toEqual(selectedBinder.binderId);
    });

    it("updates binderSectionLookups$ on BinderChanged", () => {
        // arrange
        const selectedBinder = new BinderLookup();
        let noCalls = 0;
        service.binderSectionLookups$.subscribe(data => {
            noCalls++;
        });

        // act
        service.onBinderChanged(selectedBinder);

        // assert
        // first call is related to behaviourSubject initial value, second is the update call
        expect(noCalls).toEqual(2);
    });

    it("updates riskCodeLookups$ on BinderSectionChanged", () => {
        // arrange
        const selectedSectionBinder = new BinderSectionLookup();
        let noCalls = 0;
        service.riskCodeLookups$.subscribe(data => {
            noCalls++;
        });

        // act
        service.onBinderSectionChanged(selectedSectionBinder);

        // assert
        // first call is related to behaviourSubject initial value, second is the update call
        expect(noCalls).toEqual(2);
    });

    it("gets data from risk code lookup service sending correct parameters on BinderSectionChanged", () => {
        // arrange
        const selectedSectionBinder = new BinderSectionLookup();
        selectedSectionBinder.sectionId = 10;

        let result = 0;
        spyOn(riskCodeLookupService, "getData").and.callFake(function () {
            result = arguments[0].sectionId;
            return of([]);
        });

        // act
        service.onBinderSectionChanged(selectedSectionBinder);

        // assert
        expect(riskCodeLookupService.getData).toHaveBeenCalledTimes(1);
        expect(result).toEqual(selectedSectionBinder.sectionId);
    });

    it("gets data from binder lookup service sending correct parameters on LedgerChanged", () => {
        // arrange
        const selectedLedger = new FinancialLedgerLookup();
        selectedLedger.ledgerReference = "123";

        let result = "";
        spyOn(binderLookupService, "getData").and.callFake(function () {
            result = arguments[0].ledgerReference;
            return of([]);
        });

        // act
        service.onLedgerChanged(selectedLedger);

        // assert
        expect(binderLookupService.getData).toHaveBeenCalledTimes(1);
        expect(result).toEqual(selectedLedger.ledgerReference);
    });

    it("updates binderLookups$ on LedgerChanged", () => {
        // arrange
        const selectedLedger = new FinancialLedgerLookup();
        let noCalls = 0;
        service.binderLookups$.subscribe(data => {
            noCalls++;
        });

        // act
        service.onLedgerChanged(selectedLedger);

        // assert
        // first call is related to behaviourSubject initial value, second is the update call
        expect(noCalls).toEqual(2);
    });
});
