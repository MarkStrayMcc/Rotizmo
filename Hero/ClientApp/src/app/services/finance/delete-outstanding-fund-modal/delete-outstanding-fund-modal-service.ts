import { Injectable } from "@angular/core";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { DeleteOutstandingFundModalComponent } from "@finance/outstanding-funds/delete-outstanding-fund-modal/delete-outstanding-fund-modal.component";
import { ModalConfig } from "@app/quote/popups/modal.config";

@Injectable({
    providedIn: "root"
})
export class DeleteOutstandingFundModalService {
    constructor(private readonly modalDialogService: ModalDialogService) {
    }

    openModal(outstandingFundId: number, afterClose: (obj: boolean) => void) {
        this.modalDialogService.openDialog<DeleteOutstandingFundModalComponent, boolean>(
        DeleteOutstandingFundModalComponent,
            ModalConfig.deleteOutstandingFundModal.matDialogConfig,
            (bindObject: DeleteOutstandingFundModalComponent) => {
                bindObject.outstandingFundId = outstandingFundId;
            },
            afterClose
        );
    }
}
