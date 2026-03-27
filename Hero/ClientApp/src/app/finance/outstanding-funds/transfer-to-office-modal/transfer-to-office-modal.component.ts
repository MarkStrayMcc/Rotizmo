import { Component, Input } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { OutstandingFundsTransferRequest } from "@app/models/auto-generated/OutstandingFundsTransferRequest";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";
import { MultipleOperationsResultProblemDetails, OutstandingFundsTransferResponse } from "@app/models";

@Component({
    selector: "transfer-to-office-modal",
    templateUrl: "./transfer-to-office-modal.component.html",
    styleUrls: ["./transfer-to-office-modal.component.scss"]
})
export class TransferToOfficeModalComponent {
    @Input() public outstandingFundIds: Array<number>;
    
    public isLoadingSpinnerVisible = false;
    /***
     * the response is either of the following types:
     * on failure - MultipleOperationsResultProblemDetails
     * on success - OutstandingFundsTransferResponse
     */
    public transferResponse: MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse;

    constructor(private readonly dialogRef: MatDialogRef<TransferToOfficeModalComponent>,
                private readonly outstandingFundsHttpService: OutstandingFundsHttpService) {
    }

    public onConfirm() {
        const oFundsTransferRequest = new OutstandingFundsTransferRequest();
        oFundsTransferRequest.outstandingFundIds = this.outstandingFundIds;
        this.isLoadingSpinnerVisible = true;
        this.outstandingFundsHttpService
            .transferToOffice(oFundsTransferRequest)
            .subscribe(
                (response) => {
                    this.isLoadingSpinnerVisible = false;
                    this.transferResponse = response;
                    this.closeModal();
                },
                (error) => {
                    this.isLoadingSpinnerVisible = false;
                    this.transferResponse = error;
                    this.closeModal();
                }
            );
    }

    public closeModal(): void {
        this.dialogRef.close(this.transferResponse);
    }
}
