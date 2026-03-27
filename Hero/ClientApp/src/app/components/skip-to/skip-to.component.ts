import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: "skip-to",
    styleUrls: ["./skip-to.component.scss"],
    templateUrl: "./skip-to.component.html"
})
export class SkipToComponent implements OnInit {
    @Input() public isPrevious = false;
    @Input() public isDisabled = false;
    
    @Output() public onSkipToClick = new EventEmitter();

    public skipToDirection: string;

    public ngOnInit() {
        this.skipToDirection = this.isPrevious ? "PREVIOUS" : "NEXT";
    }

    public skipToClicked() {
        if (this.isDisabled) return;

        this.onSkipToClick.emit();
    }
}
