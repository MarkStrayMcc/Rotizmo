import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";

import { IsDirty } from "@app/interfaces/IsDirty";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { Coverage, CoverageExcess, CoverageLimit, CoverageRequest, CoverageType, QuoteState } from "@app/models";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { CoverageItemService } from "@app/services/coverage-item.service";
import { CoverageService } from "@app/services/coverage.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { first } from "rxjs/operators";
import { UserService } from "@app/services/user.service";
import { PropertyLimit } from "../../models/property-limit.model";
import { PropertyLimitConfig } from '@app/quote/models/PropertyLimitConfig';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';
import { LimitBasis } from '@app/enums/LimitBasis';

@Component({
    selector: "coverages-step",
    styleUrls: ["./coverages-step.component.scss"],
    templateUrl: "./coverages-step.component.html",
})
export class CoveragesStepComponent extends BaseStepComponent implements IsValid, IsDirty, IsLoaded, MarkAsTouched, OnInit, OnDestroy {
    public dirty: boolean = false;
    public isTouched: boolean = false;
    public isFirstLoad: boolean = false;
    public coverageItems: CoverageItem[] = [];
    public coreCoverageItems: CoverageItem[] = [];
    public additionalCoverageItems: CoverageItem[] = [];
    public availableAdditionalCoverageItems: CoverageItem[] = [];
    public isMultipleProperty: boolean = false;
    private areCoveragesLoaded: boolean = false;

    public get terrorismBinderSectionId(): number {
        return this.binderValidationService.getTerrorismBinderSectionId();
    }

    private isLoadCompleted: boolean = false;
    private warningSubscription: Subscription;

    @Output() firstLossLimit = new EventEmitter<number>();

    @ViewChildren("coverageComponent")
    public coverageComponents: QueryList<IsValid & MarkAsTouched>;
    get selectedCoverages(): Coverage[] {
        if (this.vm && this.vm.coverages) {
            return this.vm.coverages;
        }
        return null;
    }

    set selectedCoverages(coverages: Coverage[]) {
        this.vm.coverages = coverages;
    }

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly coverageHttpService: CoverageHttpService,
        private readonly coverageService: CoverageService,
        private readonly coverageItemService: CoverageItemService,
        private readonly binderValidationService: BinderValidationService,
        private readonly coverageAuthorityService: UnderwriterCoverageAuthorityService,
        private readonly userService: UserService
    ) {
        super();
    }

    public ngOnInit() {
        this.stepForm = this.formBuilder.group({});
        if (!this.selectedCoverages) {
            this.selectedCoverages = new Array<Coverage>();
        }
        const request: CoverageRequest = {
            product: this.vm.product.productName,
            territory: this.vm.insuredLocation.country.isoCode,
            wordingVersionId: this.vm.wordingVersionId,
        };
        this.isLoadCompleted = false;

        this.coverageService.setMultiplePropertiesBusinessLine(null);

        this.coverageHttpService
            .getAvailable(request)
            .pipe(first())
            .subscribe(
                (coverageTypes) => {
                    if (coverageTypes) {
                        this.loadCoverageItems(coverageTypes);
                        this.isLoadCompleted = true;
                        this.stepForm.markAsPristine();
                    }
                },
                (error) => console.error(JSON.stringify(error)),
                () => {
                    this.isLoadCompleted = true;
                    // TODO Remove fudge
                    /*
                        Fudge: setTimeout forces angular to wait until everything is initialise, that way we can subscribe
                        to valueChanges and only pickup where the changes have been made by the user not the redisplay of
                        existing data. Once this form has been refactored to reactive it should not be necessary and we
                        can track changes properly
                    */
                    setTimeout(() => {
                        this.stepForm.markAsPristine();
                        this.stepForm.valueChanges.subscribe((x) => {
                            if (this.stepForm.dirty) {
                                this.setChange();
                            }
                        });
                        this.setInitialise();
                    }, 0);
                }
            );

        this.warningSubscription = this.coverageAuthorityService.getWarningEvent().subscribe((x) => this.setWarning(x));
    }

    public markAsTouched(): void {
        this.isTouched = true;
        if (this.coverageComponents) {
            this.coverageComponents.filter((x) => !x.isValid()).forEach((x) => x.markAsTouched());
        }
    }

    public loadCoverageItems(newCoverageTypes: CoverageType[]) {
        const isChangedWording = this.vm.reAutoSelectAllCoverages;

        this.selectedCoverages = this.coverageService.getAvailableSelectedCoverages(this.selectedCoverages, newCoverageTypes, isChangedWording);
        this.coverageItems = this.coverageItemService.getCoverageItems(newCoverageTypes, this.selectedCoverages, isChangedWording);
        this.coreCoverageItems = this.coverageItems.filter((c) => !c.coverage.coverageType.isAdditionalCoverage);

        this.coreCoverageItems.forEach(async (coverageItem) => {
            let result = await this.coverageService.isMultiplePropertyBusinessLineProduct(coverageItem.coverage.coverageType.businessLine?.name, this.vm.product.productName).toPromise();
            if (result == true) {
                this.isMultipleProperty = true;
            }
        });

        this.availableAdditionalCoverageItems = this.coverageItems.filter((c) => c.coverage.coverageType.isAdditionalCoverage);

        const businessLineCodes = this.binderValidationService.getBusinessLineCodes(newCoverageTypes);

        if (this.vm.state === QuoteState.InProgress) {
            this.binderValidationService.loadBinderValidationCriterias(this.vm.draftQuoteId, businessLineCodes, this.vm.product?.productId);
        }

        if (this.vm.reAutoSelectAllCoverages) {
            this.isFirstLoad = true;
            this.expandAndSelectAll();
        }

        this.vm.reAutoSelectAllCoverages = false;
        this.areCoveragesLoaded = true;
        this.checkAdditionalCoverages();
    }

    public ngOnDestroy() {
        if (this.warningSubscription) {
            this.warningSubscription.unsubscribe();
        }
        super.ngOnDestroy();
    }

    public onSelection(coverage: Coverage) {
        const index = this.coverageService.getSelectedCoverageIndex(this.selectedCoverages, coverage.coverageType.insuringClauseCode.name, false);

        if (index === -1) {
            this.selectedCoverages.push(coverage);

            if (this.areCoveragesLoaded) {
                this.checkAdditionalCoverages();
            }
            this.buttonStatus = {
                canSaveAfterRecalculate: false,
                allowRecalculate: true,
            };
            this.setChange();
        }
    }

    public onOptionSelection(coverage: Coverage) {
        this.updateFollowingSectionSelection(coverage, true);
    }

    public onDeselection(coverage: Coverage) {
        const index = this.coverageService.getSelectedCoverageIndex(this.selectedCoverages, coverage.coverageType.insuringClauseCode.name, false);

        const selectedCoverage = this.selectedCoverages[index];
        if (selectedCoverage) {
            selectedCoverage.childCoverages = [];
            this.selectedCoverages.splice(index, 1);

            if (this.areCoveragesLoaded) {
                this.checkAdditionalCoverages();
            }
            this.buttonStatus = {
                canSaveAfterRecalculate: false,
                allowRecalculate: true,
            };
            this.setChange();
        }
    }

    public onOptionDeselection(coverage: Coverage) {
        this.updateFollowingSectionSelection(coverage, false);
    }

    public isValid(): boolean {
        if (this.readonly) {
            return true;
        }

        if (!this.selectedCoverages || this.selectedCoreCoverages().length === 0) {
            return false;
        }

        if (this.coverageComponents) {
            return this.coverageComponents.filter((x) => !x.isValid()).length === 0;
        }

        return true;
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public isLoaded(): boolean {
        return this.isLoadCompleted;
    }

    public toggleSelectAll() {
        const shouldSelectAllCoverages = !this.areAllCoveragesSelected();
        for (const coverageItem of this.coreCoverageItems) {
            if (coverageItem.isSelected !== shouldSelectAllCoverages) {
                coverageItem.isSelected = shouldSelectAllCoverages;
                this.triggerSelectionEvents(coverageItem);
            }
        }
    }

    public expandAndSelectAll() {
        for (const coverageItem of this.coverageItems) {
            if (this.isFirstLoad) {
                coverageItem.isSelected = coverageItem.coverage.coverageType.isSelectedByDefault;
            } else {
                coverageItem.isSelected = true;
            }
            this.triggerSelectionEvents(coverageItem);
        }
    }

    public areAllCoveragesSelected(): boolean {
        const selectedCore = this.selectedCoreCoverages();
        return selectedCore && this.coreCoverageItems.length > 0 && selectedCore.length > 0 && this.coreCoverageItems.length === selectedCore.length;
    }

    public addSubFormGroup(name: string, formGroup: FormGroup) {
        this.stepForm.addControl(name, formGroup);
        this.stepForm.markAsPristine();
    }

    public setPropertyLimitsWithFloatingValues({ propertyLimits, propertyLimitFloatingValues, firstLossLimit }:
        { propertyLimits: PropertyLimit[]; propertyLimitFloatingValues: PropertyLimitFloatingValues, firstLossLimit: number }) {
        const isMultiplePropertyFeatureToggleOn: boolean = this.userService.isFeatureAccessible("multipleProperties");
        if (isMultiplePropertyFeatureToggleOn === true) {
            this.vm.propertyLimits = [...propertyLimits];
            this.vm.propertyLimitFloatingValues = propertyLimitFloatingValues;
            this.vm.firstLossLimitValue = firstLossLimit;
            this.coverageService.firstLossLimitValue = firstLossLimit;
            for (let coverageItem of this.coverageItems) {
                coverageItem.coverage.childCoverages.forEach((childCoverage: Coverage) => {
                    childCoverage.limits.forEach((limit: CoverageLimit) => {
                        const limitTypeCode = limit.coverageLimitType.limitTypeCode;
                        const propertyLimitNameList: string[] = PropertyLimitConfig.LimitMapper.get(limitTypeCode);
                        if (propertyLimitNameList?.length > 0) {
                            limit.limit = this.sumLimitValueFromTemplate(propertyLimits, propertyLimitFloatingValues, propertyLimitNameList);
                        }
                        // total insured value
                        if (limitTypeCode === PropertyLimitConfig.TotalInsuredLimitCode) {
                            const allPropertyNameList: string[] = this.getAllPropertyLimitNames();
                            let totalInsuredValue = this.sumLimitValueFromTemplate(propertyLimits, propertyLimitFloatingValues, allPropertyNameList);
                            this.coverageService.totalInsuredLimitValue = totalInsuredValue;
                            limit.limit = firstLossLimit > 0 && totalInsuredValue > firstLossLimit ? firstLossLimit : totalInsuredValue;
                            limit.limitBasis = firstLossLimit > 0 && totalInsuredValue > firstLossLimit ? LimitBasis.FirstLossLimit : LimitBasis.TotalInsuredValue;
                            limit.coverageLimitType.isReadOnly = true;
                        }
                    });
                });
            }
            this.emitFirstLossLimit(firstLossLimit);
            this.vm.propertyLimits = [...propertyLimits];
        }
    }

    public getAllPropertyLimitNames(): string[] {
        const allPropertyNameList: string[] = [];
        for (let value of PropertyLimitConfig.LimitMapper.values()) {
            allPropertyNameList.push(...value);
        }
        return allPropertyNameList;
    }

    public sumLimitValueFromTemplate(propertyLimits: PropertyLimit[], propertyLimitFloatingValues: PropertyLimitFloatingValues, propertyLimitNameList: string[]): number {
        let sumLimitValue = 0;
        propertyLimits.forEach((propertyLimit: PropertyLimit) => {
            sumLimitValue += this.getLimitValueWithPropertyLimitConfig(propertyLimit, propertyLimitNameList);
        });
        sumLimitValue += this.getLimitValueWithPropertyLimitConfig(propertyLimitFloatingValues, propertyLimitNameList);
        return sumLimitValue;
    }

    private getLimitValueWithPropertyLimitConfig(limitObject: PropertyLimit | PropertyLimitFloatingValues, propertyLimitNameList: string[]): number {
        let sumLimitValue = 0;
        if (!limitObject) return 0;
        propertyLimitNameList.forEach((propertyLimitName: string) => {
            sumLimitValue += limitObject[propertyLimitName] != undefined ?
                Number.isNaN(limitObject[propertyLimitName]) ? 0 : limitObject[propertyLimitName] : 0;
        });
        return sumLimitValue;
    }

    public selectedCoreCoverages(): Coverage[] {
        if (this.selectedCoverages) {
            return this.selectedCoverages.filter((c) => !c.coverageType.isAdditionalCoverage);
        }
        return [];
    }

    private triggerSelectionEvents(coverageItem: CoverageItem) {
        if (coverageItem.isSelected) {
            this.onSelection(coverageItem.coverage);
        } else {
            this.onDeselection(coverageItem.coverage);
        }
    }

    private checkAdditionalCoverages() {
        if (this.availableAdditionalCoverageItems) {
            this.additionalCoverageItems = this.availableAdditionalCoverageItems.filter((additionalCoverage) => {
                return this.isAdditionalCoverageAvailable(additionalCoverage);
            });

            this.removeUnavailableAdditionalCoveragesFromSelectedList();
        }
    }

    private isAdditionalCoverageAvailable(additionalCoverage: CoverageItem): boolean {
        const additionalCoverageCategories = additionalCoverage.coverage.coverageType.additionalCoverageCategories.map((bl) => bl.name);

        return this.selectedCoreCoverages().some((coreCoverage) =>
            additionalCoverageCategories.some(
                (additionalCoverageCategory) =>
                    coreCoverage.coverageType.businessLine != null && additionalCoverageCategory === coreCoverage.coverageType.businessLine.name
            )
        );
    }

    private removeUnavailableAdditionalCoveragesFromSelectedList() {
        const coveragesToBeRemoved = this.selectedCoverages.filter(
            (coverage) =>
                coverage.coverageType.isAdditionalCoverage &&
                this.additionalCoverageItems.filter((additionalCoverage) => additionalCoverage.coverage.coverageType.name === coverage.coverageType.name).length === 0
        );

        for (const coverageToRemove of coveragesToBeRemoved) {
            const index = this.coverageService.getSelectedAdditionalCoverageIndexByName(this.selectedCoverages, coverageToRemove.coverageType.name);
            this.selectedCoverages.splice(index, 1);
        }
        if (coveragesToBeRemoved.length > 0) {
            this.setChange();
        }
    }

    private updateFollowingSectionSelection(coverage: Coverage, setSelectedTo: boolean) {
        const leadLimitCodes = coverage.limits.map((l) => l.coverageLimitType.limitTypeCode);
        const leadExcessCodes = coverage.excesses.map((l) => l.excessType.excessTypeCode);

        for (const coverageItem of this.coreCoverageItems) {
            for (const childCoverage of coverageItem.childCoverageItems) {
                if (childCoverage.isSelected === setSelectedTo) continue;
                this.selectCoverageIfNeeded(coverageItem, childCoverage, leadLimitCodes, leadExcessCodes, setSelectedTo);
            }
        }
        this.buttonStatus = {
            canSaveAfterRecalculate: false,
            allowRecalculate: true,
        };
        this.setChange();
    }

    public selectCoverageIfNeeded(
        parentCoverage: CoverageItem,
        childCoverage: CoverageItem,
        leadLimitCodes: string[],
        leadExcessCodes: string[],
        setSelectedTo: boolean
    ) {
        const childLimits = childCoverage.coverage.limits;
        const childExcesses = childCoverage.coverage.excesses;
        const shouldSet =
            childLimits.some((l) => this.isMandatoryOrHiddenLimit(l) && this.isAFollowingLimit(leadLimitCodes, l.coverageLimitType.followLimitCodes)) ||
            childExcesses.some((e) => this.isMandatoryOrHiddenExcess(e) && this.isAFollowingExcess(leadExcessCodes, e.excessType.followExcessCodes));

        if (shouldSet) {
            childCoverage.isSelected = setSelectedTo;

            const parentIndex = this.coverageService.getSelectedCoverageIndex(this.selectedCoverages, parentCoverage.coverage.coverageType.insuringClauseCode.name, false);
            if (parentIndex >= 0) {
                const childIndex = this.coverageService.getSelectedCoverageIndex(this.selectedCoverages[parentIndex].childCoverages, childCoverage.coverage.coverageType.insuringClauseSectionCode.name, true);
                if (childIndex >= 0) {
                    const selectedChildCoverage = this.selectedCoverages[parentIndex].childCoverages[childIndex];

                    if (selectedChildCoverage && !childCoverage.isSelected) {
                        this.selectedCoverages[parentIndex].childCoverages.splice(childIndex, 1);
                    }
                } else if (childIndex === -1 && childCoverage.isSelected) {
                    this.selectedCoverages[parentIndex].childCoverages.push(childCoverage.coverage);
                }

                this.setChange();
            }
        }
    }

    private isMandatoryOrHiddenExcess(coverageExcess: CoverageExcess) {
        return coverageExcess.excessType.isMandatory || coverageExcess.excessType.isHidden;
    }

    private isMandatoryOrHiddenLimit(coverageLimit: CoverageLimit) {
        return coverageLimit.coverageLimitType.isMandatory || coverageLimit.coverageLimitType.isHidden;
    }

    private isAFollowingLimit(leadLimitCodes: string[], followLimitCodes: string[]) {
        for (const code of followLimitCodes) {
            if (leadLimitCodes.some(l => l == code)) {
                return true;
            }
        }
        return false;
    }

    private isAFollowingExcess(leadExcessCodes: string[], followExcessCodes: string[]) {
        for (const code of followExcessCodes) {
            if (leadExcessCodes.some(e => e == code)) {
                return true;
            }
        }
        return false;
    }

    // Call this method whenever you want to emit the value
    emitFirstLossLimit(value: number) {
        this.firstLossLimit.emit(value);
    }
}
