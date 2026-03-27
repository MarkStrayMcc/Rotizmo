import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid";

@Component({
    selector: "app-mat-icon-grid-button",
    templateUrl: "./mat-icon-grid-button.component.html",
    styleUrls: ["./mat-icon-grid-button.component.scss"]
})
export class MatIconGridButtonComponent implements AgRendererComponent {
    @Input() public matIconText: string;
    @Input() public tooltip: string;
    @Input() public clickCallback: (data: any) => void;
    @Input() public isEnabled: (data: any) => boolean;

    @Output() public clicked = new EventEmitter();
    public emitValue: any;
    public disabled = false;

    refresh(params: any): boolean {
        return false;
    }

    agInit(params: ICellRendererParams): void {
        if (params.colDef.cellRendererParams) {
            if (params.colDef.cellRendererParams.matIconText) {
                this.matIconText = params.colDef.cellRendererParams.matIconText;
            }
            if (params.colDef.cellRendererParams.tooltip) {
                this.tooltip = params.colDef.cellRendererParams.tooltip;
            }
            if (params.colDef.cellRendererParams.clickCallback) {
                this.clickCallback = params.colDef.cellRendererParams.clickCallback;
            }
            if (params.colDef.cellRendererParams.isDisabled) {
                this.disabled = params.colDef.cellRendererParams.isDisabled(params.data);
            }
        }

        // use params to set up event
        this.emitValue = params.data; // row data
    }

    public click(): void {
        this.clicked.emit(this.emitValue);
        if (this.clickCallback) {
            this.clickCallback(this.emitValue);
        }
    }
}
