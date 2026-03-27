import { Component, Input } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular/main";
import { ICellRendererParams } from "ag-grid/main";

@Component({
    selector: "loss-fund-number-display",
    templateUrl: "./loss-fund-number-display.component.html",
    styleUrls: ["./loss-fund-number-display.component.scss"]
})

export class LossFundNumberDisplayComponent implements AgRendererComponent {
    @Input() displayNumber: number;
    @Input() openingBalance: number;

    cssClass: string;


    refresh(params: any): boolean {
        return false;
    }

    agInit(params: ICellRendererParams): void {
        if (params) {
            this.openingBalance = params.data.openingBalance;
            this.displayNumber = params.value;
            this.cssClass = this.getColourCodingStyle();
        }
    }

    private getColourCodingStyle(): string {
        if (this.displayNumber < 0) {
            return "breach-red";
        }
        if (this.displayNumber >= (this.openingBalance / 2)) {
            return "positive-green";
        } else {
            return "warning-orange";
        }
    }
    
    constructor() {

    }
}