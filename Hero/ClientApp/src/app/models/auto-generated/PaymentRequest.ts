
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class PaymentRequest { 
    public accountingReferenceDateFormattedString: string; 
    public claimFinancialItemId: number;
    public amount: number;
    public accountingReferenceDate: Date;
    public currency: Models.Currency;
    public classification: Models.ItemClassification;
    public itemStatusId: number;
    public itemStatusName: string;
    public financialType: string;
    public paymentType: string;
    public payeeName: string;
    public sanctionsMatch: boolean;
    public claimId: number;
    public claimReference: string;
    public policyId: number;
    public cfcTeamId: string;
    public client: Models.Client;
    public ledgerReference: string;
    public ecfReconciliationId: number;
    public lloydsRiskCode: string;
    public binderSection: Models.BinderSection; 
}
