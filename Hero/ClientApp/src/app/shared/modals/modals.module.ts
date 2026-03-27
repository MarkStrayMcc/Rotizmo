import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ErrorModule } from "@app/shared/error.module";
import { FormCreatorModule } from "@app/shared/form-creator/form-creator.module";
import { SharedModule } from "@app/shared/shared.module";
import { ConfirmationModalComponent } from "./confirmation-modal/confirmation-modal.component";

@NgModule({
    declarations: [
        ConfirmationModalComponent
    ],
    providers: [],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        FormCreatorModule,
        ErrorModule,
        SharedModule
    ],
    exports: [
        ConfirmationModalComponent,
        FormCreatorModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule
    ]
})
export class ModalsModule { }
