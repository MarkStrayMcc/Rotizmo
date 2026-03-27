import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { MultiplePropertyUploadModal } from "@app/quote/popups/multiple-property-upload-modal/multiple-property-upload-modal.component";
import { QuoteService } from "@app/quote/services/quote.service";
import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { Observable, of } from "rxjs";
import { TemplateUploadResult } from '@app/models/template-upload-result';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';
import { getLimitValue } from '@app/helpers/limit-helper';
import { PropertyLimitConfig } from '@app/quote/models/PropertyLimitConfig';
import { CoverageLimit } from '@app/models';
import { LimitBasis } from '@app/enums/LimitBasis';
import { HttpParams } from "@angular/common/http";

@Component({
    selector: "coverage-multiple-locations-upload",
    templateUrl: "./coverage-multiple-locations-upload.component.html"
})

export class CoverageMultipleLocationsUploadComponent {
    @Output() public setPropertyLimitsWithFloatingValues = new EventEmitter<{ propertyLimits: PropertyLimit[], propertyLimitFloatingValues: PropertyLimitFloatingValues, firstLossLimit: number }>();
    @Input() public binderSectionId: number;

    public readonly isMultiplePropertyFeatureToggleOn: boolean = this._userService.isFeatureAccessible("multipleProperties");
    public isMultiplePropertyBusinessLineProduct$: Observable<boolean>;

    private quote = this.quoteService.getQuote();

    constructor(
        private navigationOverrideService: NavigationOverrideService,
        private quoteService: QuoteService,
        public modalDialogService: ModalDialogService,
        private _userService: UserService,
    ) { }

    public ngOnInit() {
        if (this.isMultiplePropertyFeatureToggleOn === true)
            this.isMultiplePropertyBusinessLineProduct$ = of(true);
    }

    public allowNavigation() {
        this.navigationOverrideService.allowNavigation = true;
    }

    public openMultiplePropertyModal(): void {
        this.modalDialogService.openDialog<MultiplePropertyUploadModal, any>(
            MultiplePropertyUploadModal,
            ModalConfig.multiplePropertyUploadModal.matDialogConfig,
            (component) => { component.binderSectionId = this.binderSectionId; },
            (result: TemplateUploadResult) => this.onCloseMultiplePropertiesUploadDialog(result)
        );
    }

    public onCloseMultiplePropertiesUploadDialog(templateUploadResult: TemplateUploadResult): void {
        if (templateUploadResult?.propertyLimits?.length > 0) {
            this.setPropertyLimitsWithFloatingValues.emit({
                propertyLimits: templateUploadResult.propertyLimits,
                propertyLimitFloatingValues: templateUploadResult.propertyLimitFloatingValues,
                firstLossLimit: templateUploadResult.firstLossLimitValue
            });
        }
    }

    public showReplaceFileButton(): boolean {
        return (this.quoteService.isSaved() && this.quoteService.isUpdating()) || (!this.quoteService.isSaved() && this.quoteService.hasPropertyLimits());
    }

    private getFirstLossLimitValue(): number | null {
        if(this.quote.coverages) {
            const firstLossLimit:CoverageLimit = getLimitValue(this.quote.coverages, PropertyLimitConfig.TotalInsuredLimitCode);
            return firstLossLimit?.limitBasis == LimitBasis.FirstLossLimit ? firstLossLimit.limit : null;
        }

        return 0;
    }

    private getDownloadLocationsQueryParams(): HttpParams {
        const params = new HttpParams().set('quoteRef', this.quote.quoteReference);
        const firstLossLimit = this.getFirstLossLimitValue();

        if (firstLossLimit === null)
            return params;

        return params.set('firstLossLimit', firstLossLimit);
    }

    public getDownloadLocationsUrl(): string {
        const params = this.getDownloadLocationsQueryParams();

        return `/templates/download/${this.quote.wordingVersionId}?${params.toString()}`;
    }

    public getTemplateUrl(): string {
        return `/templates/property/${this.quote.wordingVersionId}`;
    }

    public showDownloadLocationsButton(): boolean {
        return this.quoteService.isSaved();
    }

    public showDownloadEmptyTemplateLink(): boolean {
        return !this.quoteService.hasPropertyLimits();
    }

    public showAddLocationsButton(): boolean {
        return !this.quoteService.isSaved() && !this.quoteService.hasPropertyLimits();
    }
}
