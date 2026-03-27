import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "warning",
    templateUrl: "./warning.component.html",
    styleUrls: ["./warning.component.scss"]
})
export class WarningComponent implements OnInit {

    @Input()
    public hasWarning: boolean = false;

    @Input()
    public warningText: string = "warning text";

    @Input()
    public showBorder: boolean = true;

    public ngOnInit(): void {
        this.showBorder = coerceBooleanProperty(this.showBorder);
    }
}