import { coerceBooleanProperty, coerceNumberProperty } from "@angular/cdk/coercion";
import { AfterViewChecked, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Constants } from "@app/constants/constants";
import { QuoteType } from "@app/constants/QuoteType";
import { EmailType } from "@app/enums/EmailType";
import { MessageCategory } from "@app/enums/MessageCategory";
import { MessageType } from "@app/enums/MessageType";
import { SanctionStage } from '@app/enums/SanctionStage';
import { isAustralia } from "@app/helpers";
import { sumFloatingValues } from '@app/helpers/limit-helper';
import { IsValid } from "@app/interfaces/IsValid";
import {
    BrokerGroup,
    CfcContact,
    Currency,
    DropDownItem,
    Email,
    InsuranceBasis,
    Quote,
    QuoteBindResponse,
    QuoteState,
    QuoteStep,
    RiskQuestionAnswer,
    SaveQuoteErrorCode,
    SaveQuoteResponse,
} from "@app/models";
import { CommissionRate } from "@app/models/auto-generated/CommissionRate";
import { QuoteData } from "@app/models/auto-generated/QuoteData";
import { BlastZoneReservationGetResponse } from '@app/models/blast-zone-get-response';
import { Message } from "@app/models/Message";
import { PropertyLimitBlastZoneCapacityRequest } from '@app/models/property-limit-blast-zone-capacity-request';
import { SearchSubjectivitiesResult } from "@app/models/subjectivity-configuration/SearchSubjectivitiesResult";
import { MtaTypeEnum } from "@app/policy/enums/MtaType";
import { MtaService } from "@app/policy/services/mta.service";
import { CheckClientSanctionsService } from "@app/quote/components/client-sanctions-check/check-client-sanctions.service";
import { Enquiry } from "@app/quote/models/enquiry/Enquiry";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { QuoteConfig } from "@app/quote/quote.config";
import { CurrencyService } from "@app/quote/services/currency.service";
import { EnquiryService } from "@app/quote/services/enquiry.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PricingService } from "@app/quote/services/pricing-service";
import { SubjectivityService } from "@app/quote/services/subjectivity/subjectivity.service";
import { WordingVersionHttpService } from "@app/quote/services/wording-version/wording-version-http-service";
import { SubjectivityConfigurationStepComponent } from "@app/quote/steps/subjectivity-configuration-step/subjectivity-configuration-step.component";
import { ButtonStatus } from "@app/quote/view-models/ButtonStatus";
import { IUnsavedChanges } from "@app/routeguards/deactivate-guard/IUnsavedChanges";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { BlastZoneHttpService } from '@app/services/blast-zone-http.service';
import { BrokerContactHttpService } from '@app/services/broker-contact-http-service';
import { ClientClearanceService } from "@app/services/client-clearance-service";
import { ConfigService } from "@app/services/config.service";
import { CoverageService } from '@app/services/coverage.service';
import { DropdownService } from "@app/services/dropdown.service";
import { EnquiryValidationService } from "@app/services/enquiry-validation.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { LoggingService } from "@app/services/logging.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { QuoteHttpService } from "@app/services/quote-http.service";
import { TaxHttpService } from "@app/services/tax-http.service";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserService } from "@app/services/user.service";
import { ConfirmationModalComponent } from "@app/shared/modals/confirmation-modal/confirmation-modal.component";
import { ConfirmationModalConfig } from "@app/shared/modals/confirmation-modal/confirmation-modal.config";
import { ToastrService } from "@app/shared/toastr/toastr.service";
import { Guid } from "guid-typescript";
import * as moment from 'moment';
import { BehaviorSubject, combineLatest, empty, forkJoin, Observable, of, ReplaySubject, Subject, throwError } from "rxjs";
import { catchError, first, flatMap, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { BasicInformationWrapperComponent } from "./basic-information/basic-information-wrapper/basic-information-wrapper.component";
import { CommissionInformation } from "./models/pricing/CommissionInformation";
import { BindQuoteModalComponent } from "./popups/bind-quote-modal/bind-quote-modal.component";
import { SendEmailModalComponent } from "./popups/send-email-modal/send-email-modal.component";
import { LanguageService } from "./services/language.service";
import { QuoteService } from "./services/quote.service";
import { ActivitiesStepComponent } from "./steps/activities-step/activities-step.component";
import { BaseStepComponent } from "./steps/base-step.component";
import { BasicInformationStepComponent } from "./steps/basic-information-step/basic-information-step.component";
import { CoveragesStepComponent } from "./steps/coverages-step/coverages-step.component";
import { EndorsementsStepComponent } from "./steps/endorsements-step/endorsements-step.component";
import { PropertyLimitsValidator } from "./steps/endorsements-step/modals/multiple-property/property-limit/property-limits-validator";
import { PricingStepComponent } from "./steps/pricing-step/pricing-step.component";
import { RiskStepComponent } from "./steps/risk-step/risk-step.component";
import { SubjectivitiesStepComponent } from "./steps/subjectivities-step/subjectivities-step.component";
import { ActionType } from "./view-models/ActionType";
import { PropertyLimitBlastZoneCapacityResponse } from "@app/models/property-limit-blast-zone-capacity-response";

@Component({
    selector: "quote-component",
    templateUrl: "quote.component.html",
    styleUrls: ["./quote.component.scss"],
})
export class QuoteComponent implements IUnsavedChanges, OnInit, IsValid, OnDestroy, AfterViewChecked {
    public isChanged = false;
    public recalculateTaxes = false;
    public vm: Quote;
    public originalQuote: Quote;
    public enquiry: Enquiry;
    public isInserted = false;
    public isPublishableQuote: boolean;
    public isPublishableWordingVersion: boolean;
    public hasActualGrossCommissionChange: boolean = false;
    public firstLossLimitValue: number = 0;

    public handleFirstLossData(data: number) {
        this.firstLossLimitValue = data;
    }

    public readonly stepBasicInfo: number = 1;
    public readonly stepCoverages: number = 2;
    public readonly stepActivities: number = 3;
    public readonly stepRisk: number = 4;
    public readonly stepSubjectivities: number = 5;
    public readonly stepEndorsements: number = 6;
    public readonly stepPricing: number = 7;
    public readonly stepSaveQuote: number = 8;

    public get canSave(): boolean {
        return this.visitableTabs[this.stepSaveQuote];
    }

    public set canSave(value: boolean) {
        this.visitableTabs[this.stepSaveQuote] = value;
    }

    public enableRecalculation(value: boolean) {
        this.hasActualGrossCommissionChange = value;
        this.canSave = false;
    }

    public get isStateFeatureEnabled(): boolean {
        return this._isStateFeatureEnabled;
    }

    public get isSubjectivityConfigurationFeatureEnabled(): boolean {
        return this.userService.isFeatureAccessible("useSubjectivityService");
    }

    public user: CfcContact;

    public isSaving = false;
    public currentStep = this.stepBasicInfo;
    public stepWarnings: { [key: number]: boolean };
    public isPricingValid = false;
    public isPricingStepFirstLoad = true;
    public buttonStatus = {
        canSaveAfterRecalculate: true,
        allowRecalculate: true,
    } as ButtonStatus;

    private _renewalsCoveragesMappingMessages: Message[] = [];
    private _renewalsRisksMappingMessages: Message[] = [];
    private _isStateFeatureEnabled = false;

    private readonly _stepChanged$ = new Subject<null>();
    private visitableTabs: boolean[] = new Array<boolean>(this.stepSaveQuote + 1);
    private initialisedTabs: boolean[] = new Array<boolean>(this.stepPricing + 1);
    private enquiryId: number;
    private enquiryUid: Guid;
    private quoteRef: number;
    private areRatingEngineErrors = false;
    private queryParametersSubscription;
    private parametersSubscription;
    private ratingEngineMessagesSubscription;
    private hasPricingStepBeenVisited = false;
    private errorLogSendQuote = "The email has been sent but it has not been possible to record this.";
    private readonly _destroyed$ = new ReplaySubject<void>(1);
    public isAgentic: boolean = false;
    private readonly agenticSource = "agentic";

    @ViewChild(BasicInformationStepComponent)
    public basicInformationStep: BasicInformationWrapperComponent;
    @ViewChild(BasicInformationWrapperComponent)
    public basicInformationStateEnabledStep: BasicInformationWrapperComponent;
    @ViewChild(RiskStepComponent) public riskStep: RiskStepComponent;
    @ViewChild(ActivitiesStepComponent)
    public activitiesStep: ActivitiesStepComponent;
    @ViewChild(CoveragesStepComponent)
    public coveragesStep: CoveragesStepComponent;
    @ViewChild(SubjectivitiesStepComponent)
    public subjectivitiesStep: SubjectivitiesStepComponent;
    @ViewChild(SubjectivityConfigurationStepComponent)
    public subjectivityConfigurationStep: SubjectivityConfigurationStepComponent;
    @ViewChild(EndorsementsStepComponent)
    public endorsementsStep: EndorsementsStepComponent;
    @ViewChild(PricingStepComponent) public pricingStep: PricingStepComponent;

    private _confirmationResult: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    @HostListener("window:beforeunload") public canDeactivate(): boolean {
        // Handles case when navigation is away from angular
        if (!this.navigationOverrideService.allowNavigation && this.hasUnsavedData()) {
            return confirm("");
        }

        this.navigationOverrideService.allowNavigation = false;
        return true;
    }

    showToast$: Observable<boolean> = this._toastrService.showToast$;

    constructor(
        public router: Router,
        public dialog: MatDialog,
        private readonly dropdownService: DropdownService,
        private quoteService: QuoteHttpService,
        private cdRef: ChangeDetectorRef,
        private enquiryService: EnquiryService,
        private taxHttpService: TaxHttpService,
        private premiumCalculationsService: PremiumCalculationsService,
        private route: ActivatedRoute,
        private modalDialogService: ModalDialogService,
        private userService: UserService,
        private binderValidationService: BinderValidationService,
        private messageErrorHandler: ErrorMessageHandlerService,
        private messageService: MessageService,
        private enquiryValidationService: EnquiryValidationService,
        private configService: ConfigService,
        private navigationOverrideService: NavigationOverrideService,
        private pricingService: PricingService,
        private underwriterDiscountService: UnderwriterDiscountAuthorityService,
        private underwriterActivityValidationService: UnderwriterActivityValidationService,
        private readonly underwriterRiskValidationService: UnderwriterRiskValidationService,
        private readonly coverageAuthorityService: UnderwriterCoverageAuthorityService,
        private readonly goodsAndServicesTaxService: GoodsAndServicesTaxService,
        private readonly wordingVersionService: WordingVersionHttpService,
        private readonly clientClearanceService: ClientClearanceService,
        private readonly quoteVMService: QuoteService,
        private readonly mtaService: MtaService,
        private readonly currencyService: CurrencyService,
        private readonly propertyLimitsValidator: PropertyLimitsValidator,
        private readonly checkClientSanctionsService: CheckClientSanctionsService,
        public subjectivityService: SubjectivityService,
        public languageService: LanguageService,
        private _toastrService: ToastrService,
        private _coverageService: CoverageService,
        private _blastZoneHttpService: BlastZoneHttpService,
        private readonly log: LoggingService,
        private _brokerService: BrokerContactHttpService
    ) {
        this.stepWarnings = {};
    }

    public get readOnly(): boolean {
        return this.vm && this.vm.state !== QuoteState.InProgress;
    }

    public ngAfterViewChecked() {
        this.cdRef.detectChanges();
    }

    public ngOnInit() {
        this.userService
            .getData()
            .pipe(first())
            .subscribe(
                (cfcContact) => {
                    this.user = cfcContact;
                    this.initializeQuotePage();
                },
                (error) => console.error(JSON.stringify(error))
            );
    }

    private initializeQuotePage() {
        this.parametersSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
            if (params.keys.length > 0) {
                this.quoteRef = coerceNumberProperty(params.get("quoteRef"), 0);
                const isNew = coerceBooleanProperty(params.get("isNew"));
                const step = coerceNumberProperty(params.get("step"), 0);
                this.setEnquiryIdentifier(params);
                this.initializePageData(this.quoteRef, isNew, step > 0 ? step : this.stepBasicInfo);
            }
        });

        this.queryParametersSubscription = this.route.queryParamMap.subscribe((params: ParamMap) => {
            if (params.keys.length > 0) {
                this._isStateFeatureEnabled = coerceBooleanProperty(params.get("isStateEnabled"));
                this.setEnquiryIdentifier(params);
                this.quoteRef = coerceNumberProperty(params.get("quoteRef"), 0);
                const newFromQuoteRef = coerceNumberProperty(params.get("newFromQuoteRef"), 0);
                if (newFromQuoteRef) {
                    this.quoteRef = newFromQuoteRef;
                }

                let source = params.get("source");
                if (source === this.agenticSource) this.isAgentic = true;
                else this.isAgentic = false;

                this.initializePageData(this.quoteRef, newFromQuoteRef > 0);
            } else if (!this.enquiryId && !this.enquiryUid && !this.quoteRef) {
                this.redirectToViewEnquiryLegacy();
            }
        });

        this.ratingEngineMessagesSubscription = this.messageService
            .getMessage(MessageCategory.RatingEngine)
            .subscribe((x) => (this.areRatingEngineErrors = x && x.type !== MessageType.Info));

        this._stepChanged$.subscribe(() => this.displayQuoteCreationMessages());

        // I know this is going to give us a redundant 0 item in the array but it is easier to match the ordinal position to the tab number
        this.initializeVisitableTabsConfiguration();

        for (let i = this.stepBasicInfo + 1; i < this.stepPricing; i++) {
            this.initialisedTabs[i] = false;
        }
    }

    private setEnquiryIdentifier(params: ParamMap) {
        if (this.userService.isFeatureAccessible("heroRedirectUsingEnquiryUid")) {
            if (params.has("enquiryId") && QuoteComponent.isValidGuid(params.get("enquiryId"))) {
                this.enquiryUid = Guid.parse(params.get("enquiryId"));
            } else {
                this.enquiryUid = undefined;
            }
        } else {
            this.enquiryId = coerceNumberProperty(params.get("enquiryId"), 0);
        }
    }

    private static isValidGuid(param: string): boolean {
        if (param.length > 0) {
            if (/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/.test(param)) {
                return true;
            }
        }

        return false;
    }

    public hasUnsavedData(): boolean {
        return this.vm && this.vm.state && this.vm.state === QuoteState.InProgress && (!this.vm.draftQuoteId || this.vm.draftQuoteId !== Constants.emptyGuid);
    }

    private initializeVisitableTabsConfiguration() {
        for (let i = this.stepBasicInfo + 1; i < this.stepPricing; i++) {
            this.visitableTabs[i] = false;
        }
        this.visitableTabs[this.stepBasicInfo] = true;
    }

    private initializePageData(quoteRef: number, isNew: boolean, goToStep: number = this.stepBasicInfo) {
        this.navigationOverrideService.allowNavigation = false;
        if (this.enquiryUid && this.userService.isFeatureAccessible("heroRedirectUsingEnquiryUid")) {
            this.loadEnquiryInfoByUid(this.enquiryUid, true);
            this.log.startCustomEvent("QuoteSaved");
        } else if (this.enquiryId) {
            this.loadDataFromEnquiryId(this.enquiryId);
            this.log.startCustomEvent("QuoteSaved");
        } else {
            if (quoteRef) {
                this.loadDataFromQuoteRef(quoteRef, isNew, goToStep);
            }
        }

        // no quote nor enquiry, redirect
        if (!this.enquiryId && !this.enquiryUid && !quoteRef) {
            this.redirectToViewEnquiryLegacy();
        }
    }

    private redirectToViewEnquiryLegacy() {
        window.location.href = this.configService.nerdUrl + "/viewenquiry.aspx";
    }

    private loadDataFromQuoteRef(quoteRef: number, newFromRef: boolean = false, goToStep: number = this.stepBasicInfo) {
        this.quoteService
            .LoadFromQuoteRef(quoteRef)
            .pipe(
                switchMap((quote: Quote) => {
                    if (quote.propertyLimits && quote.propertyLimits.length > 0) {
                        quote.blastZoneReferenceId = quote.propertyLimits[0].blastZoneReservationId;
                    }
                    return this._brokerService.getBrokerGroup(quote.brokerTeam?.broker?.brokerGroupId).pipe(
                        map((brokerGroup: BrokerGroup) => {
                            quote.brokerGroup = brokerGroup;
                            return quote;
                        }),
                        catchError((err) => {
                            console.error('Error occurred:', err.message);
                            return of(quote);
                        })
                    );
                }),
                switchMap((quote: Quote) => {
                    if (this.userService.isFeatureAccessible("multipleProperties") && quote.blastZoneReferenceId && quote.blastZoneReferenceId.length > 0) {
                        return this._blastZoneHttpService.getBlastZoneDetails(quote.blastZoneReferenceId).pipe(
                            map((blastZoneDetails: BlastZoneReservationGetResponse) => {
                                if (blastZoneDetails && blastZoneDetails.Reservations?.length > 0) {
                                    quote.hasBlastZoneReservation = true;
                                    this.quoteVMService.setHasBlastZoneCapacity(true);
                                } else {
                                    this.messageService.sendMessage(new Message("The Blast Zone reservation associated with this quote has unreserved!", MessageType.Error, [])
                                        , MessageCategory.Default);
                                }
                                return quote;
                            }),
                            catchError((err) => {
                                console.error('Error occurred:', err.message);
                                return of(quote);
                            })
                        );
                    }
                    return of(quote);
                }),
                first()
            )
            .subscribe(
                (quote) => {
                    this.userService.cfcTeamCoverholder.next(quote.assignedContact?.cfcTeamCoverholder)
                    this.setupWizardStateForQuoteData(quote, newFromRef, goToStep);
                    if (quote.state != QuoteState.Bound) {
                        this.log.startCustomEvent("QuoteBound");
                    }
                },
                (error) => console.error(JSON.stringify(error)),
                () => this.afterLoadVm()
            );
    }

    private setupWizardStateForQuoteData(quote: Quote, newFromRef: boolean, goToStep: number) {
        if (newFromRef) {
            // If there is a policy number it has been bound from another session so we don't want to reset
            if (quote.policyNumber) {
                newFromRef = false;
            } else {
                this.resetDataForNewQuote(quote);
            }
        }
        if (!quote.insuranceType) {
            this.setInsuranceType(quote.insuranceTypeId);
        }

        if ((this.isSubjectivityConfigurationFeatureEnabled && newFromRef) || (this.isSubjectivityConfigurationFeatureEnabled && this.quoteRef)) {
            this.setRemovedAutoAttachedSubjectivities(quote);
        }

        if (quote.riskQuestionAnswers) {
            quote.riskQuestionAnswers = this.setRiskQuestionAnswers(quote.riskQuestionAnswers);
        }

        this.loadVm(quote);

        if (newFromRef || goToStep > this.stepBasicInfo) {
            this.saveDraft(() => {
                this.currentStep = goToStep;
                this.setStep(goToStep);
                this.setStepAsReadOnly();
            });
        } else {
            this.setStepAsReadOnly();
        }

        this.makeAllTabsVisitable();

        if (newFromRef) {
            this.hasPricingStepBeenVisited = true;
            this.canSave = false;
        }

        this.premiumCalculationsService.updatePremium();
    }

    private resetDataForNewQuote(quote: Quote) {
        quote.state = QuoteState.InProgress;
        quote.quoteReference = 0;
        quote.origin = "HERO";

        if (quote) {
            // When creating a new quote from an existing one we need to reset the rating engine id
            // to ensure that the latest rating engine version is taken into consideration
            this.resetRatingEngineVersion(quote);

            quote.quoteDate = new Date();

            // if (quote.commissionInformation) {
            // TODO: why is it clearing when we should prevent it from being cleared when copying a quote or updating an existing one?
            // remove this line when and comment when all pricing and recalculation fixes are done
            // quote.commissionInformation.fee = 0;
            // }

            this.premiumCalculationsService.updatePremium();

            // reset quote published status
            quote.isPublished = false;
        }

        if (this.userService.isFeatureAccessible("heroRedirectUsingEnquiryUid")) {
            this.enquiryUid = Guid.parse(quote.enquiryUid);
            this.loadEnquiryInfoByUid(this.enquiryUid, false);
        } else {
            this.enquiryId = quote.enquiryId;
            this.loadEnquiryInfoById(this.enquiryId);
        }

        for (let i = this.stepBasicInfo + 1; i <= this.stepPricing; i++) {
            this.visitableTabs[i] = true;
            this.initialisedTabs[i] = true;
        }

        this.canSave = false;
        this.hasPricingStepBeenVisited = true;
    }

    private resetRatingEngineVersion(quote: Quote) {
        quote.pricingInformation.map((businessLine) => (businessLine.ratingEngineVersionId = 0));
        quote.needsPricingRecalculation = true;
    }

    private loadEnquiryInfoById(enquiryID: number) {
        this.enquiryService.getEnquiryById(enquiryID).subscribe(
            (enquiry: Enquiry) => {
                if (enquiry) {
                    if (!this.enquiryValidationService.ValidateHeroEnquiry(enquiry)) {
                        window.location.href = this.configService.nerdUrl + "/newenquiry.aspx?EnquiryID=" + enquiryID;
                    }

                    this.enquiry = enquiry;
                }
            },
            (error) => console.error(JSON.stringify(error))
        );
    }

    private loadDataFromEnquiryId(enquiryId: number) {
        this.loadEnquiryInfoById(enquiryId);
        this.loadInitialQuoteData(enquiryId);
    }

    private loadEnquiryInfoByUid(enquiryUid: Guid, isNewQuote: boolean) {
        this.enquiryService.getEnquiryByUid(enquiryUid).subscribe(
            (enquiry: Enquiry) => {
                this.enquiry = enquiry;

                if (isNewQuote) {
                    this.loadInitialQuoteData(this.enquiry.enquiryReference);
                }
            },
            (error) => {
                console.error(JSON.stringify(error));
                if (error && error["status"] && error["status"] === 404) {
                    this.redirectToViewEnquiryLegacy();
                }
            }
        );
    }

    private loadInitialQuoteData(enquiryId: number) {
        const quote$ = this.quoteService.getRenewalQuoteData(enquiryId).pipe(
            switchMap((quoteData: QuoteData) => {
                this.userService.cfcTeamCoverholder.next(quoteData.quote?.assignedContact?.cfcTeamCoverholder)
                return this._brokerService.getBrokerGroup(quoteData.quote.brokerTeam?.broker?.brokerGroupId).pipe(
                    map((brokerGroup: BrokerGroup) => {
                        quoteData.quote.brokerGroup = brokerGroup;
                        return quoteData;
                    }),
                    catchError((err) => {
                        console.error('Error occurred:', err.message);
                        return of(quoteData);
                    })
                );
            }),
            first()
        );

        let currency$: Observable<Currency | any> = this.GetCurrencyFromEnquiry();

        combineLatest([quote$, currency$])
            .pipe(
                map(([quote, currency]) => QuoteComponent.MapEnquiryCurrencyToQuote(quote, currency))
            )
            .subscribe(
                (quoteData) => {
                    this.populateQuoteCreationDisplayMessages(quoteData);
                    this.loadVm(quoteData.quote);
                },
                (error) => console.error(JSON.stringify(error)),
                () => this.afterLoadVm()
            );
    }

    private static MapEnquiryCurrencyToQuote(quoteData: QuoteData, enquiryCurrency: Currency) {
        if (enquiryCurrency) {
            quoteData.quote.currency = enquiryCurrency;
        }
        return quoteData;
    }

    private GetCurrencyFromEnquiry() {
        let doesCurrencyExistOnEnquiry = this.enquiry && this.enquiry.riskData["currencyIsoCode"];
        if (!this.userService.isFeatureAccessible("useEnquiryCurrencyToQuote") || !doesCurrencyExistOnEnquiry) {
            return of(null);
        }
        return this.currencyService.getCurrencyByIsoCode(this.enquiry.riskData["currencyIsoCode"]);
    }

    private populateQuoteCreationDisplayMessages(quoteData: QuoteData) {
        this.populateQuoteCreationCoveragesDisplayMessages(quoteData);
        this.populateQuoteCreationRisksDisplayMessages(quoteData);
    }

    private populateQuoteCreationCoveragesDisplayMessages(quoteData: QuoteData) {
        if (!Array.isArray(quoteData.messages) || !quoteData.messages || quoteData.messages.length === 0) {
            return;
        }
        this._renewalsCoveragesMappingMessages = [];

        if (quoteData.messages.some(((message) => message.quoteStep === QuoteStep.Coverages) as any)) {
            const coveragesMessages = quoteData.messages.filter((message) => message.quoteStep === QuoteStep.Coverages);
            coveragesMessages.forEach((message) => {
                if (this._renewalsCoveragesMappingMessages.length === 0) {
                    this._renewalsCoveragesMappingMessages.push(new Message(message.description, MessageType.Warning, []));
                } else {
                    this._renewalsCoveragesMappingMessages[0].messageList.push(message.description);
                }
            });
        }
    }

    private populateQuoteCreationRisksDisplayMessages(quoteData: QuoteData) {
        if (!Array.isArray(quoteData.messages) || !quoteData.messages || quoteData.messages.length === 0) {
            return;
        }
        this._renewalsRisksMappingMessages = [];

        if (quoteData.messages.some(((message) => message.quoteStep === QuoteStep.Risk) as any)) {
            const risksMessages = quoteData.messages.filter((message) => message.quoteStep === QuoteStep.Risk);
            risksMessages.forEach((message) => {
                if (this._renewalsRisksMappingMessages.length === 0) {
                    this._renewalsRisksMappingMessages.push(new Message(message.description, MessageType.Warning, []));
                } else {
                    this._renewalsRisksMappingMessages[0].messageList.push(message.description);
                }
            });
        }
    }

    // private method, responsible for triggering the displaying for the various Quote Creation Messages
    // "Risks" Quote Creation Messages are implemented but kept "invisible" to the UI as per stakeholders' ask
    // PBI #41020
    private displayQuoteCreationMessages(): void {
        this.displayQuoteCreationCoverageMessages();
        //this.displayQuoteCreationRisksMessages();
    }

    private displayQuoteCreationCoverageMessages(): void {
        if (this.currentStep === this.stepCoverages) {
            if (
                Array.isArray(this._renewalsCoveragesMappingMessages) &&
                this._renewalsCoveragesMappingMessages &&
                this._renewalsCoveragesMappingMessages.length > 0
            ) {
                this.messageService.sendMessage(this._renewalsCoveragesMappingMessages[0], MessageCategory.RenewalsCoverages);
            }
        } else {
            this.messageService.clearMessage(MessageCategory.RenewalsCoverages);
        }
    }

    private displayQuoteCreationRisksMessages(): void {
        if (this.currentStep === this.stepRisk) {
            if (Array.isArray(this._renewalsRisksMappingMessages) && this._renewalsRisksMappingMessages && this._renewalsRisksMappingMessages.length > 0) {
                this.messageService.sendMessage(this._renewalsRisksMappingMessages[0], MessageCategory.RenewalsRisks);
            }
        } else {
            this.messageService.clearMessage(MessageCategory.RenewalsRisks);
        }
    }

    private loadVm(quote: Quote) {
        this.vm = quote;
        this.originalQuote = Object.assign({}, quote);

        // the line below is part of a new code that will save both the original quote object and the quote reference object
        // this will allow new code to rely on the quote service to get/set the quote object to avoid sending it around
        // it's a initial change to allow us to easier migrate to ngrx in the future
        // the old logic is still in place to ensure we don't break anything until everything has been moved to the new logic
        this.quoteVMService.updateQuote(this.vm, true);

        if (!this.vm.state) {
            this.vm.state = QuoteState.InProgress;
        }
        this.coverageAuthorityService.setQuote(this.vm);
        this.vm.createdByUnderwriter = this.userService.getInitials();

        this.setIsPublishableQuote(this.vm.quoteReference);
        this.setIsPublishableWordingVersion(this.vm.wordingVersionId);
    }

    private afterLoadVm() {
        if (this.vm.taxRate === 0) {
            this.recalculateTaxes = true;
        }
        this.setStepWarnings();

        // the code below has been moved to the quote summary component, removed from here once the feacture is active
        if (!this.userService.isFeatureAccessible("heroNewZealandGst")) {
            if (this.vm && isAustralia(this.vm.insuredLocation)) {
                this.goodsAndServicesTaxService
                    .updateGSTRate(this.vm.inceptionDate)
                    .pipe(first())
                    .subscribe(() => this.premiumCalculationsService.updatePremium());
            }
        }

        if (!this.vm.insuranceType) {
            this.setInsuranceType(this.vm.insuranceTypeId);
        }

        if (this.isAgentic === true && this.vm?.state > QuoteState.InProgress && this.vm?.state < QuoteState.Bound) {
            this.allowUpdate();
            this.messageService.sendMessage(
                new Message(
                    "The following quote was created by CFC's Underwriting Agent. Please review before proceeding.",
                    MessageType.Warning
                ),
                MessageCategory.AgenticQuote
            );
        }
    }

    private setInsuranceType(insuranceTypeId: number) {
        this.dropdownService.getInsuranceTypes().subscribe((val) => {
            const insuranceType = val.find((i) => i.value === insuranceTypeId);
            this.vm.insuranceType = insuranceType.text;
        });
    }

    private setStepAsReadOnly(): void {
        const step = this.getCurrentStepComponent();
        if (step) {
            step.readonly = this.readOnly;
        }
    }

    public ngOnDestroy(): void {
        this.parametersSubscription.unsubscribe();
        this.queryParametersSubscription.unsubscribe();
        this.ratingEngineMessagesSubscription.unsubscribe();
        this._stepChanged$.unsubscribe();
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public handleStepDataChange(step: number, canSave: ButtonStatus): void {
        if (this.currentStep === this.stepPricing) {
            this.buttonStatus = {
                canSaveAfterRecalculate: true,
                allowRecalculate: true,
            };
            return;
        }

        this.messageService.clearMessage();

        if (this.vm.pricingInformation === null) {
            this.vm.pricingInformation = [];
        }

        if (canSave) {
            this.buttonStatus.canSaveAfterRecalculate = this.buttonStatus.canSaveAfterRecalculate
                ? canSave.canSaveAfterRecalculate
                : this.buttonStatus.canSaveAfterRecalculate;

            this.buttonStatus.allowRecalculate = this.buttonStatus.allowRecalculate ? canSave.allowRecalculate : this.buttonStatus.allowRecalculate;

            if (!this.buttonStatus.allowRecalculate) {
                this.vm.pricingInformation = [];
            }
        }

        if (this.vm.pricingInformation && this.vm.pricingInformation.length > 0) {
            this.vm.needsPricingRecalculation = true;
            this.isPricingValid = true;
        }

        this.visitableTabs.forEach((x, i, arr) => {
            if (i > step) {
                arr[i] = false;
            }
        });

        this.initialisedTabs.forEach((x, i, arr) => {
            if (i > step) {
                arr[i] = false;
            }
        });

        if (step === this.stepCoverages && !this.vm.isApproved) {
            this.messageService.clearMessage();
        }
    }

    public setVisitable(step: number, isValid: boolean): void {
        this.visitableTabs[step] = isValid;

        if (step === this.stepSaveQuote) {
            this.isPricingValid = isValid;
        }

        if (!isValid) {
            this.visitableTabs.forEach((x, i, arr) => {
                if (i > step) {
                    arr[i] = false;
                }
            });
        }
    }

    public setInitialised(step: number): void {
        this.initialisedTabs[step] = true;
    }

    public hasBeenInitialised(step: number): boolean {
        if (step < 0) {
            return true;
        }

        return this.initialisedTabs[step];
    }

    public getVisitable(step: number): boolean {
        return this.visitableTabs[step];
    }

    public setStep(stepNumber: number) {
        if (!this.canGoToStep(stepNumber)) {
            this.markCurrentStepAsTouched();
            return;
        }

        if (this.vm.state === QuoteState.InProgress) {
            this.saveDraft(() => this.setCurrentStep(stepNumber));
        } else {
            this.setCurrentStep(stepNumber);
        }
    }

    private setCurrentStep(stepNumber: number) {
        this.currentStep = stepNumber;
        if (stepNumber === this.stepPricing) {
            this.hasPricingStepBeenVisited = true;
        }
        this._stepChanged$.next();
    }

    private markCurrentStepAsTouched() {
        const currentComponent = this.getCurrentStepComponent();
        if (currentComponent) {
            currentComponent.markAsTouched();
        }
    }

    public disabled(stepNumber: number): boolean {
        return this.canGoToStep(stepNumber) || stepNumber === this.currentStep + 1 || this.visitableTabs[stepNumber];
    }

    public canGoToStep(stepNumber: number): boolean {
        if (stepNumber >= this.stepSaveQuote) {
            return false;
        }

        const currentComponent = this.getCurrentStepComponent();

        if (stepNumber > this.currentStep && (!currentComponent || !currentComponent.isValid())) {
            return false;
        }

        if (stepNumber === this.currentStep + 1) {
            return true;
        }

        return this.visitableTabs[stepNumber];
    }

    public isFirstStep() {
        return this.currentStep === this.stepBasicInfo;
    }

    public isLastStep() {
        return this.currentStep === this.stepPricing;
    }

    public isCurrentStepLoading() {
        const component = this.getCurrentStepComponent();
        return component ? !component.isLoaded() : false;
    }

    public nextStep() {
        if (!this.isLastStep()) {
            this.setStep(this.currentStep + 1);
        }
    }

    public previousStep() {
        if (this.currentStep > 1) {
            this.setStep(this.currentStep - 1);
        }
    }

    public sendQuote() {
        this.modalDialogService.openDialog<SendEmailModalComponent, Email>(
            SendEmailModalComponent,
            ModalConfig.sendQuoteModal.matDialogConfig,
            (obj: SendEmailModalComponent) => {
                obj.title = "Send Quote";
                obj.brokerTeamId = this.vm.brokerTeam.id;
                obj.user = this.user;
                obj.quote = this.vm;
                obj.emailType = this.vm.product.isAdmitted ? EmailType.sendAdmittedQuote : EmailType.sendQuote;
            },
            (email: Email) => this.handleSendEmailOnClose(email)
        );
    }

    public sendPolicy() {
        this.modalDialogService.openDialog<SendEmailModalComponent, Email>(
            SendEmailModalComponent,
            ModalConfig.sendQuoteModal.matDialogConfig,
            (obj: SendEmailModalComponent) => {
                obj.title = "Send Policy";
                obj.brokerTeamId = this.vm.brokerTeam.id;
                obj.user = this.user;
                obj.quote = this.vm;
                obj.emailType = EmailType.sendPolicy;
                obj.policyNumber = String(this.vm.policyNumber);
            },
            null
        );
    }

    public handleSendEmailOnClose(email: Email) {
        if (
            email &&
            email.isSent &&
            (email.emailType === EmailType.sendQuote || email.emailType === EmailType.sendEuQuote || email.emailType === EmailType.sendAdmittedQuote)
        ) {
            const quoteIds = email.mergeFields["QuoteReferences"].split(";").map((quoteReference) => +quoteReference);
            this.confirmQuoteSent(quoteIds);
        }
    }

    private handleQuoteSaveResponse(quoteResponse: SaveQuoteResponse) {
        if (quoteResponse.quoteId !== 0) {
            this.vm.quoteReference = quoteResponse.quoteId;
        }
        this.vm.state = quoteResponse.state;
        let properties = {
            "x-is-successful": "true"
        };

        if (quoteResponse.error.message) {
            if (quoteResponse.error.code) {
                this.vm.error = quoteResponse.error;
                this.messageErrorHandler.handleError(QuoteConfig.SaveQuoteErrorMessages[quoteResponse.error.code]);
                this.deleteBlastZoneReservationWhenSaveQuoteFails();
            }

            properties["x-is-successful"] = "false";
            console.error(quoteResponse.error.message);
        } else {
            // Check if quote can be published
            this.setIsPublishableQuote(quoteResponse.quoteId);
            this.setIsPublishableWordingVersion(this.vm.wordingVersionId);

            this.navigationOverrideService.allowNavigation = true;
            this.router.navigate(["quote"], {
                queryParams: { quoteRef: this.vm.quoteReference },
            });
        }
        this.log.stopCustomEvent("QuoteSaved", properties, this.vm);
    }

    private checkClientSanctions$(sanctionStage: SanctionStage, onGoingScreening?: boolean): Observable<boolean | any> {
        if (!!this.vm.client.companyName && !!this.vm.client.primaryLocation?.country?.isoCode && !!this.vm.client.id && !!this.vm.client.uid) {
            return this.checkClientSanctionsService.checkClientSanctions(
                this.vm.client.companyName,
                this.vm.client.uid,
                this.vm.client.id,
                this.vm.client.primaryLocation.country.isoCode,
                sanctionStage,
                true,
                onGoingScreening
            );
        }
        return of(false);
    }

    public insert() {
        if (this.isValid()) {
            if (this.userService.isFeatureAccessible("heroClientSanctionsCheckTrigger")) {
                this.checkClientSanctions$(SanctionStage.PreQuote)
                    .pipe(
                        takeUntil(this._destroyed$),
                        tap((hasSanction) => {
                            if (hasSanction) {
                                this.confirmSanction(ActionType.Insert);
                            } else {
                                this.saveQuote();
                            }
                        })
                    )
                    .subscribe();
            } else {
                this.saveQuote();
            }
        } else {
            this.getCurrentStepComponent().markAsTouched();
        }
    }

    private confirmWordingVersion() {
        this.modalDialogService.openDialog<ConfirmationModalComponent, string>(
            ConfirmationModalComponent,
            ConfirmationModalConfig.dialog.matDialogConfig,
            (modalConfig) => {
                const confirmationModalModel = {
                    title: "Updated wording",
                    question: `The quote you are about to bind no longer has the latest wording as there is now an updated
                               wording in place.`,
                    confirmationButtonLabel: "Continue",
                };
                modalConfig.dialogModel = confirmationModalModel;
            },
            (result) => {
                this.openBindDialog();
            }
        );
    }

    private confirmSanction(actionType: ActionType) {
        this.modalDialogService.openDialog<ConfirmationModalComponent, string>(
            ConfirmationModalComponent,
            ConfirmationModalConfig.dialog.matDialogConfig,
            (modalConfig) => {
                const confirmationModalModel = {
                    title: "Confirmation required",
                    question: `Are you sure you want to proceed? This client has been flagged by sanctions checking.`,
                    confirmationButtonLabel: "Yes",
                    cancellationButtonLabel: "No",
                };
                modalConfig.dialogModel = confirmationModalModel;
            },
            (result) => {
                if (result === "confirm-button") {
                    if (actionType === ActionType.Insert) this.saveQuote();
                    else if (actionType === ActionType.Bind) this.checkBindModal();
                }
            }
        );
    }

    private saveQuote() {
        this.isSaving = true;
        this.vm.isApproved = this.isQuoteApproved();
        if (this.vm.insuredLocation)
            this.vm.insuredLocation.stateProvinceCode = this.vm.insuredLocation.stateProvinceCode ?? this.vm.client?.primaryLocation?.stateProvinceCode;
        if (this.quoteVMService.hasQuoteLocationPremiums()) {
            this.quoteVMService.applyModelDiscountToLocationPremiums();
        }
        this.messageService.clearMessage(MessageCategory.ClientClearance);
        this.messageService.clearMessage();
        this.saveDraft(() => {
            this.checkBlastZoneCapacity().then((isBlastZoneCapacityAvailable) => {
                if (isBlastZoneCapacityAvailable) {
                    this.quoteService
                        .insertQuote(this.vm)
                        .pipe(first())
                        .subscribe(
                            (quoteReference) => this.handleQuoteSaveResponse(quoteReference),
                            (error) => {
                                this.vm.state = QuoteState.InProgress;
                                console.error(error);
                                this.messageErrorHandler.handleError(QuoteConfig.SaveQuoteErrorMessages[SaveQuoteErrorCode.SaveQuoteToDatabase]);
                                this.isSaving = false;
                            },
                            () => {
                                this.isSaving = false;
                                this.setStepAsReadOnly();
                            }
                        );
                } else {
                    this.vm.state = QuoteState.InProgress;
                    this.isSaving = false;
                    this.messageService.sendMessage(
                        new Message("Blast Zone Capacity is not available in one or more locations!", MessageType.Error),
                        MessageCategory.Default
                    );
                }
            });
        });
    }

    private deleteBlastZoneReservationWhenSaveQuoteFails() {
        // if it is not an update quote operation and there are multiple properties business lines
        // then delete the blast zone reservation created for this quote as the quote save operation failed
        const isMultiplePropertiesBusinessLine = this._coverageService.getMultiplePropertiesBusinessLine()?.length > 0;
        if (isMultiplePropertiesBusinessLine && !(this.vm.quoteReference && this.vm.quoteReference > 0)) {
            const blastZoneReferenceId = this.vm.propertyLimits && this.vm.propertyLimits.length > 0 ? this.vm.propertyLimits[0].blastZoneReservationId : null;
            if (blastZoneReferenceId && blastZoneReferenceId.length > 0) {
                this._blastZoneHttpService.deleteBlastZoneReservation(blastZoneReferenceId).pipe(
                    takeUntil(this._destroyed$),
                    tap(() => {
                        this.quoteVMService.setHasBlastZoneCapacity(false);
                    })
                ).subscribe();
            }
        }
    }

    private async checkBlastZoneCapacity(): Promise<boolean> {
        const isMultiplePropertiesBusinessLine = this._coverageService.getMultiplePropertiesBusinessLine()?.length > 0;
        if (this.userService.isFeatureAccessible("multipleProperties") && isMultiplePropertiesBusinessLine) {
            const firstLostLimit = this.firstLossLimitValue;
            const terrorismBinderSectionId = this.binderValidationService.getTerrorismBinderSectionId();

            const propertyLimitBlastZoneRequest: PropertyLimitBlastZoneCapacityRequest =
            {
                propertyLimits: this.vm.propertyLimits,
                inceptionDate: this.vm.inceptionDate,
                expiryDate: this.vm.expiryDate,
                clientId: this.vm.client.uid,
                firstLossLimitValue: firstLostLimit,
                floatingValue: sumFloatingValues(this.vm.propertyLimitFloatingValues),
                reservationExpiryDate: moment(this.vm.inceptionDate).add(60, 'days').toDate(),
                binderSectionId: terrorismBinderSectionId,
                quoteCurrencyIsoCode: this.vm?.currency?.isoCode,
            };

            let blastZoneResponse: PropertyLimitBlastZoneCapacityResponse | null;

            // update quote
            if (this.vm.quoteReference && this.vm.quoteReference > 0 && this.vm.hasBlastZoneReservation === true) {
                // check if update operation replaces the location sheet values
                if (propertyLimitBlastZoneRequest.propertyLimits && propertyLimitBlastZoneRequest.propertyLimits.length > 0 &&
                    !propertyLimitBlastZoneRequest.propertyLimits[0].blastZoneReservationId) {

                    propertyLimitBlastZoneRequest.propertyLimits[0].blastZoneReservationId = this.vm.blastZoneReferenceId;
                    this.vm.propertyLimits.forEach((pl) => {
                        pl.blastZoneReservationId = this.vm.blastZoneReferenceId;
                    });
                }

                blastZoneResponse = await this._blastZoneHttpService.updateBlastZoneReservation(propertyLimitBlastZoneRequest).toPromise();

                if (blastZoneResponse?.propertyLimits)
                    this.vm.propertyLimits = [...blastZoneResponse?.propertyLimits];
            }
            else {
                blastZoneResponse = await this._blastZoneHttpService.createBlastZoneReservation(propertyLimitBlastZoneRequest).toPromise();
                this.vm.propertyLimits = [...blastZoneResponse.propertyLimits];
            }

            await this.quoteService.saveDraft(this.vm).toPromise();

            return blastZoneResponse?.blastZoneCheckResult ?? false;
        }

        return true;
    }

    private setIsPublishableQuote(quoteReference: number) {
        if (quoteReference) {
            this.quoteService
                .isPublishableQuote(quoteReference)
                .pipe(first())
                .subscribe((isPublishable) => (this.isPublishableQuote = isPublishable));
        }
    }

    private setIsPublishableWordingVersion(wordingVersionId: number) {
        if (wordingVersionId) {
            this.wordingVersionService
                .isPublishableWordingVersion(wordingVersionId)
                .pipe(first())
                .subscribe((isPublishable) => (this.isPublishableWordingVersion = isPublishable));
        }
    }

    public async bindQuote() {
        this.messageService.clearMessage();
        if (this.vm.state >= QuoteState.Create) {
            if (this.userService.isFeatureAccessible("heroClientSanctionsCheckTrigger")) {
                this.checkClientSanctions$(SanctionStage.PreBind, true)
                    .pipe(
                        takeUntil(this._destroyed$),
                        tap((hasSanction) => {
                            if (hasSanction) {
                                this.confirmSanction(ActionType.Bind);
                            } else {
                                this.checkBindModal();
                            }
                        })
                    )
                    .subscribe();
            } else {
                this.checkBindModal();
            }
        } else {
            this.getCurrentStepComponent().markAsTouched();
        }
    }

    public async checkBindModal() {
        const wordingVersions: DropDownItem[] | any = await this.checkWordings().pipe(takeUntil(this._destroyed$)).toPromise();
        if (this.checkMaxWordingVersionIsNotSelected(wordingVersions) === true) {
            this.confirmWordingVersion();
        } else {
            this.openBindDialog();
        }
    }

    public async unreserveCapacity() {
        this.modalDialogService.openDialog<ConfirmationModalComponent, string>(
            ConfirmationModalComponent,
            ConfirmationModalConfig.dialog.matDialogConfig,
            (modalConfig) => {
                const confirmationModalModel = {
                    title: "Unreserve Capacity",
                    question: `The blast zone reservations will be deleted for this quote. Are you sure you want to continue?`,
                    confirmationButtonLabel: "Continue",
                };
                modalConfig.dialogModel = confirmationModalModel;
            },
            (result) => {
                if (result === "confirm-button") {
                    this._blastZoneHttpService.deleteBlastZoneReservation(this.vm.blastZoneReferenceId).pipe(
                        takeUntil(this._destroyed$),
                        tap(() => {
                            this.quoteVMService.setHasBlastZoneCapacity(false);
                            this.messageService.sendMessage(
                                new Message(`The blast zone reservations have been successfully deleted for this quote.`, MessageType.Success)
                                , MessageCategory.Default
                            );
                        })
                    ).subscribe();
                }
            }
        );
    }

    openBindDialog() {
        this.modalDialogService.openDialog<BindQuoteModalComponent, QuoteBindResponse>(
            BindQuoteModalComponent,
            ModalConfig.bindQuoteModal.matDialogConfig,
            (obj) => (obj.quote = this.vm),
            (result) => {
                let properties = {
                    "x-is-successful": "true",
                    "x-is-augmented": "false"
                };
                if (result) {
                    if (result.bindError) {
                        console.error(result.bindError.errorMessage);
                        properties["x-is-successful"] = "false";
                        this.messageErrorHandler.handleError(QuoteConfig.BindQuoteErrorMessages[result.bindError.errorCode]);
                    } else {
                        this.vm.policyNumber = result.policyNumber;
                        this.vm.state = QuoteState.Bound;
                    }
                }
                this.log.stopCustomEvent("QuoteBound", properties, this.vm);
            }
        );
    }

    private checkWordings(): Observable<DropDownItem[] | any> {
        const languageCode = this.languageService.getLanguageById(this.vm.languageId) ? this.languageService.getLanguageById(this.vm.languageId).isoCode : null;
        if (this.vm.insuranceBasis == InsuranceBasis.Excess) {
            return this.wordingVersionService.getExcessWordingVersions(this.vm.product.productName, this.userService.countryIsoCode, languageCode);
        } else {
            return this.wordingVersionService.getWordingVersions(this.vm.product.productName, this.userService.countryIsoCode, languageCode);
        }
    }

    public checkMaxWordingVersionIsNotSelected(wordingVersions: DropDownItem[] | any): boolean {
        const maxWordingId = Math.max(...wordingVersions.map((i) => Number(i.value)));
        if (this.vm.insuranceBasis == InsuranceBasis.Excess) {
            return maxWordingId > this.vm.excessWordingVersionId ? true : false;
        } else {
            return maxWordingId > this.vm.wordingVersionId ? true : false;
        }
    }

    // TODO: it's not 'allowing' update, it's `startQuoteUpdateFlow()` or something like that
    public allowUpdate() {
        this.vm.state = QuoteState.InProgress;

        if (this.userService.isFeatureAccessible("heroRedirectUsingEnquiryUid")) {
            this.enquiryUid = Guid.parse(this.vm.enquiryUid);
            this.loadEnquiryInfoByUid(this.enquiryUid, false);
        } else {
            this.enquiryId = this.vm.enquiryId;
            this.loadEnquiryInfoById(this.enquiryId);
        }

        for (let i = this.stepBasicInfo + 1; i <= this.stepPricing; i++) {
            this.visitableTabs[i] = true;
            this.initialisedTabs[i] = true;
        }

        this.canSave = false;

        const currentStepComponent = this.getCurrentStepComponent();

        if (this.currentStep === this.stepBasicInfo && this.isStateFeatureEnabled) {
            const basicInfoStepComponent = currentStepComponent as BasicInformationWrapperComponent;
            basicInfoStepComponent.triggerUpdateQuote();
        }

        if (this.currentStep === this.stepSubjectivities) {
            if (this.isSubjectivityConfigurationFeatureEnabled) {
                const subjStep = currentStepComponent as SubjectivityConfigurationStepComponent;
                subjStep.getMainSubjectivitiesData();
            } else {
                const subjStep = currentStepComponent as SubjectivitiesStepComponent;
                subjStep.getMainSubjectivitiesData();
            }
        }

        // will not have a draft quote id if loaded from DB so need to save to
        // Redis so CoreApi can use it from there, even if it has not changed
        if (this.vm.draftQuoteId === Constants.emptyGuid) {
            this.saveDraft(() => { });
        }

        // the quote data loaded right now comes from a saved quote but we need
        // to ensure updated quotes are done using the latest rating engine version
        this.resetRatingEngineVersion(this.vm);
    }

    public isValid() {
        if (this.getCurrentStepComponent()) {
            if (!this.getCurrentStepComponent().isValid()) {
                return false;
            }

            if (this.currentStep === this.stepPricing) {
                return true;
            }

            if (this.canSave) {
                return true;
            }
        }

        return false;
    }

    public get enableSave(): boolean {
        if (this.getCurrentStepComponent()) {
            const propertyLimitValidation = this.propertyLimitsValidator.getPropertyLimitValidation();
            if (!!propertyLimitValidation && propertyLimitValidation.isMatch === false) {
                return false;
            }

            if (this.vm.needsPricingRecalculation) {
                return false;
            }

            if (this.areRatingEngineErrors) {
                return false;
            }

            if (!this.getCurrentStepComponent().isValid()) {
                return false;
            }

            if (this.visitableTabs[this.stepPricing] && this.currentStep === this.stepPricing && !this.hasActualGrossCommissionChange) {
                return true;
            }

            if (this.canSave) {
                return true;
            }
        }

        return false;
    }

    public get showRecalculate(): boolean {
        return (
            this.hasPricingStepBeenVisited &&
            (this.isNotPricingStep() || (this.isPricingStep() && this.hasActualGrossCommissionChange)) &&
            this.vm.needsPricingRecalculation &&
            !this.enableSave &&
            this.buttonStatus.allowRecalculate
        );
    }

    private isNotPricingStep = () => this.currentStep !== this.stepPricing;
    private isPricingStep = () => this.currentStep === this.stepPricing;

    public get isCalculating(): boolean {
        return this.pricingService.isCalculating;
    }

    public recalculate(): void {
        // todo: WHY IS THIS NOT CALLED SOMETIMES AFTER CHANGING PRICING AND COMMISSION INFORMATION?
        this.pricingService.setIsCalculating(true);
        this.messageService.clearMessage();

        const currentComponent = this.getCurrentStepComponent();
        if (currentComponent && currentComponent.isValid()) {
            if (this.vm.state === QuoteState.InProgress) {
                this.binderValidationService.loadCriteriasForSelectedBusinessCategories(this.vm);
                this.binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(this.vm);
            }

            this.saveDraft(() => {
                this.pricingService.updateBusinessLines();
                if (this.buttonStatus.canSaveAfterRecalculate) {
                    this.makeAllTabsVisitable();
                }
            });
        } else {
            this.markCurrentStepAsTouched();
        }
        this.hasActualGrossCommissionChange = false;
    }

    public showRediskey(): void {
        if (!this.vm || !this.vm.draftQuoteId) {
            // tslint:disable-next-line: no-console
            console.info("No key yet");
        } else {
            // tslint:disable-next-line: no-console
            console.info(this.vm.draftQuoteId);
        }
    }

    public addressChanged(): void {
        this.handleStepDataChange(this.stepBasicInfo, {
            canSaveAfterRecalculate: false,
            allowRecalculate: false,
        });

        this.recalculateTaxes = true;
        if (this.vm.state === QuoteState.InProgress) {
            this.saveDraft(() => { });
        }
    }

    public areBinderValidationWarningMessages(): boolean {
        for (const key in this.stepWarnings) {
            if (this.stepWarnings[key]) {
                return true;
            }
        }
        // this will be kept till we implement the coverges and this line should be replace with the last line
        return this.binderValidationService.getBinderValidationWarningMessages();

        // return false;
    }

    public getStepWarnings(step: number) {
        if (this.stepWarnings.hasOwnProperty(step)) {
            return this.stepWarnings[step];
        }

        return false;
    }

    public setStepWarnings() {
        if (this.vm.state === QuoteState.InProgress || this.isAgentic === true) {
            this.clientClearanceService.checkClientClearanceForBroker(this.vm.brokerTeam.broker.brokerId, this.vm.client.uid);
        } else {
            this.messageService.clearMessage(MessageCategory.ClientClearance);
        }

        this.checkForManualMtas();

        if (this.vm.state >= QuoteState.Approved) {
            return;
        }

        let messages = [];
        if (
            this.vm.state !== QuoteState.InProgress ||
            // so that new from saved quote works as well
            this.visitableTabs[this.stepPricing]
        ) {
            this.binderValidationService.loadCriteriasForSelectedBusinessCategoriesOnQuote(this.vm);
            for (let step = 1; step <= this.stepSaveQuote; step++) {
                if (!this.stepWarnings[step]) {
                    this.binderValidationService.generateBinderValidationWarningsForTab(step, this.vm);
                    messages = this.binderValidationService.getBinderValidationWarningForTab(step);
                    if (messages) {
                        this.stepWarnings[step] = messages.length > 0;
                    }
                    if (!this.stepWarnings[step]) {
                        this.stepWarnings[step] = this.hasStepWarning(step);
                    }
                }
            }
        }
    }

    public onWarningChange(step: number, hasWarning: boolean) {
        if (this.vm.state < QuoteState.Approved && !this.vm.error) {
            this.stepWarnings[step] = hasWarning;
        }
    }

    public get isLoading(): boolean {
        const stepComponent = this.getCurrentStepComponent();

        return !stepComponent || !stepComponent.isLoaded();
    }

    public checkForManualMtas() {
        if (this.userService.isFeatureAccessible("heroManualChangeMta")) {
            if (this.vm.quoteType === QuoteType.Renewal && this.vm.expiringPolicyNumber) {
                this.mtaService.getManualMtaTypes(this.vm.expiringPolicyNumber).subscribe(
                    (response) => {
                        this.messageService.sendMessage(
                            new Message(
                                `The expiring policy has had the following manual amendments: ${this.getDisplayName(response)
                                    .toString()
                                    .replace(",", ", ")}. Please check the client folder.`,
                                MessageType.Warning
                            ),
                            MessageCategory.Mta
                        );
                    },
                    (error) => {
                        if (error.status !== 404) {
                            return throwError(error);
                        } else {
                            this.messageService.clearMessage(MessageCategory.Mta);
                        }
                    }
                );
            } else {
                this.messageService.clearMessage(MessageCategory.Mta);
            }
        }
    }

    private getDisplayName = (manualMtaTypes) => manualMtaTypes.map((manualMtaType) => MtaTypeEnum[Object.keys(MtaTypeEnum)[manualMtaType]]);

    private hasStepWarning(step: number) {
        switch (step) {
            case this.stepCoverages:
                return !this.coverageAuthorityService.hasValidCoveragesLimitAuthority(this.vm.coverages);
            case this.stepActivities:
                return this.underwriterActivityValidationService.doActivityDetailsHaveWarning(this.vm.activities);
            case this.stepRisk:
                return !this.underwriterRiskValidationService.hasValidRiskAnswers(QuoteStep.Risk);
            case this.stepEndorsements:
                return !this.underwriterRiskValidationService.hasValidRiskAnswers(QuoteStep.Clauses);
            case this.stepPricing:
                return this.underwriterDiscountService.hasPricingDiscountWarning(this.vm.pricingInformation);
            default:
                return false;
        }
    }

    private confirmQuoteSent(quoteIds: number[]): void {
        const requests$ = forkJoin(quoteIds.map((quoteId) => this.quoteService.confirmQuoteSent(quoteId, this.user.initials).pipe(first())));

        requests$.pipe(first()).subscribe(
            null,
            (error) => {
                console.error(error.message);
                error.message = this.errorLogSendQuote;
                this.messageErrorHandler.handleError(error);
            },
            () => {
                if (this.vm.state < QuoteState.QuoteSent) {
                    this.vm.state = QuoteState.QuoteSent;
                }
            }
        );
    }

    private getCurrentStepComponent(stepCheck: number = this.currentStep): BaseStepComponent {
        switch (stepCheck) {
            case this.stepSubjectivities:
                if (this.isSubjectivityConfigurationFeatureEnabled) {
                    return this.subjectivityConfigurationStep;
                } else {
                    return this.subjectivitiesStep;
                }
            case this.stepEndorsements:
                return this.endorsementsStep;
            case this.stepCoverages:
                return this.coveragesStep;
            case this.stepActivities:
                return this.activitiesStep;
            case this.stepRisk:
                return this.riskStep;
            case this.stepPricing:
                return this.pricingStep;
            case this.stepBasicInfo:
            default:
                if (this.isStateFeatureEnabled) {
                    return this.basicInformationStateEnabledStep;
                } else {
                    return this.basicInformationStep;
                }
        }
    }

    private saveDraft(callbackfn: () => void): void {
        if (this.vm.quoteReference === 0 && this.currentStep === this.stepBasicInfo && this.isPricingStepFirstLoad) {
            this.checkFields();
            this.pricingService
                .getBrokerCommissionRate(this.vm.brokerTeam.id, this.vm.product.productId)
                .pipe(first())
                .subscribe((commission: CommissionRate) => {
                    this.vm.commissionInformation.originalGrossCommission = commission.rate;
                    this.vm.commissionInformation.actualGrossCommission = commission.rate;
                });
        }

        this.quoteVMService.updateQuote(this.vm, false);

        this.quoteService
            .saveDraft(this.vm)
            .pipe(
                first(),
                flatMap((result: Quote) => {
                    this.vm.draftQuoteId = result.draftQuoteId;
                    this.vm.origin = result.origin;
                    return this.getTax();
                })
            )
            .subscribe(
                (result: number) => {
                    if (result) {
                        this.vm.taxRate = !isNaN(Number(result)) ? Number(result) : 0;
                        this.premiumCalculationsService.updatePremium();
                    }
                },
                (error) => console.error(JSON.stringify(error)),
                () => callbackfn()
            );
    }

    private checkFields(): void {
        if (this.vm.commissionInformation) {
            if (!this.hasCommissionFee()) {
                this.quoteVMService.setPropertyValue("commissionInformation", {
                    ...this.vm.commissionInformation,
                    fee: 0,
                });
            }

            if (!this.hasActualGrossCommission()) {
                this.vm.commissionInformation.actualGrossCommission = 0;
            }
        } else {
            this.initialiseCommissionInformation();
        }
    }

    private initialiseCommissionInformation() {
        const commissionInformation = new CommissionInformation();
        commissionInformation.fee = 0;
        commissionInformation.cfcShare = 100;
        commissionInformation.originalGrossCommission = 0;
        commissionInformation.actualGrossCommission = 0;
        this.quoteVMService.setPropertyValue("commissionInformation", commissionInformation);
    }

    private hasCommissionFee = () => this.vm.commissionInformation.fee;

    private hasActualGrossCommission = () => this.vm.commissionInformation.actualGrossCommission;

    private getTax(): Observable<number> {
        if (this.recalculateTaxes) {
            this.recalculateTaxes = false;
            return this.taxHttpService.getTotalPremiumTax(this.vm.draftQuoteId);
        }
        return empty();
    }

    private isQuoteApproved(): boolean {
        if (this.areRatingEngineErrors) {
            return false;
        }
        if (this.areBinderValidationWarningMessages()) {
            return false;
        }
        return true;
    }

    private makeAllTabsVisitable(): void {
        for (let i = this.stepBasicInfo; i <= this.stepSaveQuote; i++) {
            this.setInitialised(i);
            this.setVisitable(i, true);
        }
    }

    private setRemovedAutoAttachedSubjectivities(quote: Quote) {
        this.subjectivityService.searchInSubjectivityConfiguration(quote).subscribe((response: SearchSubjectivitiesResult[]) => {
            this.vm.removedAutoAttachedSubjectivities = response
                .filter((response) => response.isAutoAttaching)
                .map((subjectivityResponse) => {
                    return subjectivityResponse.id;
                });
        });
    }

    private setRiskQuestionAnswers(riskQuestionAnswers: RiskQuestionAnswer[]): RiskQuestionAnswer[] {
        return riskQuestionAnswers.map((riskQuestionAnswer) => {
            return new RiskQuestionAnswer(
                riskQuestionAnswer.id,
                riskQuestionAnswer.quoteId,
                riskQuestionAnswer.riskQuestionTag,
                riskQuestionAnswer.text,
                riskQuestionAnswer.number,
                riskQuestionAnswer.percentage,
                riskQuestionAnswer.date,
                riskQuestionAnswer.currency,
                riskQuestionAnswer.riskQuestionOptionUid,
                riskQuestionAnswer.showOnStep,
                riskQuestionAnswer.riskQuestionType,
                riskQuestionAnswer.options
            );
        });
    }
}
