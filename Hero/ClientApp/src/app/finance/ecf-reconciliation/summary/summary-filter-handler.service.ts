import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin} from "rxjs";
import { map } from "rxjs/operators";
import {
    BinderLookup,
    BinderSectionLookup,
    Currency,
    FinancialLedgerLookup,
    UcrLookup
} from "@app/models";
import { BinderLookupService } from "@app/finance/lookups/binder-lookup.service";
import { BinderSectionLookupService } from "@app/finance/lookups/binder-section-lookup.service";
import { CurrencyLookupService } from "@app/finance/lookups/currency-lookup.service";
import { FinancialLedgerLookupService } from "@app/finance/lookups/financial-ledger-lookup.service";
import { RiskCodeLookupService } from "@app/finance/lookups/risk-code-lookup.service";
import { UcrLookupService } from "@app/finance/lookups/ucr-lookup.service";

@Injectable()
export class SummaryFilterHandlerService {
    public binderLookups$: Observable<Array<BinderLookup>>;
    public binderSectionLookups$: Observable<Array<BinderSectionLookup>>;
    public currencyLookups$: Observable<Array<Currency>>;
    public financialLedgerLookups$: Observable<Array<FinancialLedgerLookup>>;
    public riskCodeLookups$: Observable<Array<string>>;
    public ucrLookups$: Observable<Array<UcrLookup>>;
    
    private readonly binderLookupsSubject = new BehaviorSubject<Array<BinderLookup>>([]);
    private readonly binderSectionLookupsSubject = new BehaviorSubject<Array<BinderSectionLookup>>([]);
    private readonly currencyLookupsSubject = new BehaviorSubject<Array<Currency>>([]);
    private readonly financialLedgerLookupsSubject = new BehaviorSubject<Array<FinancialLedgerLookup>>([]);
    private readonly riskCodeLookupsSubject = new BehaviorSubject<Array<string>>([]);
    private readonly ucrLookupsSubject = new BehaviorSubject<Array<UcrLookup>>([]);

    constructor(
        private readonly binderLookupService: BinderLookupService,
        private readonly binderSectionLookupService: BinderSectionLookupService,
        private readonly currencyLookupService: CurrencyLookupService,
        private readonly financialLedgerLookupService: FinancialLedgerLookupService,
        private readonly riskCodeLookupService: RiskCodeLookupService,
        private readonly ucrLookupService: UcrLookupService
    ) {
        this.binderLookups$ = this.binderLookupsSubject.asObservable();
        this.binderSectionLookups$ = this.binderSectionLookupsSubject.asObservable();
        this.currencyLookups$ = this.currencyLookupsSubject.asObservable();
        this.financialLedgerLookups$ = this.financialLedgerLookupsSubject.asObservable();
        this.riskCodeLookups$ = this.riskCodeLookupsSubject.asObservable();
        this.ucrLookups$ = this.ucrLookupsSubject.asObservable();
    }

    public loadFilters() {
        this.invalidateCache();

        return forkJoin(
            this.binderLookupService.getData(),
            this.binderSectionLookupService.getData(),
            this.currencyLookupService.getData(),
            this.financialLedgerLookupService.getData(),
            this.riskCodeLookupService.getData(),
            this.ucrLookupService.getData()
        ).pipe(map(results => {
            this.binderLookupsSubject.next(results[0]);
            this.binderSectionLookupsSubject.next(results[1]);
            this.currencyLookupsSubject.next(results[2]);
            this.financialLedgerLookupsSubject.next(results[3]);
            this.riskCodeLookupsSubject.next(results[4]);
            this.ucrLookupsSubject.next(results[5]);
        }));
    }

    public onLedgerChanged(selectedLedger: FinancialLedgerLookup): void {
        this.binderLookupService.getData(selectedLedger).subscribe(data => this.binderLookupsSubject.next(data));
    }

    public onBinderChanged(selectedBinder: BinderLookup): void {
        this.binderSectionLookupService.getData(selectedBinder).subscribe(data => this.binderSectionLookupsSubject.next(data));
    }

    public onBinderSectionChanged(selectedBinderSection: BinderSectionLookup): void {
        this.riskCodeLookupService.getData(selectedBinderSection).subscribe(data => this.riskCodeLookupsSubject.next(data));
    }

    private invalidateCache(): void {
        this.binderLookupService.forceReload();
        this.binderSectionLookupService.forceReload();
        this.currencyLookupService.forceReload();
        this.financialLedgerLookupService.forceReload();
        this.riskCodeLookupService.forceReload();
        this.ucrLookupService.forceReload();
    }
}
