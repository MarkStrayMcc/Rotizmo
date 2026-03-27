import { Injectable } from '@angular/core';

import {
    BinderLookup,
    BinderSectionLookup,
    Currency,
    FinancialLedgerLookup,
    UcrLookup
} from "@app/models";

@Injectable()
export class FilterContextService {
    public ucr?: UcrLookup;
    public ecfReconciliationId?: number;
    public currency?: Currency;
    public unreconciledOnly: boolean = true;
    public financialLedger?: FinancialLedgerLookup;
    public binder?: BinderLookup;
    public binderSection?: BinderSectionLookup;
    public riskCode?: string;
    public tags: string[] = [];

    constructor() {
    }
}
