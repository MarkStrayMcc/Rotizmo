import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DialogParameters } from "@app/components/dialog/DialogParameters";
import { DialogTypes } from "@app/components/dialog/DialogTypes";

@Component({
    selector: "app-dialog",
    templateUrl: "./dialog.component.html"
})
export class DialogComponent implements OnInit {
    public isDismissiveActionVisible = true;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogParameters) { }

    ngOnInit() {
        this.setButtonsVisibility();
    }

    private setButtonsVisibility() {
        if (this.data.type === DialogTypes.Error) {
            this.isDismissiveActionVisible = false;
        }
    }
}