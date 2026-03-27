import { Injectable } from "@angular/core";

import { PreviewDocumentFormat } from "@app/enums/PreviewDocumentFormat";
import { DocumentPreviewType } from "@app/interfaces/DocumentPreviewType";
import { Document, Quote } from "@app/models";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { PreviewDocumentModalComponent } from "@app/quote/popups/preview-document-modal/preview-document-modal.component";
import { ModalDialogService } from "@app/services/modal-dialog.service";

@Injectable()
export class PreviewDocumentModalService {

    constructor(
        public modalDialogService: ModalDialogService) {
    }

    public openPreviewDocumentDialog(
        previewType: DocumentPreviewType,
        quote: Quote,
        afterClose: (obj: number) => void = null
    ) {
        const url = previewType.getUrl(quote);
        this.openDialog(url, previewType.title, afterClose);
    }

    public openPreviewClauseDialog(
        endorsement: Document,
        quote: Quote,
        title: string,
        afterClose: (obj: number) => void = null
    ) {
        const targetInception = new Date(quote.inceptionDate).toISOString();
        const companyName = quote.client.companyName.replace('/','');
        const query = quote.policyNumber ?
            `${endorsement.documentVersionId}/${quote.policyNumber}/${targetInception}/${companyName}`:
            `${endorsement.documentVersionId}/${targetInception}/${companyName}`;

        const url = `document/pdf/endorsement/` + query;

        this.openDialog(url, title, afterClose);
    }

    private openDialog(url: string, title: string, afterClose: (obj: number) => void) {
        this.modalDialogService.openDialog<PreviewDocumentModalComponent, number>(
            PreviewDocumentModalComponent,
            ModalConfig.previewDocumentModal.matDialogConfig, obj => {
                obj.previewDocumentUrl = url;
                obj.documentType = PreviewDocumentFormat.Pdf;
                obj.modalTitle = title;
            },
            afterClose);
    }
}
