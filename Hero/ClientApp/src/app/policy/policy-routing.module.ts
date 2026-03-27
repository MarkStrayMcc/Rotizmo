import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { PolicySearchComponent } from "./policy-search.component";

const routes: Routes = [ {path: "", component: PolicySearchComponent }];

@NgModule({
    imports: [CommonModule,
      RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PolicyRoutingModule { }
