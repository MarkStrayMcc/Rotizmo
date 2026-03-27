import { NgModule } from '@angular/core';
import { ErrorComponent } from '@app/components/error/error.component';
import { CommonModule } from '@angular/common';
import { WarningComponent } from '@app/components/warning/warning.component';

@NgModule({
    declarations: [
        ErrorComponent,
        WarningComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        ErrorComponent,
        WarningComponent
    ]
})
export class ErrorModule {}