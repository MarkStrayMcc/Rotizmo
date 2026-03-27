import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TemplatesModule } from "@app/shared/form-creator/templates/templates.module";
import { SharedModule } from "../shared.module";
import { SharedFormCreatorComponent } from "./form-creator.component";

export { FieldsModule } from "./fields/fields.module";
export { CreateInfo, EditInfo, FormConfig, FormGrouper, RemoveInfo } from "./form-creator.config";


@NgModule({
  declarations: [
    SharedFormCreatorComponent
  ],
  imports: [
    TemplatesModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    TemplatesModule,
    SharedFormCreatorComponent
  ],
  providers: []
})
export class FormCreatorModule { }
