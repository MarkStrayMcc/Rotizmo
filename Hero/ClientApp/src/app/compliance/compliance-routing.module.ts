import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SendEuDocumentsComponent } from "@app/compliance/send-eu-documents/send-eu-documents.component";
import { FeatureAccessGuard } from '@app/routeguards/can-activate-guard/feature-access.guard';

const routes: Routes = [
    {
        path: "",
        component: SendEuDocumentsComponent,
        canActivate: [FeatureAccessGuard],
        data: {
            featureName: "sendEUDocumentsPage"
        }
    }
];

@NgModule({
    imports: [CommonModule,
        RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ComplianceRoutingModule { }
