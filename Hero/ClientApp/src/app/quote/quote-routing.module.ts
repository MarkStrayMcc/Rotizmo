import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";

import DeactivateGuard from "@app/routeguards/deactivate-guard/deactivate-guard";
import { QuoteComponent } from "@app/quote/quote.component";



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: "quote", component: QuoteComponent, canDeactivate: [DeactivateGuard] },
      { path: "bindQuote", component: QuoteComponent, canDeactivate: [DeactivateGuard] }
    ])
  ],
  exports: [RouterModule]
})
export class QuoteRoutingModule { }
