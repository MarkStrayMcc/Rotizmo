import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { caseInsensitiveMatcher } from "@app/routeguards/CaseInsensitiveMatcher";
import { LedgerComponent } from "./ledger/ledger.component";
import { FeatureAccessGuard } from "@app/routeguards/can-activate-guard/feature-access.guard";
import { LossFundSummaryComponent } from "./loss-fund-summary/loss-fund-summary.component";
import { PaymentRequestsComponent } from "./payment-requests/payment-requests.component";
import { EcfReconciliationPageComponent } from "./ecf-reconciliation-page/ecf-reconciliation-page.component";
import { EcfReconciliationSummaryComponent } from "./ecf-reconciliation-summary/ecf-reconciliation-summary.component";
import { EcfReconciliationFinancialTransComponent } from "./ecf-reconciliation-financial-trans/ecf-reconciliation-financial-trans.component";
import { EcfReconciliationClaimFinancialItemsComponent } from "./ecf-reconciliation-claim-financial-items/ecf-reconciliation-claim-financial-items.component";
import { OutstandingFundsComponent } from "@finance/outstanding-funds/outstanding-funds.component";


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                matcher: caseInsensitiveMatcher("finance/ledger"),
                component: LedgerComponent,
                canActivate: [FeatureAccessGuard],
                data: { featureName: "financePageAccess" }
            },
            {
                matcher: caseInsensitiveMatcher("finance/loss-fund-summary"),
                component: LossFundSummaryComponent,
                canActivate: [FeatureAccessGuard],
                data: { featureName: "lossFundSummaryPageAccess" }
            },
            {
                matcher: caseInsensitiveMatcher("finance/payment-requests"),
                component: PaymentRequestsComponent,
                canActivate: [FeatureAccessGuard],
                data: { featureName: "financePageAccess" }
            },
            {
                matcher: caseInsensitiveMatcher("finance/ecf-reconciliation"),
                component: EcfReconciliationPageComponent,
                canActivate: [FeatureAccessGuard],
                data: { featureName: "ecfReconciliationSummaryPageAccess" },
                children: [
                    {
                        path: "",
                        component: EcfReconciliationSummaryComponent
                    },
                    {
                        matcher: caseInsensitiveMatcher("financial-transactions"),
                        component: EcfReconciliationFinancialTransComponent,
                    },
                    {
                        matcher: caseInsensitiveMatcher("claim-financial-items"),
                        component: EcfReconciliationClaimFinancialItemsComponent,
                    }
                ]
            },
            {
                matcher: caseInsensitiveMatcher("finance/outstanding-funds"),
                component: OutstandingFundsComponent,
                canActivate: [FeatureAccessGuard],
                data: { featureName: "outstandingFundsPageAccess"}
            },
            { path: "finance", pathMatch: "full", redirectTo: "finance/ledger"   }
        ]),
    ],
    exports: [RouterModule]
})
export class FinanceRoutingModule { }
