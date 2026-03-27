import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { MessageType } from "@app/enums/MessageType";
import { QuoteStep } from "@app/enums/QuoteStep";
import { SaveQuoteErrorCode } from "@app/enums/SaveQuoteErrorCode";
import { isAustralia } from "@app/helpers";
import { DocumentPreviewType } from "@app/interfaces/DocumentPreviewType";
import { CfcContact, Message, Quote, QuotePublishRequest, QuoteState } from "@app/models";
import { DocumentPreviewTypes } from "@app/models/document-preview-types";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { PublishQuoteModalComponent } from "@app/quote/popups/publish-quote-modal/publish-quote-modal.component";
// tslint:disable-next-line:max-line-length
import { UnderwriterReferralSelectorModal } from "@app/quote/popups/selector-modals/underwriter-referral-selector-modal/underwriter-referral-selector-modal.component";
import { UnderwriterNotesModal } from "@app/quote/popups/underwriter-notes-modal/underwriter-notes-modal.component";
import { FeaturesHttpService } from "@app/services/features-http.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { UserService } from "@app/services/user.service";
import { WarningService } from "@app/services/warning.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ClientFolderService } from '../../../services/client-folder.service';
import { QuoteService } from '@app/quote/services/quote.service';

@Component({
    selector: "quote-summary-panel",
    templateUrl: "quote-summary-panel.component.html",
    styleUrls: ["quote-summary-panel.component.scss"]
})
export class QuoteSummaryPanelComponent implements OnInit, OnDestroy {
    @Input()
    public vm: Quote;
    @Input()
    public enableSave: boolean = false;
    @Input()
    public inserted: boolean = false;
    @Input()
    public isSaving: boolean = false;
    @Input()
    public isCalculating: boolean = false;
    @Input()
    public showRecalculate: boolean = false;
    @Input()
    public canRecalculatePricing: boolean = false;
    @Input()
    public currentStep: number;
    @Input()
    public isPublishableQuote: boolean;
    @Input()
    public isPublishableWordingVersion: boolean;

    @Output()
    public send = new EventEmitter();
    @Output()
    public saveQuote = new EventEmitter();
    @Output()
    public sendQuote = new EventEmitter();
    @Output()
    public sendPolicy = new EventEmitter();
    @Output()
    public bind = new EventEmitter();
    @Output()
    public recalculate = new EventEmitter();
    @Output()
    public unreserveCapacity = new EventEmitter();

    // TODO: rename into startQuoteUpdateFlow() or similar
    @Output()
    public allowUpdate = new EventEmitter();

    public isGstVisible: boolean = false;
    public quoteState = QuoteState;
    public previewTypes = new DocumentPreviewTypes();
    public isPublishQuoteEnabled: boolean = false;
    public quoteStep = QuoteStep;
    public isTerrorismProduct: boolean = false;

    private ngUnsubscribe = new Subject<void>();

    constructor(
        public dialog: MatDialog,
        public router: Router,
        public modalDialogService: ModalDialogService,
        private navigationOverrideService: NavigationOverrideService,
        private previewDocumentModalService: PreviewDocumentModalService,
        private warningService: WarningService,
        private messageService: MessageService,
        private featuresHttpService: FeaturesHttpService,
        private clientFolderService: ClientFolderService,
        private goodsAndServicesTaxService: GoodsAndServicesTaxService,
        private userService: UserService,
        private premiumCalculationService: PremiumCalculationsService,
        private quoteService: QuoteService
    ) {
    }

    public ngOnInit(): void {
        this.featuresHttpService.isFeatureActive("publishQuoteButton", this.vm.brokerContact.id).subscribe(
            f => {
                this.isPublishQuoteEnabled = f.hasAccess;
            }
        );

        if (this.userService.isFeatureAccessible("heroNewZealandGst")) {
            this.goodsAndServicesTaxService.updateGSTRate(this.vm.inceptionDate); // Trigger intial GST visibility check
            this.goodsAndServicesTaxService.gstUpdateHandler();
            this.premiumCalculationService.premiumUpdateHandler();
            this.goodsAndServicesTaxService.isGstVisible.pipe(takeUntil(this.ngUnsubscribe)).subscribe(isGstVisible => this.isGstVisible = isGstVisible);
        }

        this.isTerrorismProduct = this.vm?.product?.productName === "T&S";
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public get gst() {
        return (this.vm && this.vm.gst) ? this.vm.gst : 0;
    }

    public get disabled(): boolean {
        return !this.enableSave;
    }

    public get isInserted(): boolean {
        return this.inserted;
    }

    public get wordingVersionUrl(): string {
        const wording = this.previewTypes.wordingDocumentPreview;
        this.setCoverholderInformation();
        return wording.getUrl(this.vm);
    }

    public clickSendQuote(): void {
        this.sendQuote.emit();
    }

    public clickRecalculate(): void {
        this.recalculate.emit();
    }

    public clickSendPolicy(): void {
        this.sendPolicy.emit();
    }

    public clickSaveQuote(): void {
        this.saveQuote.emit();
    }

    public clickBind() {
        this.bind.emit();
    }

    public hasBlastZoneCapacity(): boolean {
        return this.quoteService.getHasBlastZoneCapacity().value;
    }

    public clickUnreserveCapacity() {
        this.unreserveCapacity.emit();
    }

    public clickNewQuote() {
        this.allowNavigation();
        this.router.navigate(["quote", { quoteRef: this.vm.quoteReference, isNew: true, step: QuoteStep.BasicInformation }]);
        this.messageService.clearAllMessages();
    }

    public clickUpdateQuote() {
        this.allowUpdate.emit();
        this.messageService.clearAllMessages();
    }

    public openUnderwriterNotesDialog() {
        this.modalDialogService.openDialog<UnderwriterNotesModal, number>(
            UnderwriterNotesModal,
            ModalConfig.underwriterModal.matDialogConfig,
            obj => obj.clientId = this.vm.client.id,
            null);
    }

    public openUnderwriterReferralSelectorDialog() {
        this.modalDialogService.openDialog<UnderwriterReferralSelectorModal, CfcContact>(
            UnderwriterReferralSelectorModal,
            ModalConfig.underwriterReferralSelectorModal.matDialogConfig,
            obj => obj.quoteId = this.vm.quoteReference,
            result => this.onCloseUnderwriterReferralSelectorDialog(result));
    }

    public openPreviewDocumentDialog(previewType: DocumentPreviewType) {
        this.setCoverholderInformation();
        this.previewDocumentModalService.openPreviewDocumentDialog(previewType, this.vm);
    }

    private setCoverholderInformation() {
        if(this.vm.assignedContact) this.vm.assignedContact.cfcTeamCoverholder = this.userService.cfcTeamCoverholder.value;
    }

    public openPublishQuoteDialog() {
        if(this.isTerrorismProduct && !this.hasBlastZoneCapacity()) {
            this.messageService.sendMessage(new Message("Blast zone capacity is required to publish a terrorism quote.", MessageType.Warning));
            return;
          }
        this.modalDialogService.openDialog<PublishQuoteModalComponent, QuotePublishRequest>(
            PublishQuoteModalComponent,
            ModalConfig.publishQuoteModal.matDialogConfig,
            obj => {
                obj.publishRequest = ({
                    quoteId: this.vm.quoteReference,
                    isPublished: this.vm.isPublished,
                    isBindable: this.vm.isBindable
                } as QuotePublishRequest);
                obj.currency = this.vm.currency;
                obj.coverages = this.vm.coverages;
            },
            result => this.onClosePublishQuoteModal(result));
    }

    public onClosePublishQuoteModal(result: QuotePublishRequest) {
        if (result) {
            this.vm.isPublished = result.isPublished;
            this.vm.isBindable = result.isBindable;
        }

        if (this.vm.isPublished) {
            this.clickSendQuote();
        }
    }

    public openClientFolder() {
        this.clientFolderService.getClientFolder(this.vm.client.id)
            .subscribe(
                (data) => {
                    if (data) {
                        window.open(`cfcfolderprotocol:${encodeURIComponent(data)}`);
                    } else {
                        this.messageService.sendMessage(new Message("Client folder could not be found", MessageType.Warning));
                    }
                },
                (error) => {
                    console.error(error);
                    this.messageService.sendMessage(new Message("Client folder could not be opened", MessageType.Warning));
                }
            );
    }

    public allowNavigation() {
        this.navigationOverrideService.allowNavigation = true;
    }

    public get showRecalculateBtn(): boolean {
        return this.showRecalculate;
    }

    public quoteHasWarning(): boolean {
        return this.warningService.hasWarning(this.vm);
    }

    public showSendAndBindAndPublishButtons(): boolean {
        return this.vm && (this.vm.state > QuoteState.Create || (this.vm.state === QuoteState.Create && !this.quoteHasWarning()));
    }

    public showReferButton(): boolean {
        return this.vm && (this.vm.state === QuoteState.Create || this.vm.state === QuoteState.Saved) && this.quoteHasWarning();
    }

    public showDownloadAndPreviewQuoteButtons(): boolean {
        if (this.vm && this.vm.quoteReference) {
            if (this.vm.error && this.vm.error.code === SaveQuoteErrorCode.SaveQuoteDocument) {
                return false;
            }
            return true;
        }
        return false;
    }

    public areSendQuoteAndBindButtonsEnabled(): boolean {
        if (!this.vm) { return false; }
        if (this.vm.state === QuoteState.Bound) { return false; }
        if(this.isTerrorismProduct && this.quoteService.getHasBlastZoneCapacity().value === false) return false;
        if (this.vm.state > QuoteState.Create) { return true; }
        if (this.vm.state === QuoteState.Create && !this.quoteHasWarning()) { return true; }

        return false;
    }

    public onCloseUnderwriterReferralSelectorDialog(result) {
        this.messageService.clearMessage();
        if (result && result.success) {
            const successMessage = new Message("The quote has been successfully referred to " + result.underwriter.name,
                MessageType.Info);
            this.messageService.sendMessage(successMessage);
        } else if (result && !result.success) {
            const errorMessage = new Message("An error occurred when referring the quote.",
                MessageType.Error);
            this.messageService.sendMessage(errorMessage);
        }
    }

    public get showGST(): boolean {
        if (!this.vm || !this.vm.insuredLocation || !this.vm.insuredLocation.country) {
            return false;
        }

        if (this.userService.isFeatureAccessible("heroNewZealandGst")) {
            return this.isGstVisible;
        } else {
            return isAustralia(this.vm.insuredLocation);
        }
    }

}
