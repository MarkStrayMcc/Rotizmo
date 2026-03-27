import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { caseInsensitiveMatcher } from '@app/routeguards/CaseInsensitiveMatcher';
import { FeatureAccessGuard } from '@app/routeguards/can-activate-guard/feature-access.guard';
import { BulkQuotingComponent } from './bulk-quoting.component';
import { RunDetailsComponent } from './components/run-details/run-details.component';


const routes: Routes = [
  {
    matcher: caseInsensitiveMatcher("bulk-quoting"),
    component: BulkQuotingComponent,
    canActivate: [FeatureAccessGuard],
    data: { featureName: "bulkQuotingPage" }
  },
  {
    matcher: caseInsensitiveMatcher("bulk-quoting/run/:id"),
    component: RunDetailsComponent,
    canActivate: [FeatureAccessGuard],
    data: { featureName: "bulkQuotingPage" }
  }
];

@NgModule({
  imports: 
  [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class BulkQuotingRoutingModule { }
