import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatTableModule, MatTooltipModule } from "@angular/material";
import { SendEuDocumentsComponent } from "@app/compliance/send-eu-documents/send-eu-documents.component";
import { FormCreatorModule } from "@app/shared/form-creator/form-creator.module";
import { ComplianceRoutingModule } from "./compliance-routing.module";
import { EuDocumentsHttpService } from './services/eu-documents-http.service';

@NgModule({
    declarations: [
        SendEuDocumentsComponent
    ],
    providers: [
        EuDocumentsHttpService
    ],
    imports: [
        MatTableModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        FormCreatorModule,
        ComplianceRoutingModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatButtonModule
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule
    ]
})

export class ComplianceModule { }
