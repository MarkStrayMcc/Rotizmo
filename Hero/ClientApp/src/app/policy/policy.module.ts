import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatTooltipModule } from "@angular/material";
import { NoResultsComponent } from "@app/components/no-results/no-results.component";
import { SearchTextBoxComponent } from "@app/components/search-textbox/search-textbox.component";
import { MtaTypeMenuComponent } from "@app/policy/mta/mta-type-menu/mta-type-menu.component";
import { MtaModule } from "@app/policy/mta/mta.module";
import { PolicyItemComponent } from "@app/policy/policy-item.component";
import { PolicyListComponent } from "@app/policy/policy-list.component";
import { PolicySearchComponent } from "@app/policy/policy-search.component";
import { MtaService } from "@app/policy/services/mta.service";
import { PolicyAdditionalInsuredService } from "@app/policy/services/policy-additional-insured.service";
import { PolicyLossPayeeService } from "@app/policy/services/policy-loss-payee.service";
import { ClientHttpService } from "@app/services/client-http.service";
import { MessageService } from "@app/services/message.service";
import { PolicyHttpService } from "@app/services/policy-http.service";
import { PolicyRoutingModule } from "./policy-routing.module";

@NgModule({
    declarations: [
        PolicySearchComponent,
        SearchTextBoxComponent,
        PolicyListComponent,
        NoResultsComponent,
        PolicyItemComponent,
        MtaTypeMenuComponent
    ],
    providers: [
        PolicyHttpService,
        MtaService,
        ClientHttpService,
        MessageService,
        PolicyAdditionalInsuredService,
        PolicyLossPayeeService
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        PolicyRoutingModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatButtonModule,
        MtaModule
    ]
})

export class PolicyModule { }
