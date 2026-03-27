import { Component, Input, Output } from "@angular/core";
import { ICellRendererParams } from "ag-grid";
import { AgRendererComponent } from "ag-grid-angular";
import { EventEmitter } from "events";

@Component({
    selector: "reverse-button",
    templateUrl: "./reverse-button.component.html",
    styleUrls: ["./reverse-button.component.scss"]
})
/** grid-icon-button component*/
export class ReverseButtonComponent implements AgRendererComponent {
    @Input() public matIconText: string;
    @Input() public tooltip: string;
    @Input() public clickCallBackMethod: (data: any) => void;

    @Output() public onClicked = new EventEmitter();

    public emitValue: any;
    public enabled: boolean;

    public click(): void {
        this.onClicked.emit(this.emitValue);
        
        if (this.clickCallBackMethod) {
            this.clickCallBackMethod(this.emitValue);
        }
    }

    public refresh(): boolean {
        return false;
    }

    // This is so that it works with AG grid
    public agInit(params: ICellRendererParams): void {
        if (params.context) {
            if (params.context.matIconText) {
                this.matIconText = params.context.matIconText;
            }
            if (params.context.reverseTooltip) {
                this.tooltip = params.context.reverseTooltip;
            }
            if (params.context.reverseClickCallback) {
                this.clickCallBackMethod = params.context.reverseClickCallback;
            }
        }

        this.enabled = this.isSelectedTransactionNotTransferredToOfficeOrNotReversed(params) ;

        // use params to set up event
        this.emitValue = params.data;
    }

    private isSelectedTransactionNotTransferredToOfficeOrNotReversed(params: any): boolean {
        if (params.data.financialTransactionId && !(params.data.transferredToOffice) &&
            !(params.data.reverseFinancialTransactionId !== undefined &&
                params.data.reverseFinancialTransactionId > 0)) {
            return true;
        } else {
            return false;
        }
    }
}
