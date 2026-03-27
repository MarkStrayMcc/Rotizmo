import { Component } from "@angular/core";
import { ErrorMessageHandlerService } from "../../../services/error-message-handler.service";

import { MessageService } from "../../../services/message.service";
import { QuoteHttpService } from "../../../services/quote-http.service";

import { Currency, Coverage, QuotePublishRequest} from "@app/models";
import { MatDialogRef } from "@angular/material";
import { Subscription } from "rxjs";
import { first } from 'rxjs/operators';


@Component({
    selector: "publish-quote-modal",
    templateUrl: "./publish-quote-modal.component.html",
    styleUrls: ["./publish-quote-modal.component.scss"]
})
export class PublishQuoteModalComponent {
    public publishRequest: QuotePublishRequest;
    public currency: Currency = {
        id: 1,
        isoCode: "GBP",
        name: "Pound",
        symbol: "£",
        rate: 1
    };
    public coverages: Coverage[];
    public modalOpenedSubscription: Subscription;

    public disabled: boolean = false;
    public hasNoError: boolean = true;

    constructor(
        public quoteService: QuoteHttpService,
        private readonly dialogRef: MatDialogRef<PublishQuoteModalComponent>,
        private readonly messageErrorHandler: ErrorMessageHandlerService,
        private readonly messageService: MessageService
    ) {
    }

    public ngOnDestroy(): void {
        if (this.modalOpenedSubscription) {
            this.modalOpenedSubscription.unsubscribe();
        }
    }

    public onCloseModal(): void {
        this.messageService.clearMessage();
        this.dialogRef.close(this.publishRequest);
    }

    private setQuotePublishData(): void {
        this.publishRequest.isBindable = true;
        this.publishRequest.isEditable = false;
        this.publishRequest.isPublished = true;
        this.publishRequest.pricingGroups = [];
    }

    public publishQuote(): void {
        this.messageService.clearMessage();
        this.disabled = true;
        this.setQuotePublishData();

        this.quoteService.publishQuote(this.publishRequest)
            .pipe(first())
            .subscribe(v => {
                this.publishRequest.isPublished = true;
            },
                error => {
                    this.hasNoError = false;
                    this.publishRequest.isPublished = false;
                    this.messageErrorHandler.handleError("Failed to publish quote. Please try again.");
                    console.error(JSON.stringify(error));
                },
                () => {
                    if (this.hasNoError) {
                        this.onCloseModal();
                    }
                    this.disabled = false;
                });
    }
}
