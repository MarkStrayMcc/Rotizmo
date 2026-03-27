import { NgModule } from "@angular/core";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { CustomPinnedRowButtonRenderer } from "@app/finance/payment-requests/custom-pinned-row-button-renderer.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MaterialModule } from "@app/material/material.module";
import { CommonModule } from "@angular/common";
import { TextGridFilterInputComponent } from "@app/ag-grid/text-grid-filter-input/text-grid-filter-input.component";
import { DropdownGridFilterInputComponent } from "@app/ag-grid/dropdown-grid-filter-input/dropdown-grid-filter-input.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { LossFundNumberDisplayComponent } from "@app/ag-grid/loss-fund-number-display/loss-fund-number-display.component";
import { OFundLinkedFinanceNumberDisplay } from "@app/ag-grid/ofund-linked-finance-number-display/ofund-linked-finance-number-display";
import { CheckDisplayComponent } from "@app/ag-grid/check-display/check-display.component";
import { CheckboxInputComponent } from "@app/ag-grid/checkbox-input/checkbox-input.component";
import { ReverseButtonComponent } from "@app/ag-grid/reverse-button/reverse-button.component";
import { MatIconGridButtonComponent } from "@app/ag-grid/mat-icon-grid-button/mat-icon-grid-button.component";

@NgModule({
    declarations: [
        TextGridFilterInputComponent,
        GridHeaderComponent,
        FinanceNumberDisplayComponent,
        LossFundNumberDisplayComponent,
        OFundLinkedFinanceNumberDisplay,
        CheckDisplayComponent,
        ReverseButtonComponent,
        CustomPinnedRowRenderer,
        CustomPinnedRowButtonRenderer,
        DropdownGridFilterInputComponent,
        CheckDisplayComponent,
        CheckboxInputComponent,
        MatIconGridButtonComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        MaterialModule
    ],
    exports: [
        TextGridFilterInputComponent,
        GridHeaderComponent,
        FinanceNumberDisplayComponent,
        LossFundNumberDisplayComponent,
        OFundLinkedFinanceNumberDisplay,
        CheckDisplayComponent,
        ReverseButtonComponent,
        CustomPinnedRowRenderer,
        CustomPinnedRowButtonRenderer,
        DropdownGridFilterInputComponent,
        CheckDisplayComponent,
        CheckboxInputComponent,
        MatIconGridButtonComponent
    ]
})
export class AgGridComponentsModule {
}
