import { PropertyLimitCodes } from './modals/multiple-property/property-limit/property-limit-codes.enum';
import { ComponentType } from "@angular/cdk/portal";
import { ChangeDetectorRef, Component, DoCheck, OnChanges, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialogConfig } from "@angular/material/dialog";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { Constants } from "@app/constants/constants";
import { MessageType } from "@app/enums/MessageType";
import { QuoteState } from "@app/enums/QuoteState";
import { IsDirty } from "@app/interfaces/IsDirty";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { IsValid } from "@app/interfaces/IsValid";
import {
    InsuranceBasis,
    Document, Message, MessageCategory, Quote, QuoteBespokeClauseExtended,
    QuoteStep,
    RiskQuestion,
    RiskQuestionAnswer,
    RiskQuestionType,
    OriginSystem,
    FeatureAccess
} from "@app/models";
import { AvailableEndorsementsRequest } from "@app/quote//models/endorsements/AvailableEndorsementsRequest";
import { AutoAttachingEndorsementsRequest } from "@app/quote/models/endorsements/AutoAttachingEndorsementsRequest";
import { BespokeClauseModalComponent } from "@app/quote/popups/bespoke-clause-modal/bespoke-clause-modal.component";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { QuoteAdditionalInsuredComponent } from "@app/quote/popups/quote-additional-insured-modal/quote-additional-insured.component";
import { EndorsementService } from "@app/quote/services/endorsements/endorsement.service";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { CoverageService } from '@app/services/coverage.service';
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { RiskService } from "@app/services/risk-service";
import { UserService } from "@app/services/user.service";
import { Guid } from "guid-typescript";
import { isEqual } from "lodash";
import { empty, Observable, of, Subscription } from "rxjs";
import { distinctUntilChanged, first, flatMap, takeUntil, tap } from "rxjs/operators";
import { QuoteLossPayeeComponent } from "../../popups/quote-loss-payee-modal/quote-loss-payee.component";
import { LanguageService } from "../../services/language.service";
import { MultiplePropertyComponent } from "./modals/multiple-property/multiple-property.component";
import { PropertyLimitsValidator } from "./modals/multiple-property/property-limit/property-limits-validator";
import { FeaturesHttpService } from '@app/services/features-http.service';

@Component({
    selector: "endorsements-step",
    templateUrl: "./endorsements-step.component.html",
    styleUrls: ["./endorsements-step.component.scss"],
})
export class EndorsementsStepComponent
    extends BaseStepComponent
    implements
    IsValid,
    IsDirty,
    IsLoaded,
    OnDestroy,
    OnInit,
    OnChanges,
    DoCheck {
    public availableEndorsements: Document[];
    public approvedEndorsements: Document[];
    public initialised: boolean = false;
    private availableEndorsementsSubscription: Subscription;
    private autoAttachingEndorsementsSubscription: Subscription;
    public oldAutoAttachedEndorsements: number[];
    public autoAttachedEndorsementsLoaded: boolean = true;
    public availableTags = new Map<string, string[]>();
    public allTags = new Map<string, string[]>();
    public isReloaded = true;
    public editableEndorsementReferences =
        Constants.additionalInsuredEndorsementReferences.concat(
            Constants.lossPayeeEndorsementReferences
        );

    private isLoadingAvailableEndorsements: boolean = true;
    public bespokeClauses: QuoteBespokeClauseExtended[] = []; // needed to allow for change of title
    private valueChangesSubscription: Subscription;

    protected riskQuestions: RiskQuestion[];

    @ViewChild(AutocompleteDropdown)
    public endorsementSelector: AutocompleteDropdown;

    private readonly isMultiplePropertiesClauseForFrenchTerritoriesFeature$ : Observable<FeatureAccess | any>= this.featureService.isFeatureActive("HERO_MultiplePropertiesClauseForFrenchTerritories");
	private isMultiplePropertiesClauseForFrenchTerritoriesFeature : FeatureAccess;
    private endorsementReferences: string[];

    constructor(
        private readonly endorsementService: EndorsementService,
        private readonly previewDocumentModalService: PreviewDocumentModalService,
        private readonly messageService: MessageService,
        private readonly modalDialogService: ModalDialogService,
        private readonly riskService: RiskService,
        private readonly cdRef: ChangeDetectorRef,
        private readonly languageService: LanguageService,
		private readonly featureService: FeaturesHttpService,
        private readonly coverageService:CoverageService,
        private readonly propertyLimitsValidator: PropertyLimitsValidator,
    ) {
        super();
    }

    public get filteredRiskQuestions(): RiskQuestion[] {
        return this.riskQuestions
            ? this.riskQuestions.filter((question) =>
                Array.from(this.availableTags.keys()).some(
                    (tag) => tag === question.tag
                )
            )
            : [];
    }

    public ngOnInit() {
        this.isReloaded = true;

        this.isMultiplePropertiesClauseForFrenchTerritoriesFeature$
        .pipe(
            takeUntil(this.destroyed$),
            tap((feature: FeatureAccess | any) => {
                this.isMultiplePropertiesClauseForFrenchTerritoriesFeature = feature;
                this.endorsementReferences = Constants.getMultiplePropertyEndorsementReferences(this.isMultiplePropertiesClauseForFrenchTerritoriesFeature?.hasAccess);
            })
        )
        .subscribe();

        this.stepForm = new FormGroup({
            selectedValue: new FormControl(),
            riskQuestionAnswers: new FormControl(
                this.vm.riskQuestionAnswers ? this.vm.riskQuestionAnswers : []
            ),
        });

        this.buildBespokeClausesKeys();

        if (!this.vm.endorsements) {
            this.vm.endorsements = new Array<Document>();
        }

        this.coverageService.isQuoteHasBICoverage(this.vm.coverages);

        this.valueChangesSubscription = this.stepForm.valueChanges
            .pipe(distinctUntilChanged(isEqual))
            .subscribe((changes) => {
                let riskQuestionCtrl = this.stepForm.get("riskQuestionAnswers");
                if (riskQuestionCtrl.dirty) {
                    this.valueChangeHandler(changes.riskQuestionAnswers);
                    this.isReloaded = false;
                }
            });
    }

    // fix for the 'changed after checked' console error when clicking on endorsement tab
    public ngDoCheck(): void {
        this.cdRef.detectChanges();
    }

    public ngOnDestroy(): void {
        if (this.availableEndorsementsSubscription) {
            this.availableEndorsementsSubscription.unsubscribe();
        }
        if (this.autoAttachingEndorsementsSubscription) {
            this.autoAttachingEndorsementsSubscription.unsubscribe();
        }

        this.valueChangesSubscription.unsubscribe();

        super.ngOnDestroy();
    }

    public ngOnChanges(changes: any): void {
        if (changes && changes.vm && changes.vm.firstChange) {
            if (!this.vm.removedAutoAttachEndorsements) {
                this.vm.removedAutoAttachEndorsements = new Array<number>();
            }

            const blCodes = this.getBusinessLineCodes(this.vm);
            const icCodes = this.getInsuringClauseCodes(this.vm);
            const icsCodes = this.getInsuringClauseSectionCodes(this.vm);
            const activityCodes = this.getActivityCodes(this.vm);
            const riskQuestionAnswers = this.getRiskQuestionAnswers(this.vm);
            const originSystem = this.getOriginSystem(this.vm.origin);

            let languageCode = "en";

            languageCode = this.languageService.getLanguageById(this.vm.languageId) ? this.languageService.getLanguageById(this.vm.languageId).isoCode : null;

            const availableEndorsementsRequest: AvailableEndorsementsRequest = {
                productCode: this.vm.product.productName,
                countryCode: this.vm.insuredLocation.country.isoCode,
                stateCode: this.vm.insuredLocation.stateProvinceCode,
                brokerTeamId: this.vm.brokerTeam.id,
                brokerId: this.vm.brokerTeam.broker.brokerId,
                brokerGroupId: this.vm.brokerTeam.broker.brokerGroupId,
                businessLineCodes: blCodes,
                insuringClauseCodes: icCodes,
                insuringClauseSectionCodes: icsCodes,
                activityCodes: activityCodes,
                languageCode: languageCode,
                wordingVersionId: this.vm.wordingVersionId,
                riskQuestionAnswers: riskQuestionAnswers,
                documentBasisType: InsuranceBasis.Primary,
                originSystem: originSystem,
                coverHolder: this.vm.product.productName == "CPA" ? "CFC USA" : (this.vm.assignedContact.cfcTeamCoverholder ?? "")
            };

            const autoAttachingEndorsementsRequest: AutoAttachingEndorsementsRequest = {
                productCode: this.vm.product.productName,
                countryCode: this.vm.insuredLocation.country.isoCode,
                stateCode: this.vm.insuredLocation.stateProvinceCode,
                brokerTeamId: this.vm.brokerTeam.id,
                brokerId: this.vm.brokerTeam.broker.brokerId,
                brokerGroupId: this.vm.brokerTeam.broker.brokerGroupId,
                businessLineCodes: blCodes,
                insuringClauseCodes: icCodes,
                insuringClauseSectionCodes: icsCodes,
                activityCodes: activityCodes,
                hasSubjectivities: this.vm.subjectivities.length > 0,
                languageCode: languageCode,
                wordingVersionId: this.vm.wordingVersionId,
                riskQuestionAnswers: riskQuestionAnswers,
                documentBasisType: InsuranceBasis.Primary,
                originSystem: originSystem,
                coverHolder: this.vm.product.productName == "CPA" ? "CFC USA" : (this.vm.assignedContact.cfcTeamCoverholder ?? "")
            };

            this.availableEndorsementsSubscription = this.endorsementService
                .getAvailable(availableEndorsementsRequest)
                .pipe(
                    first(),
                    flatMap((val: Document[]) => {
                        this.approvedEndorsements = val;
                        this.approvedEndorsements.push(
                            Constants.bespokeEndorsement
                        );
                        return this.getAutoAttachingEndorsements(
                            autoAttachingEndorsementsRequest
                        );
                    }),
                    flatMap((result: Document[]) => {
                        if (result) {
                            this.setAutoAttachingEndorsements(result);
                        }

                        this.addAutoAttachEndorsements();

                        this.removeEndorsementsNotAvailable();

                        this.setAvailableEndorsements();

                        this.initialiseAllTags();

                        this.initialiseAvailableTagsFromQuote();

                        this.setInitialise();

                        this.isLoadingAvailableEndorsements = false;

                        return this.riskService.updateRiskQuestions(
                            this.vm.draftQuoteId,
                            this.vm.quoteReference,
                            QuoteStep.Clauses,
                            Array.from(this.allTags.keys())
                        );
                    })
                )
                .subscribe(
                    (riskQuestions) => (this.riskQuestions = riskQuestions),
                    (error) => console.error(error),
                    () => {
                        this.loaded = true;
                        this.setInitialise();
                    }
                );
        }
    }

    // will need to check form valid here
    public isValid() {
        if (this.readonly) {
            return true;
        }

        if (this.stepForm.invalid || !this.isLoaded()) {
            return false;
        }

        if (this.getDocumentReferencesMissingRiskQuestions().length > 0) {
            return false;
        }

        return true;
    }

    public isLoaded(): boolean {
        return this.loaded && !this.isLoadingAvailableEndorsements;
    }

    public markAsTouched() {
        this.stepForm.controls.riskQuestionAnswers.markAsTouched();
    }

    public onRiskQuestionValid(isValid: boolean) {
        this.onValid.emit(isValid);
    }

    public onRiskQuestionChanges() {
        this.setChange(); // will clear errors
        this.checkErrorsWithAvailableRiskQuestions();
    }

    public onRiskQuestionInitialise() {
        this.setInitialise();
    }

    public onRiskQuestionWarningChange(isWarning: boolean) {
        this.setWarning(isWarning);
    }

    get selectList(): Observable<Document[]> {
        if (this.availableEndorsements) {
            return of(this.availableEndorsements);
        }
        return empty();
    }

    public documentDisplayMethod(item: Document): string {
        if (item) {
            if (item.reference && item.reference !== "") {
                return `${item.reference} - ${item.title}`;
            }
            return item.title;
        }
        return "";
    }

    public addEndorsement(): void {
        if (this.checkValidation()) {
            if (this.stepForm.controls.selectedValue.value) {
                this.insertEndorsement(
                    this.stepForm.controls.selectedValue.value
                );
                this.setChange();
            }
            this.endorsementSelector.clearSearch();
            this.checkErrorsWithAvailableRiskQuestions();
        }
    }

    /**
     * Calls message service if not all merge fields have matching questions
     */
    public checkErrorsWithAvailableRiskQuestions() {
        if (this.vm.state >= QuoteState.Approved) {
            return;
        }

        const missingReferences =
            this.getDocumentReferencesMissingRiskQuestions();

        if (missingReferences && missingReferences.length > 0) {
            this.messageService.sendMessage({
                text: `One or more risk questions have not been configured for clause(s): ${missingReferences.join(
                    ","
                )}`,
                type: MessageType.Error,
                messageList: [],
            });
        }
    }

    public getDocumentReferencesMissingRiskQuestions(): string[] {
        let documentReferences: string[] = [];

        this.availableTags.forEach((references: string[], tag: string) => {
            if (this.riskQuestions) {
                const matches = this.riskQuestions.find(
                    (question) => question.tag === tag
                );
                if (!matches) {
                    documentReferences = documentReferences.concat(references);
                }
            } else {
                // no questions, just add all refs
                documentReferences = documentReferences.concat(references);
            }
        });
        return Array.from(new Set(documentReferences));
    }

    public initialiseAllTags() {
        this.allTags.clear();

        // add from vm
        for (const document of this.vm.endorsements) {
            this.addTagsFromDocument(document, this.allTags);
        }

        // add from auto-attach
        for (const document of this.vm.autoAttachedEndorsements) {
            this.addTagsFromDocument(document, this.allTags);
        }

        // add from available
        for (const document of this.availableEndorsements) {
            this.addTagsFromDocument(document, this.allTags);
        }
    }

    public initialiseAvailableTagsFromQuote() {
        this.availableTags.clear();
        for (const document of this.vm.endorsements) {
            this.addTagsFromDocument(document, this.availableTags);
        }

        // add from auto-attach
        for (const document of this.vm.autoAttachedEndorsements) {
            if (
                this.vm.removedAutoAttachEndorsements.find(
                    (documentId: number) => {
                        return document.documentId === documentId;
                    }
                )
            ) {
                // also in removed, so skip
                continue;
            }
            this.addTagsFromDocument(document, this.availableTags);
        }
    }

    public removeEndorsement(documentId: number): void {
        this.removeAssociatedRiskQuestionsFromVm(documentId);
        const endorsement = this.getEndorsementByDocumentId(documentId);

        if (!!endorsement) {
            if (Constants.additionalInsuredEndorsementReferences.includes(endorsement.reference)) {
                this.removeAdditionalInsuredFromQuote();
            } else if (Constants.lossPayeeEndorsementReferences.includes(endorsement.reference)) {
                this.removeLossPayeesFromQuote();
            } else if (this.endorsementReferences.includes(endorsement.reference)) {
                this.vm.propertyLimits = [];
            }
        }

        const index = this.vm.endorsements.findIndex(
            (e) => e.documentId === documentId
        );
        this.vm.endorsements.splice(index, 1);

        if (documentId) {
            let removed = this.approvedEndorsements.filter(
                (obj) => +obj.documentId === +documentId
            )[0];

            if (!removed) {
                removed = this.vm.autoAttachedEndorsements.filter(
                    (obj) => +obj.documentId === +documentId
                )[0];
            }

            if (
                this.vm.autoAttachedEndorsements.some(
                    (s) => s.documentId === removed.documentId
                )
            ) {
                this.vm.removedAutoAttachEndorsements.push(removed.documentId);
            }

            if (
                this.availableEndorsements.findIndex(
                    (p) => +p.documentId === +removed.documentId
                ) === -1
            ) {
                let position = this.availableEndorsements.length;

                if (
                    position > 0 &&
                    removed.reference <
                    this.availableEndorsements[position - 1].reference
                ) {
                    position = this.availableEndorsements.findIndex(
                        (p) => +p.reference > +removed.reference
                    );
                }

                this.availableEndorsements.splice(position, 0, removed);
            }

            this.setChange(); // will clear messages

            this.initialiseAvailableTagsFromQuote();
            this.checkErrorsWithAvailableRiskQuestions();
        }
        this.resetDropDownOptions();
    }

    private getEndorsementByDocumentId(documentId: number): Document {
        return this.vm.endorsements.find(
            (endorsement) => endorsement.documentId === documentId
        );
    }

    private removeAdditionalInsuredFromQuote() {
        this.vm.additionalInsureds = [];
    }

    private removeLossPayeesFromQuote() {
        this.vm.lossPayees = [];
    }

    private removeAssociatedRiskQuestionsFromVm(documentId: number): void {
        const endorsement = this.vm.endorsements.find(
            (e) => e.documentId === documentId
        );
        const riskQuestionTags = endorsement.riskQuestionTags;
        riskQuestionTags.forEach((rqTag) => {
            this.vm.riskQuestionAnswers = this.vm.riskQuestionAnswers.filter(
                (rqa) => rqa.riskQuestionTag !== rqTag
            );
        });
    }

    public filterEndorsements(): void {
        if (this.vm.endorsements && this.vm.endorsements.length > 0) {
            let index = 0;

            this.vm.endorsements = this.vm.endorsements.filter((p) => {
                index = this.availableEndorsements.findIndex(
                    (x) => +p.documentId === +x.documentId
                );

                if (index !== -1) {
                    this.availableEndorsements.splice(index, 1);
                    return true;
                }
                return false;
            });
        }
    }

    public openEndorsementPreview(endorsement: Document) {
        this.previewDocumentModalService.openPreviewClauseDialog(
            endorsement,
            this.vm,
            endorsement.title + " - Preview"
        );
    }

    public onCloseBespokeClauseModal(result: any) {
        if (result && result.key) {
            const originalKeyedEntry = this.bespokeClauses.find(
                (c) => c.key === result.key
            );
            if (originalKeyedEntry) {
                const originalEntry = this.vm.bespokeClauses.find(
                    (c) => c.clauseTitle === originalKeyedEntry.clauseTitle
                );

                // handling change of title
                originalEntry.clauseTitle = result.clauseTitle;
                originalEntry.clauseText = result.clauseText;
                originalKeyedEntry.clauseTitle = result.clauseTitle;
                originalKeyedEntry.clauseText = result.clauseText;
            } else {
                this.bespokeClauses.push(result);
                this.vm.bespokeClauses.push({
                    quoteBespokeClauseId: result.quoteBespokeClauseId,
                    quoteId: result.quoteId,
                    clauseTitle: result.clauseTitle,
                    clauseText: result.clauseText,
                });
            }
        }
    }

    public removeClause(title: string) {
        let index = this.vm.bespokeClauses.findIndex(
            (c) => c.clauseTitle === title
        );
        this.vm.bespokeClauses.splice(index, 1);

        index = this.bespokeClauses.findIndex((c) => c.clauseTitle === title);
        this.bespokeClauses.splice(index, 1);
    }

    public showClause(key: Guid) {
        const clause = this.bespokeClauses.find((c) => c.key === key);
        this.showBespokeClause(clause);
    }

    private setAutoAttachingEndorsements(endorsements: Document[]): void {
        if (this.vm.autoAttachedEndorsements) {
            this.oldAutoAttachedEndorsements =
                this.vm.autoAttachedEndorsements.map((x) => x.documentId);
        }
        this.vm.autoAttachedEndorsements = endorsements;
    }

    private getAutoAttachingEndorsements(
        request: AutoAttachingEndorsementsRequest
    ): Observable<Document[]> {
        this.autoAttachedEndorsementsLoaded = false;
        return this.endorsementService.getAutoAttaching(request);
    }

    private addAutoAttachEndorsements() {
        // Remove any auto-attaching endorsements that are not allow by the current filter
        const availableEndorsements = this.approvedEndorsements.map(
            (x) => x.documentId
        );
        this.vm.autoAttachedEndorsements =
            this.vm.autoAttachedEndorsements.filter((a) =>
                availableEndorsements.some((b) => b === a.documentId)
            );

        // first need to remove any endorsements that were auto added that are no longer in the default list
        if (this.oldAutoAttachedEndorsements) {
            const newAutoAttachedEndorsements =
                this.vm.autoAttachedEndorsements.map((x) => x.documentId);

            const toBeRemoved = this.oldAutoAttachedEndorsements.filter(
                (oldSub) => newAutoAttachedEndorsements.indexOf(oldSub) === -1
            );

            this.vm.endorsements = this.vm.endorsements.filter(
                (x) => !toBeRemoved.some((y) => +y === +x.documentId)
            );
        }

        this.vm.autoAttachedEndorsements.forEach((x) => {
            const alreadyThere = this.vm.endorsements.some(
                (sub) => +sub.documentId === +x.documentId
            );
            const alreadyRemoved = this.vm.removedAutoAttachEndorsements.some(
                (y) => +y === +x.documentId
            );

            if (!alreadyThere && !alreadyRemoved) {
                this.insertEndorsement(x);
            }
        });

        this.sortEndorsements();

        this.autoAttachedEndorsementsLoaded = true;
    }

    private removeEndorsementsNotAvailable(): void {
        if (this.approvedEndorsements && this.vm.endorsements) {
            // remove any that are no longer allowable
            for (let i = this.vm.endorsements.length - 1; i >= 0; i--) {
                const currentId = this.vm.endorsements[i].documentId;
                if (
                    currentId !== 0 &&
                    !this.approvedEndorsements.some(
                        (x) => +x.documentId === +currentId
                    )
                ) {
                    this.vm.endorsements.splice(i, 1);
                }
            }
        }
    }

    private setAvailableEndorsements(): void {
        if (this.vm.endorsements && this.vm.endorsements.length > 0) {
            this.availableEndorsements = this.approvedEndorsements.filter(
                (x) =>
                    !this.vm.endorsements.some(
                        (y) => +y.documentId === +x.documentId
                    )
            );
        } else {
            this.availableEndorsements = this.approvedEndorsements;
        }
    }

    private addTagsFromDocument(
        document: Document,
        tagMap: Map<string, string[]>
    ) {
        if (document.riskQuestionTags) {
            for (const field of document.riskQuestionTags) {
                if (tagMap.has(field)) {
                    const existingRefs = tagMap.get(field);
                    tagMap.set(field, existingRefs.concat(document.reference));
                } else {
                    tagMap.set(field, [document.reference]);
                }
            }
        }
    }

    private insertEndorsement(endorsement: Document): void {
        if (endorsement.documentId < 0) {
            this.showBespokeClause(null);
        } else if (this.isEditableEndorsement(endorsement.reference)) {
            this.showEndorsementModal(endorsement);
        } else {
            this.addEndorsementToQuoteObject(endorsement);
        }
        this.resetDropDownOptions();
    }

    private addEndorsementToQuoteObject(endorsement: Document) {
        this.vm.endorsements.push(endorsement);
        this.addTagsFromDocument(endorsement, this.availableTags);

        if (this.availableEndorsements) {
            this.availableEndorsements = this.availableEndorsements.filter(
                (obj) => +obj.documentId !== +endorsement.documentId
            );
        }
    }

    private showBespokeClause(bespokeClause: QuoteBespokeClauseExtended) {
        if (bespokeClause == null) {
            bespokeClause = {
                key: Guid.create(),
                quoteBespokeClauseId: 0,
                quoteId: this.vm.quoteReference,
                clauseTitle: "",
                clauseText: "",
            };
        }

        this.modalDialogService.openDialog<BespokeClauseModalComponent, number>(
            BespokeClauseModalComponent,
            ModalConfig.bespokeClauseModal.matDialogConfig,
            (obj) => {
                obj.bespokeClause = bespokeClause;
                obj.readOnly = this.readonly;
                obj.currentTitles = this.bespokeClauses
                    .filter((c) => c.key !== bespokeClause.key)
                    .map((c) => c.clauseTitle.toLowerCase());
            },
            (x) => this.onCloseBespokeClauseModal(x)
        );
    }

    public isEditableEndorsement(reference: string) {
        return EndorsementsStepComponent.EndorsementModals.some(m => {
            if(this.checkIfMultiplePropertiesClauseForFrenchTerritoriesIsActive(reference) === true){
                return false;
            }
            return m.references.includes(reference)
        });
    }

    private static readonly EndorsementModals: { references: string[], controller: ComponentType<any>, config: MatDialogConfig<any> }[] = [
        { references: Constants.additionalInsuredEndorsementReferences, controller: QuoteAdditionalInsuredComponent, config: ModalConfig.quoteAdditionalInsuredModal.matDialogConfig },
        { references: Constants.lossPayeeEndorsementReferences, controller: QuoteLossPayeeComponent, config: ModalConfig.quoteLossPayeeModal.matDialogConfig },
        { references: Constants.getMultiplePropertyEndorsementReferences(), controller: MultiplePropertyComponent, config: ModalConfig.multiplePropertyModal.matDialogConfig }
    ]

    public showEndorsementModal(endorsement: Document) {
        if(this.checkIfMultiplePropertiesClauseForFrenchTerritoriesIsActive(endorsement.reference) === true) {
            return;
        }
        for (const modal of EndorsementsStepComponent.EndorsementModals) {
            if (modal.references.includes(endorsement.reference)) {
                this.modalDialogService.openDialog<typeof modal.controller, Quote>(
                    modal.controller,
                    modal.config,
                    component => { component.quote = this.vm; },
                    (quote) => this.onCloseQuoteEndorsementModal(quote, endorsement));

                break;
            }
        };
    }

    private checkIfMultiplePropertiesClauseForFrenchTerritoriesIsActive(reference:string){
        return this.isMultiplePropertiesClauseForFrenchTerritoriesFeature?.hasAccess === false && reference === Constants.frenchTerritoriesReference;
    }

    private validatePropertyLimits() {
        this.messageService.clearMessage(MessageCategory.MatchingPropertyLimits);
        const validateMatchingLimits = this.propertyLimitsValidator.validateMatchingLimits();
        if (!validateMatchingLimits.isMatch) {
            if (!!validateMatchingLimits.DivergingLimits) {

                if(this.coverageService.isBICoverageSelected === false) {
                    const actualLossEnumIndex = Object.values(PropertyLimitCodes).indexOf(PropertyLimitCodes.actualLossSustainedLimit);
                    const grossRentalLimitEnumIndex = Object.values(PropertyLimitCodes).indexOf(PropertyLimitCodes.grossRentalLimit);
                    const actualLossIndex = validateMatchingLimits.DivergingLimits.findIndex(limit=> limit === Object.keys(PropertyLimitCodes)[actualLossEnumIndex]);
                    if(actualLossIndex !== -1) {
                        validateMatchingLimits.DivergingLimits.splice(actualLossIndex, 1);
                    }
                    const grossRentalIndex = validateMatchingLimits.DivergingLimits.findIndex(limit=> limit === Object.keys(PropertyLimitCodes)[grossRentalLimitEnumIndex]);
                    if(grossRentalIndex !== -1) {
                        validateMatchingLimits.DivergingLimits.splice(grossRentalIndex, 1);
                    }
                }

                if(validateMatchingLimits.DivergingLimits.length != 0) {
                const validationMessage = `Property limits do not match: ${validateMatchingLimits.DivergingLimits.toString()}`;
                this.messageService.sendMessage(new Message(
                    validationMessage,
                    MessageType.Error),
                    MessageCategory.MatchingPropertyLimits);
                }else{
                    validateMatchingLimits.isMatch = true;
                }
            }
        }
    }

    private onCloseQuoteEndorsementModal(result: any, endorsement: Document) {
        this.setChange();

        if (this.endorsementReferences.includes(endorsement.reference)) {
            this.validatePropertyLimits();
        }

        if (
            result &&
            !this.vm.endorsements.some(
                (e) => e.reference === endorsement.reference
            )
        ) {
            this.addEndorsementToQuoteObject(endorsement);
            this.resetDropDownOptions();
        }
    }

    private resetDropDownOptions(): void {
        if (this.endorsementSelector) {
            this.endorsementSelector.setOption(null);
        }
    }

    public checkValidation(): boolean {
        if (
            this.stepForm.value.selectedValue &&
            this.stepForm.value.selectedValue.documentId
        ) {
            return true;
        }
        return false;
    }

    private sortEndorsements(): void {
        if (this.vm.endorsements) {
            this.vm.endorsements = this.vm.endorsements.sort((e1, e2) => {
                if (+e1.reference > +e2.reference) {
                    return 1;
                }
                if (+e1.reference < +e2.reference) {
                    return -1;
                }
                return 0;
            });
        }
    }

    private getBusinessLineCodes(quote): string[] {
        const coverages = quote.coverages;
        const businessLines: string[] = [];

        coverages.forEach((coverage) => {
            if (coverage.coverageType.businessLine) {
                this.addCodeToList(
                    businessLines,
                    coverage.coverageType.businessLine.name
                );
            }
        });

        return businessLines;
    }

    private getInsuringClauseCodes(quote): string[] {
        const coverages = quote.coverages;
        const insuringClauseCodes: string[] = [];

        coverages.forEach((coverage) => {
            if (coverage.coverageType.insuringClauseCode) {
                this.addCodeToList(
                    insuringClauseCodes,
                    coverage.coverageType.insuringClauseCode.name
                );
            }
        });

        return insuringClauseCodes;
    }

    private getInsuringClauseSectionCodes(quote): string[] {
        const coverages = quote.coverages;
        const insuringClauseSectionCodes: string[] = [];

        coverages.forEach((coverage) => {
            if (coverage.childCoverages) {
                coverage.childCoverages.forEach((childCoverage) => {
                    if (childCoverage.coverageType.insuringClauseSectionCode) {
                        this.addCodeToList(
                            insuringClauseSectionCodes,
                            childCoverage.coverageType.insuringClauseSectionCode
                                .name
                        );
                    }
                });
            }
        });

        return insuringClauseSectionCodes;
    }

    private getActivityCodes(quote: Quote) {
        const activities = quote.activities;
        const activityCodeList: string[] = [];

        activities.forEach((activity) => {
            if (activity.activityMaps) {
                activity.activityMaps.forEach((activityMap) => {
                    if (activityMap.code) {
                        this.addCodeToList(activityCodeList, activityMap.code);
                    }
                });
            }
        });

        return activityCodeList;
    }

    private getOriginSystem(origin: string) {
        const connectOrigins = ["BROKER API", "CYBER PLATFORM"];
        return connectOrigins.includes(origin) ? OriginSystem.BrokerFacing : OriginSystem.Hero;
    }

    private getRiskQuestionAnswers(quote: Quote) {
        const riskQuestionAnswers = quote.riskQuestionAnswers;
        const riskQuestionAnswersDictionary = {};
        const riskQuestionAnswersRetrievers = this.getRiskQuestionAnswersRetrievers();

        riskQuestionAnswers.forEach((riskQuestionAnswer) => {

            if (riskQuestionAnswersRetrievers.hasOwnProperty(riskQuestionAnswer.riskQuestionType)) {
                riskQuestionAnswersRetrievers[riskQuestionAnswer.riskQuestionType](riskQuestionAnswersDictionary, riskQuestionAnswer);
            }

        });

        return riskQuestionAnswersDictionary;
    }

    private getRiskQuestionAnswersRetrievers() {
        const riskQuestionAnswersRetrievers = {};
        riskQuestionAnswersRetrievers[RiskQuestionType.freeText] =
        riskQuestionAnswersRetrievers[RiskQuestionType.radioButton] =
        riskQuestionAnswersRetrievers[RiskQuestionType.dropDownList] =
        riskQuestionAnswersRetrievers[RiskQuestionType.autoCompleteList] =
        riskQuestionAnswersRetrievers[RiskQuestionType.textArea] =
        riskQuestionAnswersRetrievers[RiskQuestionType.clientLocationDropDown] = (d, ra) => {
                if (ra.text != null) {
                    d[ra.riskQuestionTag] = ra.text;
                }
            };
        riskQuestionAnswersRetrievers[RiskQuestionType.date] = (d, ra) => {
            if (ra.date != null) {
                d[ra.riskQuestionTag] = ra.date;
            }
        };
        riskQuestionAnswersRetrievers[RiskQuestionType.percentage] = (d, ra) => {
            if (ra.percentage != null) {
                d[ra.riskQuestionTag] = ra.percentage.toString();
            }
        };
        riskQuestionAnswersRetrievers[RiskQuestionType.currency] = (d, ra) => {
            if (ra.currency != null) {
                d[ra.riskQuestionTag] = ra.currency.toString();
            };
        };
        riskQuestionAnswersRetrievers[RiskQuestionType.integer] = (d, ra) => {
            if (ra.number != null) {
                d[ra.riskQuestionTag] = ra.number.toString();
            }
        };
        riskQuestionAnswersRetrievers[RiskQuestionType.retroDate] = (d, ra) => {
            if (ra.date != null) {
                d[ra.riskQuestionTag] = ra.date;
            }
            else if (ra.text != null) {
                d[ra.riskQuestionTag] = ra.text;
            }
        };
        riskQuestionAnswersRetrievers[RiskQuestionType.checkBoxArray] = (d, ra) => {
            if (ra.options) {
                var answers = [];
                for (const key in ra.options) {
                    answers.push(ra.options[key])
                }
                d[ra.riskQuestionTag] = JSON.stringify(answers);
            }
        };

        return riskQuestionAnswersRetrievers;
    }

    private addCodeToList(list, stringToAdd): string[] {
        if (!list.includes(stringToAdd)) {
            list.push(stringToAdd);
        }
        return list;
    }

    private buildBespokeClausesKeys() {
        if (!this.vm.bespokeClauses) {
            this.vm.bespokeClauses = [];
        }

        for (const clause of this.vm.bespokeClauses) {
            this.bespokeClauses.push({
                key: Guid.create(),
                quoteBespokeClauseId: clause.quoteBespokeClauseId,
                quoteId: clause.quoteId,
                clauseTitle: clause.clauseTitle,
                clauseText: clause.clauseText,
            });
        }
    }

    private valueChangeHandler(answers: RiskQuestionAnswer[]): void {
        this.riskService.updateRiskQuestionAnswers(answers);
        if (!this.isReloaded) this.setChange();
    }
}
