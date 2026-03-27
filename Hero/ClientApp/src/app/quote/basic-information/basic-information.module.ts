import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

import { SharedModule } from '@app/shared/shared.module';
import { ErrorModule } from "@app/shared/error.module";
import { BasicInformationShellComponent } from '@app/quote/basic-information/basic-information-shell/basic-information-shell.component';
import { BasicInformationViewComponent } from '@app/quote/basic-information/basic-information-view/basic-information-view.component';
import { BasicInformationRoutingModule } from '@app/quote/basic-information/basic-information-routing.module';
import { BasicInformationWrapperComponent } from '@app/quote/basic-information/basic-information-wrapper/basic-information-wrapper.component';
import { CustomFormModule } from '@app/quote/custom-form/custom-form.module';
import { QuoteStoreModule } from '@app/quote-store/quote-store.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ErrorModule,
    BasicInformationRoutingModule,
    CustomFormModule,
    QuoteStoreModule
  ],
  declarations: [
    BasicInformationShellComponent,
    BasicInformationViewComponent,
    BasicInformationWrapperComponent
  ],
  exports: [
    BasicInformationWrapperComponent
  ]
})
export class BasicInformationModule { }
