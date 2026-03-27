import { NgModule, InjectionToken } from "@angular/core";
import { Routes, RouterModule, ActivatedRouteSnapshot } from "@angular/router";
import { UnauthorisedComponent } from "./unauthorised/unauthorised.component";
import { LoadingSpinnerComponent } from "@app/components/loading-spinner/loading-spinner";

const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');
const routes: Routes = [
  { path: "unauthorised", component: UnauthorisedComponent, pathMatch: "full" },
  { path: "quote", loadChildren: () => import("./quote/quote.module").then(m => m.QuoteModule) },
  { path: "finance", loadChildren: () => import("./finance/finance.module").then(m => m.FinanceModule) },
  { path: "policy", loadChildren: () => import("./policy/policy.module").then(m => m.PolicyModule) },
  { path: "bulk-quoting", loadChildren: () => import("./bulk-quoting/bulk-quoting.module").then(m => m.BulkQuotingModule) },
  { path: "send-eu-documents", loadChildren: () => import("./compliance/compliance.module").then(m => m.ComplianceModule) },
  { path: "nerdMidTermAdjustments", resolve: { url: externalUrlProvider }, component: LoadingSpinnerComponent },
  { path: "", redirectTo: "/quote", pathMatch: "full" },
  { path: "**", redirectTo: "/quote", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [
        {
            provide: externalUrlProvider,
            useValue: (route: ActivatedRouteSnapshot) => {
                const externalUrl = route.paramMap.get('externalUrl');
                window.open(externalUrl, '_self');
            },
        }
    ]
})
export class AppRoutingModule { }
