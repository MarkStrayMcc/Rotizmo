import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PopupsModule } from "./popups/popups.module";

@NgModule({
    declarations: [
    ],
    providers: [
    ],
    imports: [
      PopupsModule,
      CommonModule,
      ReactiveFormsModule,
      FormsModule
    ],
    exports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule
    ]
})
export class MtaModule { }
