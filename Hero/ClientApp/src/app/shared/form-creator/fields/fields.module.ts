import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ErrorModule } from "@app/shared/error.module";
import { SharedModule } from "@app/shared/shared.module";
import { AttachmentFieldComponent } from "./attachment-field/attachment-field.component";
import { CheckboxFieldComponent } from "./checkbox-field/checkbox-field.component";
import { ContactFieldComponent } from "./contact-field/contact-field.component";
import { CurrencyFieldComponent } from "./currency-field/currency-field.component";
import { DateFieldComponent } from "./date-field/date-field.component";
import { DisabledFieldRendererComponent } from "./disabled-field-renderer/disabled-field-renderer.component";
import { DropDownFieldComponent } from './dropdown-field/dropdown-field.component';
import { FormFieldRendererComponent } from "./form-field-renderer/form-field-renderer.component";
import { IntegerFieldComponent } from "./integer-field/integer-field.component";
import { ReadOnlyFieldComponent } from './readonly-field/readonly-field.component';
import { SubjectFieldComponent } from './subject-field/subject-field.component';
import { TextAreaFieldComponent } from "./text-area/text-area.component";

export { AttachmentFieldComponent } from "./attachment-field/attachment-field.component";
export { CheckboxFieldComponent } from "./checkbox-field/checkbox-field.component";
export { ContactFieldComponent } from "./contact-field/contact-field.component";
export { DateFieldComponent } from "./date-field/date-field.component";
export { DisabledFieldRendererComponent } from "./disabled-field-renderer/disabled-field-renderer.component";
export { DropDownFieldComponent } from "./dropdown-field/dropdown-field.component";
export { FormFieldRendererComponent } from "./form-field-renderer/form-field-renderer.component";
export { IntegerFieldComponent } from "./integer-field/integer-field.component";
export { ReadOnlyFieldComponent } from "./readonly-field/readonly-field.component";
export { SubjectFieldComponent } from "./subject-field/subject-field.component";
export { TextAreaFieldComponent } from "./text-area/text-area.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorModule,
    SharedModule
  ],
  declarations: [
    FormFieldRendererComponent,
    CheckboxFieldComponent,
    IntegerFieldComponent,
    DateFieldComponent,
    TextAreaFieldComponent,
    DisabledFieldRendererComponent,
    ContactFieldComponent,
    AttachmentFieldComponent,
    SubjectFieldComponent,
    DropDownFieldComponent,
    ReadOnlyFieldComponent,
    CurrencyFieldComponent
  ],
  exports: [
    FormFieldRendererComponent,
    CheckboxFieldComponent,
    IntegerFieldComponent,
    DateFieldComponent,
    TextAreaFieldComponent,
    ContactFieldComponent,
    DisabledFieldRendererComponent,
    AttachmentFieldComponent,
    SubjectFieldComponent,
    DropDownFieldComponent,
    ReadOnlyFieldComponent,
    CurrencyFieldComponent
  ]
})

export class FieldsModule { }
