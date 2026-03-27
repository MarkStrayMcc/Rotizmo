import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressEditComponent } from './address-edit/address-edit.component';
import { ErrorModule } from '@app/shared/error.module';



@NgModule({
  declarations: [AddressEditComponent],
  imports: [
    CommonModule,
    ErrorModule
  ],
  exports: [AddressEditComponent]
})
export class CustomFormModule { }
