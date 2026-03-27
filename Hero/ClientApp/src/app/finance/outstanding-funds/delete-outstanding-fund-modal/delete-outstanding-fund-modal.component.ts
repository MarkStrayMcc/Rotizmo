import { Component, Input } from "@angular/core";
import { MatDialogRef } from "@angular/material";

@Component({
    selector: "delete-outstanding-fund-modal",
    templateUrl: "./delete-outstanding-fund-modal.component.html"
})
export class DeleteOutstandingFundModalComponent {
    @Input() public outstandingFundId: number;

    constructor(private readonly dialogRef: MatDialogRef<DeleteOutstandingFundModalComponent>) { }

    public closeModal(response: boolean): void {
        this.dialogRef.close(response);
    }
}
