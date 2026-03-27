import { Component, Input } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular/main";
import { ICellRendererParams } from "ag-grid/main";

@Component({
    selector: "ofund-linked-finance-number-display",
    templateUrl: "./ofund-linked-finance-number-display.html",
    styleUrls: ["./ofund-linked-finance-number-display.scss"]
})

export class OFundLinkedFinanceNumberDisplay implements AgRendererComponent {
    @Input() displayNumber: number;
    @Input() redNegatives: boolean = true;

    refresh(params: any): boolean {
        return false;
    }

    agInit(params: ICellRendererParams): void {
        if (params) {
            this.displayNumber = params.value;
            if (params.colDef.hasOwnProperty("cellRendererParams")) {
                if (params.colDef.cellRendererParams.hasOwnProperty("redNegatives")) {
                    this.redNegatives = params.colDef.cellRendererParams.redNegatives;
                }
            }
        }
    }

    constructor() {

    }
}
