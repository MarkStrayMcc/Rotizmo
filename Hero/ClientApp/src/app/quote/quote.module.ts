import { AgmCoreModule } from "@agm/core";
import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { SurplusLineSelectorComponent } from "@app/components/surplus-line-selector/surplus-line-selector.component";
import { ActivityListComponent } from "@app/quote/components/activities/activity-list/activity-list.component";
import { ActivitySelectorComponent } from "@app/quote/components/activities/activity-selector/activity-selector.component";
import { CoverageOptionComponent } from "@app/quote/components/coverage/coverage-option/coverage-option.component";
import { CoverageComponent } from "@app/quote/components/coverage/coverage.component";
import { ExcessComponent } from "@app/quote/components/coverage/excess/excess.component";
import { LimitComponent } from "@app/quote/components/coverage/limit/limit.component";
import { BusinessLine } from "@app/quote/components/pricing/business-line/business-line.component";
import { CommissionPricing } from "@app/quote/components/pricing/commission-pricing/commission-pricing.component";
// tslint:disable-next-line:max-line-length
import { QuotePricingGroupComponent } from "@app/quote/components/pricing/quote-pricing-group/quote-pricing-group.component";
import { QuoteSummaryPanelComponent } from "@app/quote/components/quote-summary-panel/quote-summary-panel.component";
import { RiskPanelComponent } from "@app/quote/components/risk-panel/risk-panel.component";
import { DateQuestionComponent } from "@app/quote/components/risk/datequestion/datequestion.component";
import { DropDownComponent } from "@app/quote/components/risk/drop-down/drop-down.component";
import { FreeTextComponent } from "@app/quote/components/risk/free-text/free-text.component";
import { IntegerComponent } from "@app/quote/components/risk/integer/integer.component";
import { PercentageFieldComponent } from "@app/quote/components/risk/percentage-field/percentage-field.component";
import { RadioButtonComponent } from "@app/quote/components/risk/radiobutton/radiobutton.component";
import { RetroDateComponent } from "@app/quote/components/risk/retro-date/retrodate.component";
import { RiskCurrencyComponent } from "@app/quote/components/risk/risk-currency/risk-currency.component";
import { RiskQuestionValidationHandler } from "@app/quote/components/risk/risk-form-validation-handler/risk-question-validation-handler";
import { SearchableDropdownComponent } from "@app/quote/components/risk/searchable-dropdown/searchable-dropdown.component";
import { TextAreaComponent } from "@app/quote/components/risk/text-area/text-area.component";
import { QuoteSubjectivitiesListComponent } from "@app/quote/components/subjectivities/quote-subjectivities-list/quote-subjectivities-list.component";
import { QuoteSubjectivityComponent } from "@app/quote/components/subjectivities/quote-subjectivity/quote-subjectivity.component";
import { DocumentScopePipe } from "@app/quote/pipes/document-scope.pipe";
import { AddressMapViewModal } from "@app/quote/popups/address-map-view-modal.component";
import { BespokeClauseModalComponent } from "@app/quote/popups/bespoke-clause-modal/bespoke-clause-modal.component";
import { BindQuoteBasicStepComponent } from "@app/quote/popups/bind-quote-modal/bind-quote-basic-step/bind-quote-basic-step.component";
import { BindQuoteModalComponent } from "@app/quote/popups/bind-quote-modal/bind-quote-modal.component";
import { BindQuotePricingStepComponent } from "@app/quote/popups/bind-quote-modal/bind-quote-pricing-step/bind-quote-pricing-step.component";
import { BindQuoteSubjectivitiesStepComponent } from "@app/quote/popups/bind-quote-modal/bind-quote-subjectivities-step/bind-quote-subjectivities-step.component";
import { ClientAddressModal } from "@app/quote/popups/client-address-modal.component";
import { ClientManageAddressModal } from "@app/quote/popups/client-manageaddress-modal.component";
import { PreviewDocumentModalComponent } from "@app/quote/popups/preview-document-modal/preview-document-modal.component";
import { PublishQuoteModalComponent } from "@app/quote/popups/publish-quote-modal/publish-quote-modal.component";
import { QuoteAdditionalInsuredComponent } from "@app/quote/popups/quote-additional-insured-modal/quote-additional-insured.component";
import { QuoteLossPayeeComponent } from "@app/quote/popups/quote-loss-payee-modal/quote-loss-payee.component";
import { ProductSelectorModal } from "@app/quote/popups/selector-modals/product-selector-modal/product-selector-modal.component";
// tslint:disable-next-line:max-line-length
import { RiskQuestionAnswerPipe } from "@app/pipes/risk-question-answer/risk-question-answer.pipe";
import { UnderwriterReferralSelectorModal } from "@app/quote/popups/selector-modals/underwriter-referral-selector-modal/underwriter-referral-selector-modal.component";
import { SendEmailModalComponent } from "@app/quote/popups/send-email-modal/send-email-modal.component";
import { SurplusLinesBrokerModal } from "@app/quote/popups/surplus-lines-broker-modal/surplus-lines-broker-modal.component";
import { UnderwriterNoteReply } from "@app/quote/popups/underwriter-notes-modal/underwriter-note-reply/underwriter-note-reply.component";
import { UnderwriterNotesModal } from "@app/quote/popups/underwriter-notes-modal/underwriter-notes-modal.component";
import { QuoteRoutingModule } from "@app/quote/quote-routing.module";
import { QuoteComponent } from "@app/quote/quote.component";
import { QuoteService } from "@app/quote/services/quote.service";
import { SurplusLinesLicenseHttpService } from "@app/quote/services/surplus-lines-license-http.service";
import { SurplusLinesLicenseService } from "@app/quote/services/surplus-lines-license.service";
import { ActivitiesStepComponent } from "@app/quote/steps/activities-step/activities-step.component";
import { BasicInformationStepComponent } from "@app/quote/steps/basic-information-step/basic-information-step.component";
import { CoveragesStepComponent } from "@app/quote/steps/coverages-step/coverages-step.component";
import { EndorsementsStepComponent } from "@app/quote/steps/endorsements-step/endorsements-step.component";
import { PricingStepComponent } from "@app/quote/steps/pricing-step/pricing-step.component";
import { RiskStepComponent } from "@app/quote/steps/risk-step/risk-step.component";
import { SubjectivitiesStepComponent } from "@app/quote/steps/subjectivities-step/subjectivities-step.component";
import { SubjectivityConfigurationStepComponent } from "@app/quote/steps/subjectivity-configuration-step/subjectivity-configuration-step.component";
import DeactivateGuard from "@app/routeguards/deactivate-guard/deactivate-guard";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { CfcContactHttpService } from "@app/services/cfc-contact-http.service";
import { ClientClearanceHttpService } from "@app/services/client-clearance-http.service";
import { ClientClearanceService } from "@app/services/client-clearance-service";
import { ClientFolderService } from "@app/services/client-folder.service";
import { ClientLatestReferenceHttpService } from "@app/services/client-latestreference-http.service";
import { CoverageItemService } from "@app/services/coverage-item.service";
import { CoverageService } from "@app/services/coverage.service";
import { EnquiryValidationService } from "@app/services/enquiry-validation.service";
import { FeeHttpService } from "@app/services/fee-http.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { ProductHttpService } from "@app/services/product-http.service";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";
import { ReferralService } from "@app/services/referral.service";
import { RiskHttpService } from "@app/services/risk-http.service";
import { RiskPanelFormBuilder } from "@app/services/risk-panel-form-builder";
import { RiskService } from "@app/services/risk-service";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserAuthorityHttpService } from "@app/services/user-authority-http.service";
import { WarningService } from "@app/services/warning.service";
import { ErrorModule } from "@app/shared/error.module";
import { FormCreatorModule } from "@app/shared/form-creator/form-creator.module";
import { SharedModule } from "@app/shared/shared.module";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { BasicInformationModule } from "./basic-information/basic-information.module";
import { ActivitySearchComponent } from "./components/activities/activity-search/activity-search.component";
import { ClientSanctionsCheckComponent } from "./components/client-sanctions-check/client-sanctions-check.component";
import { CoverageMultipleLocationsUploadComponent } from "./components/coverage/coverage-multiple-locations-upload/coverage-multiple-locations-upload.component";
import { LocalBrokersComponent } from "./components/local-brokers/local-brokers.component";
import { RiskPanelWarningsHandler } from "./components/risk-panel/risk-panel-warnings-handler/risk-panel-warnings-handler";
import { CheckBoxesComponent } from "./components/risk/check-boxes/check-boxes.component";
import { DropDownWithValidationComponent } from "./components/risk/drop-down-with-validation/drop-down-with-validation.component";
import { BlastZoneCheckComponent } from './popups/multiple-property-upload-modal/blast-zone-check/blast-zone-check.component';
import { BlastZoneFloatingValuesComponent } from './popups/multiple-property-upload-modal/blast-zone-check/floating-values/blast-zone-floating-values.component';
import { PropertyLimitValuesComponent } from './popups/multiple-property-upload-modal/blast-zone-check/property-limit-values/property-limit-values.component';
import { DropzoneFileInputComponent } from './popups/multiple-property-upload-modal/dropzone-file-input/dropzone-file-input.component';
import { LocationValidationResultsComponent } from './popups/multiple-property-upload-modal/location-validation-results/location-validation-results.component';
import { MultiplePropertyUploadModal } from "./popups/multiple-property-upload-modal/multiple-property-upload-modal.component";
import { BrokerSelectorModalComponent } from "./popups/selector-modals/broker-selector-modal/broker-selector-modal.component";
import { QuoteSelectorComponent } from "./popups/send-email-modal/quote-selector/quote-selector.component";
import { ActivityService } from "./services/activity.service";
import { BordereauHttpService } from "./services/bordereau-http.service";
import { CurrencyService } from "./services/currency.service";
import { EnrichmentAdapterService } from "./services/enrichment-adapter.service";
import { LanguageHttpService } from "./services/language-http.service";
import { LanguageService } from "./services/language.service";
import { WordingVersionHttpService } from "./services/wording-version/wording-version-http-service";
import { WordingVersionService } from "./services/wording-version/wording-version-service";
import { MultiplePropertyComponent } from "./steps/endorsements-step/modals/multiple-property/multiple-property.component";
import { InsuredAddressComponent } from "./steps/endorsements-step/modals/multiple-property/property-limit/insured-address/insured-address.component";
import { PropertyLimitComponent } from "./steps/endorsements-step/modals/multiple-property/property-limit/property-limit.component";

@NgModule({
    declarations: [
        QuoteComponent,

        // Steps
        BasicInformationStepComponent,
        CoveragesStepComponent,
        ActivitiesStepComponent,
        RiskStepComponent,
        SubjectivitiesStepComponent,
        SubjectivityConfigurationStepComponent,
        EndorsementsStepComponent,
        PricingStepComponent,

        // Panels
        QuoteSummaryPanelComponent,
        RiskPanelComponent,

        // Modals
        AddressMapViewModal,
        ClientAddressModal,
        ClientManageAddressModal,
        ProductSelectorModal,
        BrokerSelectorModalComponent,
        UnderwriterReferralSelectorModal,
        UnderwriterNotesModal,
        UnderwriterNoteReply,
        SendEmailModalComponent,
        BindQuoteModalComponent,
        PublishQuoteModalComponent,
        BespokeClauseModalComponent,
        QuoteAdditionalInsuredComponent,
        QuoteLossPayeeComponent,
        SurplusLinesBrokerModal,
        MultiplePropertyComponent,
        PropertyLimitComponent,
        InsuredAddressComponent,
        SurplusLineSelectorComponent,
        MultiplePropertyUploadModal,

        // Components
        ActivityListComponent,
        ActivitySelectorComponent,
        ActivitySearchComponent,
        CoverageComponent,
        CoverageOptionComponent,
        LimitComponent,
        ExcessComponent,
        FreeTextComponent,
        TextAreaComponent,
        IntegerComponent,
        RadioButtonComponent,
        ClientSanctionsCheckComponent,

        CheckBoxesComponent,
        DropDownComponent,
        DropDownWithValidationComponent,
        BusinessLine,
        CommissionPricing,
        SearchableDropdownComponent,
        DateQuestionComponent,
        BindQuoteBasicStepComponent,
        BindQuoteSubjectivitiesStepComponent,
        BindQuotePricingStepComponent,
        PreviewDocumentModalComponent,
        RetroDateComponent,
        QuotePricingGroupComponent,
        RiskCurrencyComponent,
        PercentageFieldComponent,
        QuoteSelectorComponent,
        QuoteSubjectivityComponent,
        QuoteSubjectivitiesListComponent,
        LocalBrokersComponent,
        DropzoneFileInputComponent,
        LocationValidationResultsComponent,
        CoverageMultipleLocationsUploadComponent,
        BlastZoneCheckComponent,
        PropertyLimitValuesComponent,

        // Pipes
        DocumentScopePipe,
        BlastZoneFloatingValuesComponent,
    ],
    providers: [
        ActivityService,
        CoverageService,
        CoverageItemService,
        RiskService,
        QuoteService,
        LanguageService,
        LanguageHttpService,
        RiskHttpService,
        CfcContactHttpService,
        ProductHttpService,
        QuoteSubjectivityService,
        BinderValidationService,
        EnquiryValidationService,
        DeactivateGuard,
        PreviewDocumentModalService,
        UnderwriterCoverageAuthorityService,
        UnderwriterDiscountAuthorityService,
        UnderwriterActivityValidationService,
        UnderwriterRiskValidationService,
        WarningService,
        ReferralService,
        FeeHttpService,
        RiskPanelFormBuilder,
        RiskQuestionValidationHandler,
        RiskPanelWarningsHandler,
        SurplusLinesLicenseHttpService,
        SurplusLinesLicenseService,
        ClientClearanceService,
        ClientClearanceHttpService,
        ClientLatestReferenceHttpService,
        ClientFolderService,
        UserAuthorityHttpService,
        BordereauHttpService,
        WordingVersionService,
        WordingVersionHttpService,
        CurrencyService,
        DatePipe,
        EnrichmentAdapterService,
        RiskQuestionAnswerPipe,
    ],
    imports: [SharedModule, CommonModule, AgmCoreModule, ErrorModule, QuoteRoutingModule, BasicInformationModule, FormCreatorModule, PdfViewerModule],
    exports: [
        BasicInformationStepComponent,
        RiskStepComponent,
        ActivitiesStepComponent,
        CoveragesStepComponent,
        SubjectivitiesStepComponent,
        SubjectivityConfigurationStepComponent,
        QuoteSubjectivityComponent,
        QuoteSubjectivitiesListComponent,
        EndorsementsStepComponent,
        QuoteComponent,
        QuoteSummaryPanelComponent,
        ClientAddressModal,
        ClientManageAddressModal,
        AddressMapViewModal,
        ProductSelectorModal,
        BrokerSelectorModalComponent,
        UnderwriterReferralSelectorModal,
        ActivityListComponent,
        ActivitySelectorComponent,
        ActivitySearchComponent,
        CoverageComponent,
        CoverageOptionComponent,
        LimitComponent,
        ExcessComponent,
        SendEmailModalComponent,
        UnderwriterNotesModal,
        BindQuoteModalComponent,
        PreviewDocumentModalComponent,
        DocumentScopePipe,
        PublishQuoteModalComponent,
        BespokeClauseModalComponent,
        QuoteAdditionalInsuredComponent,
        QuoteLossPayeeComponent,
        SurplusLinesBrokerModal
    ],
})
export class QuoteModule { }
