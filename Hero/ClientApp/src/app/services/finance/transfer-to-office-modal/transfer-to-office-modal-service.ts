import { ModalDialogService } from "@app/services/modal-dialog.service";
import { Injectable } from "@angular/core";
import { TransferToOfficeModalComponent } from "@finance/outstanding-funds/transfer-to-office-modal/transfer-to-office-modal.component";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { OutstandingFundsTransferResponse, MultipleOperationsResultProblemDetails } from "@app/models";

@Injectable({
    providedIn: "root"
})
export class TransferToOfficeModalService {
    constructor(private readonly modalDialogService: ModalDialogService) {
    }

    openModal(outstandingFundIds: Array<number>, afterClose: (obj: MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse) => void) {
        this.modalDialogService.openDialog<TransferToOfficeModalComponent, MultipleOperationsResultProblemDetails | OutstandingFundsTransferResponse>(
            TransferToOfficeModalComponent,
            ModalConfig.transferToOfficeModal.matDialogConfig,
            (bindObject: TransferToOfficeModalComponent) => {
                bindObject.outstandingFundIds = outstandingFundIds;
            },
            afterClose
        );
    }
}
