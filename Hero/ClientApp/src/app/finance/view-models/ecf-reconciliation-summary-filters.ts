export interface EcfReconciliationSummaryFilters {
    ucr: string | null;
    currencyId: number | null;
    financialLedgerId: number | null;
    binderId: number | null;
    sectionId: number | null;
    riskCode: string | null;
    unreconciledOnly: boolean | null;
}