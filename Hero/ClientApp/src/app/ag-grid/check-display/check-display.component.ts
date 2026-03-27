import { Component, Input } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular/main";
import { ICellRendererParams } from "ag-grid/main";

@Component({
    selector: "check-display",
    templateUrl: "./check-display.component.html",
    styleUrls: ["./check-display.component.scss"]
})

export class CheckDisplayComponent implements AgRendererComponent {
    @Input() checked: boolean = false;

    refresh(params: any): boolean {
        return false;
    }

    agInit(params: ICellRendererParams): void {
        if (params) {
            this.checked = params.value ? params.value : false;
        }
    }

    constructor() {

    }
}