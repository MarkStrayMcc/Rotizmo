import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: "mta-confirmation",
    templateUrl: "confirmation.component.html",
    styleUrls: ["confirmation.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MtaConfirmationComponent {

    constructor(public readonly dialogRef: MatDialogRef<MtaConfirmationComponent>) {}

    public confirm() {
        this.dialogRef.close(true);
    }
}
