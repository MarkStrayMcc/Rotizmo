import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";

import {
    BinderLookup,
    BinderSectionLookup,
    EcfReconciliation,
    UcrLookup
} from "@app/models";
import { BinderLookupService } from "@app/finance/lookups/binder-lookup.service";
import { BinderSectionLookupService } from "@app/finance/lookups/binder-section-lookup.service";
import { EcfReconciliationLookupService } from "@app/finance/lookups/ecf-reconciliation-lookup.service";
import { RiskCodeLookupService } from "@app/finance/lookups/risk-code-lookup.service";
import { UcrLookupService } from "@app/finance/lookups/ucr-lookup.service";
import { ClaimFinancialItemsFilterHandlerService } from "@app/finance/ecf-reconciliation/claim-financial-items/claim-financial-items-filter-handler.service";

describe("ClaimFinancialItemsHandlerService", () => {
    class MockLookupService
    {
        public getData(): Observable<any> {
            return of([]);
        }

        public forceReload(): void { }
    }

    let service: ClaimFinancialItemsFilterHandlerService;
    let binderLookupService: BinderLookupService;
    let binderSectionLookupService: BinderSectionLookupService;
    let ecfReconciliationLookupService: EcfReconciliationLookupService;
    let riskCodeLookupService: RiskCodeLookupService;
    let ucrLookupService: UcrLookupService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ClaimFinancialItemsFilterHandlerService,
                { provide: BinderLookupService, useClass: MockLookupService },
                { provide: BinderSectionLookupService, useClass: MockLookupService },
                { provide: EcfReconciliationLookupService, useClass: MockLookupService },
                { provide: RiskCodeLookupService, useClass: MockLookupService },
                { provide: UcrLookupService, useClass: MockLookupService }
            ]
        });

        service = TestBed.inject(ClaimFinancialItemsFilterHandlerService);
        binderLookupService = TestBed.inject(BinderLookupService);
        binderSectionLookupService = TestBed.inject(BinderSectionLookupService);
        ecfReconciliationLookupService = TestBed.inject(EcfReconciliationLookupService);
        riskCodeLookupService = TestBed.inject(RiskCodeLookupService);
        ucrLookupService = TestBed.inject(UcrLookupService);
    });

    it("gets data from underlying lookup services on loadFilters", () => {
        // arrange
        spyOn(binderLookupService, "getData").and.callThrough();
        spyOn(binderSectionLookupService, "getData").and.callThrough();
        spyOn(ecfReconciliationLookupService, "getData").and.callThrough();
        spyOn(riskCodeLookupService, "getData").and.callThrough();
        spyOn(ucrLookupService, "getData").and.callThrough();

        // act
        service.loadFilters().subscribe(() => { });

        // assert
        expect(binderLookupService.getData).toHaveBeenCalledTimes(1);
        expect(binderSectionLookupService.getData).toHaveBeenCalledTimes(1);
        expect(ecfReconciliationLookupService.getData).toHaveBeenCalledTimes(1);
        expect(riskCodeLookupService.getData).toHaveBeenCalledTimes(1);
        expect(ucrLookupService.getData).toHaveBeenCalledTimes(1);
    });

    it("runs the callbacks after loadFilters completion", () => {
        // arrange
        let resultCallback1 = false;
        let resultCallback2 = false;

        // act
        service.loadFilters().subscribe(() => {
            resultCallback1 = true;
            resultCallback2 = true;
        });

        // assert
        expect(resultCallback1).toBeTruthy();
        expect(resultCallback2).toBeTruthy();
    });

    it("gets data from ecf reconciliation lookup service sending correct parameters on UcrChanged", () => {
        // arrange
        const selectedUcr = new UcrLookup();
        selectedUcr.reference = "10";

        let result = "";
        spyOn(ecfReconciliationLookupService, "getData").and.callFake(function () {
            result = arguments[0].reference;
            return of([]);
        });

        // act
        service.onUcrChanged(selectedUcr);

        // assert
        expect(ecfReconciliationLookupService.getData).toHaveBeenCalledTimes(1);
        expect(result).toEqual(selectedUcr.reference);
    });

    it("updates binderSectionLookups$ on BinderChanged", () => {
        // arrange
        const selectedUcr = new UcrLookup();
        let noCalls = 0;
        service.ecfReconciliationLookups$.subscribe(data => {
            noCalls++;
        });

        // act
        service.onUcrChanged(selectedUcr);

        // assert
        // first call is related to behaviourSubject initial value, second is the update call
        expect(noCalls).toEqual(2);
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
    
    it("returns correct EcfReconciliation on getEcfReconciliationById", () => {
        // arrange
        const id = 3;
        const ucr = "test3";

        service.ecfReconciliationLookups$ = of([
            createEcfReconciliation(1, "test1"),
            createEcfReconciliation(2, "test2"),
            createEcfReconciliation(id, ucr),
            createEcfReconciliation(10, "test10")
        ]);
        
        // act
        let result: EcfReconciliation;
        service.getEcfReconciliationById(id).subscribe(data => {
            result = data;
        });

        // assert
        expect(result.ecfReconciliationId).toEqual(id);
        expect(result.ucr).toEqual(ucr);
    });

    function createEcfReconciliation(id: number, ucr: string): EcfReconciliation {
        const result = new EcfReconciliation();
        result.ecfReconciliationId = id;
        result.ucr = ucr;
        return result;
    }
});
