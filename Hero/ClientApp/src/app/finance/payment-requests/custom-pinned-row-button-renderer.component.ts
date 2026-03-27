import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    selector: "floating-cell",
    template: `<button type="button" [ngStyle]="style" [ngClass]="classValue" (click)="invokeParentMethod()">{{params.value}}</button>`
})
export class CustomPinnedRowButtonRenderer implements ICellRendererAngularComp {
    public params: any;
    public style: string;
    public classValue: string;
    public value: string;
    public callback: any;

    public agInit(params: any): void {
        this.params = params;
        this.style = this.params.style;
        this.classValue = this.params.classValue;
        this.value = this.params.value;
        this.callback = this.params.callback;
    }

    public invokeParentMethod(): void {
        if (this.callback) {
            this.callback();
        } else {
            this.params.context.componentParent.methodOnCustomPinnedRowButtonContainer(this.params);
        }
    }

    public refresh(): boolean {
        return false;
    }
}
