import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from "rxjs";
import { map, mergeMap, first} from "rxjs/operators";
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

@Injectable()
export class ClaimFinancialItemsFilterHandlerService {
    public binderLookups$: Observable<Array<BinderLookup>>;
    public binderSectionLookups$: Observable<Array<BinderSectionLookup>>;
    public ecfReconciliationLookups$: Observable<Array<EcfReconciliation>>;
    public riskCodeLookups$: Observable<Array<string>>;
    public ucrLookups$: Observable<Array<UcrLookup>>;
    
    private readonly binderLookupsSubject = new BehaviorSubject<Array<BinderLookup>>([]);
    private readonly binderSectionLookupsSubject = new BehaviorSubject<Array<BinderSectionLookup>>([]);
    private readonly ecfReconciliationLookupsSubject = new BehaviorSubject<Array<EcfReconciliation>>([]);
    private readonly riskCodeLookupsSubject = new BehaviorSubject<Array<string>>([]);
    private readonly ucrLookupsSubject = new BehaviorSubject<Array<UcrLookup>>([]);

    constructor(
        private readonly binderLookupService: BinderLookupService,
        private readonly binderSectionLookupService: BinderSectionLookupService,
        private readonly ecfReconciliationLookupService: EcfReconciliationLookupService,
        private readonly riskCodeLookupService: RiskCodeLookupService,
        private readonly ucrLookupService: UcrLookupService
    ) {
        this.binderLookups$ = this.binderLookupsSubject.asObservable();
        this.binderSectionLookups$ = this.binderSectionLookupsSubject.asObservable();
        this.ecfReconciliationLookups$ = this.ecfReconciliationLookupsSubject.asObservable();
        this.riskCodeLookups$ = this.riskCodeLookupsSubject.asObservable();
        this.ucrLookups$ = this.ucrLookupsSubject.asObservable();
    }

    public loadFilters() {
        this.invalidateCache();

        return forkJoin(
            this.binderLookupService.getData(),
            this.binderSectionLookupService.getData(),
            this.ecfReconciliationLookupService.getData(),
            this.riskCodeLookupService.getData(),
            this.ucrLookupService.getData()
        ).pipe(map(results => {
            this.binderLookupsSubject.next(results[0]);
            this.binderSectionLookupsSubject.next(results[1]);
            this.ecfReconciliationLookupsSubject.next(results[2]);
            this.riskCodeLookupsSubject.next(results[3]);
            this.ucrLookupsSubject.next(results[4]);
        }));
    }

    public onUcrChanged(selectedUcr: UcrLookup): void {
        this.ecfReconciliationLookupService.getData(selectedUcr)
            .subscribe(data => this.ecfReconciliationLookupsSubject.next(data));
    }

    public onBinderChanged(selectedBinder: BinderLookup): void {
        this.binderSectionLookupService.getData(selectedBinder)
            .subscribe(data => this.binderSectionLookupsSubject.next(data));
    }

    public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void {
        this.riskCodeLookupService.getData(selectedBinderSection)
            .subscribe(data => this.riskCodeLookupsSubject.next(data));
    }

    public getEcfReconciliationById(id: number): Observable<EcfReconciliation> {
        return this.ecfReconciliationLookups$.pipe(mergeMap(lookups => {
                return lookups.filter(lookup => lookup.ecfReconciliationId === id);
        }), first());
    }

    private invalidateCache(): void {
        this.binderLookupService.forceReload();
        this.binderSectionLookupService.forceReload();
        this.riskCodeLookupService.forceReload();
        this.ucrLookupService.forceReload();
    }
}
