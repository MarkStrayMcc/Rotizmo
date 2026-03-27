import { Component } from "@angular/core";
import { PreviewDocumentFormat } from "@app/enums/PreviewDocumentFormat";

@Component({
    selector: "preview-document-modal",
    templateUrl: "./preview-document-modal.component.html",
    styleUrls: ["./preview-document-modal.component.scss"]
})
export class PreviewDocumentModalComponent {
    public previewDocumentFormat = PreviewDocumentFormat;
    public previewDocumentUrl: string;
    public documentType: PreviewDocumentFormat;
    public isLoaded: boolean = false;
    public zoomTo: number = 1;
    public modalTitle: string = "Document Preview";
    public isErrorLoading = false;

    public afterLoadComplete(): void {
        this.isLoaded = true;
    }

    public zoomIn(): void {
        this.zoomTo = this.zoomTo + 0.25;
    }

    public zoomOut(): void {
        if (this.zoomTo > 1) {
            this.zoomTo = this.zoomTo - 0.25;
        }
    }

    public onError(_){
        this.isLoaded = true;
        this.isErrorLoading = true;
    }
}
