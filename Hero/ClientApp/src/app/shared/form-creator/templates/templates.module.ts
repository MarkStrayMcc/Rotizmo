import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorModule } from '@app/shared/error.module';
import { SharedModule } from '@app/shared/shared.module';
import { FieldsModule } from '../fields/fields.module';
import { OneColumnTemplateComponent } from "./one-column/one-column-template.component";
import { TwoColumnsTemplateComponent } from './two-columns/two-columns-template.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorModule,
    SharedModule,
    FieldsModule
  ],
  declarations: [
    OneColumnTemplateComponent,
    TwoColumnsTemplateComponent
  ],
  exports: [
    FieldsModule,
    OneColumnTemplateComponent,
    TwoColumnsTemplateComponent
  ]
})

export class TemplatesModule { }
