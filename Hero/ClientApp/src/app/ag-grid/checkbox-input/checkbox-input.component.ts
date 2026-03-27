import { Component, Input } from "@angular/core";
import { AgRendererComponent } from "ag-grid-angular/main";
import { ICellRendererParams } from "ag-grid/main";

@Component({
    selector: "checkbox-input",
    templateUrl: "./checkbox-input.component.html",
    styleUrls: ["./checkbox-input.component.scss"]
})

export class CheckboxInputComponent implements AgRendererComponent {
    public params: ICellRendererParams;

    refresh(params: any): boolean {
        return false;
    }

    agInit(params: ICellRendererParams): void {
        if (params) {
            this.params = params;
        }
    }

    public onClick(value) {
        this.params.data[this.params.colDef.field] = value;
        this.params.value = value;
    }

    constructor() {
    }
}