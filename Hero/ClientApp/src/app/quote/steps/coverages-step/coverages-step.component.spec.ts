import { AgmCoreModule } from "@agm/core";
import { Component, EventEmitter, Injectable, Input, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import {
    BinderValidationCriteria,
    CfcContact,
    ClientLocation,
    Coverage,
    CoverageExcess,
    CoverageExcessType,
    CoverageLimit,
    CoverageLimitType,
    CoverageType,
    Currency,
    Quote,
    Tag,
} from "@app/models";
import { CoveragesStepComponent } from "@app/quote/steps/coverages-step/coverages-step.component";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { CoverageItemService } from "@app/services/coverage-item.service";
import { CoverageService } from "@app/services/coverage.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UserService } from "@app/services/user.service";
import { CoverageModelTestUtilities } from "@app/test/coverage-model.testutil";
import { MockMatSpinner } from "@app/test/matProgressSpinner.mock";
import { getTestQuote } from "../../../../test-helpers/index";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CookieService } from "ngx-cookie-service";
import { QuoteService } from "@app/quote/services/quote.service";
import { PropertyLimit } from "../../models/property-limit.model";
import { PropertyLimitConfig } from '@app/quote/models/PropertyLimitConfig';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';

describe("CoveragesStepComponent", () => {
    let component: CoveragesStepComponent;
    let fixture: ComponentFixture<CoveragesStepComponent>;
    let coverageAuthorityService: UnderwriterCoverageAuthorityService;
    let coverageHttpService: CoverageHttpService;
    let coverageService: CoverageService;
    let coverageItemService: CoverageItemService;
    let binderValidationService: BinderValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CoveragesStepComponent, MockCoverageComponent, MockMatSpinner],
            imports: [HttpClientTestingModule, ReactiveFormsModule, AgmCoreModule],
            providers: [
                CoverageHttpService,
                CoverageService,
                CoverageItemService,
                UnderwriterCoverageAuthorityService,
                { provide: UserService, useClass: MockUserService },
                {
                    provide: BinderValidationService,
                    useClass: MockBinderValidationService,
                },
                CookieService,
                { provide: QuoteService, useClass: MockQuoteService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        coverageAuthorityService = TestBed.inject(UnderwriterCoverageAuthorityService);
        coverageHttpService = TestBed.inject(CoverageHttpService);
        coverageService = TestBed.inject(CoverageService);
        coverageItemService = TestBed.inject(CoverageItemService);
        binderValidationService = TestBed.inject(BinderValidationService);
        spyOn(coverageAuthorityService, "getWarningEvent").and.callThrough();
        spyOn(coverageAuthorityService, "setWarningStatus").and.callThrough();
        spyOn(coverageHttpService, "getAvailable").and.returnValue(of(getTestCoverageTypes()));
        spyOn(coverageService, "getSelectedCoverageIndex").and.callThrough();
        spyOn(coverageService, "getAvailableSelectedCoverages").and.callThrough();
        spyOn(coverageItemService, "getCoverageItems").and.callThrough();
        spyOn(binderValidationService, "loadBinderValidationCriterias").and.callThrough();
        spyOn(binderValidationService, "getBusinessLineCodes").and.returnValue("DO,CL");

        fixture = TestBed.createComponent(CoveragesStepComponent);
        component = fixture.componentInstance;
        component.vm = getTestQuote();
        fixture.detectChanges();
    });

    it("Should create component", () => {
        expect(component).toBeTruthy();
        expect(coverageHttpService.getAvailable).toHaveBeenCalledTimes(1);
        expect(coverageService.getAvailableSelectedCoverages).toHaveBeenCalledTimes(1);
        expect(coverageItemService.getCoverageItems).toHaveBeenCalledTimes(1);
    });

    it("Should set property limits values", () => {
        const propertyLimit: PropertyLimit[] = [
            {
                insuredAddress: {
                    countryId: 1,
                    clientLocationId: 1,
                    clientId: 1,
                    address1: "address1",
                    address2: "address2",
                    address3: "address3",
                    city: "city",
                    postcode: "postcode",
                    isPrimaryLocation: true,
                    stateProvinceCode: "stateProvinceCode",
                    county: "county",
                    disabledOn: new Date(),
                    country: null,
                },
                totalInsuredValue: 1000,
            },
        ];
        const floatingValues: PropertyLimitFloatingValues =
        {
            contentsDamageLimit: 1000,
            actualLossSustainedLimit: 2000,
            increasedCostOfWorkingLimit: 3000,
            alternativeAccommodationLimit: 500
        };
        // Act
        component.setPropertyLimitsWithFloatingValues({ propertyLimits: propertyLimit, propertyLimitFloatingValues: floatingValues, firstLossLimit: 1000 });

        // Asserts
        expect(component.vm.propertyLimits).toEqual(propertyLimit);
        expect(component.vm.propertyLimitFloatingValues).toEqual(floatingValues);
    });

    it("Should have a selectedCoverages list the length of all available core coverages by default", () => {
        // Actions
        const availableCoreCoveragesCount = component.coverageItems.filter((coverageItem) => !coverageItem.coverage.coverageType.isAdditionalCoverage).length;

        // Asserts
        expect(component.selectedCoverages).toBeDefined();
        expect(component.selectedCoverages.length).toBe(availableCoreCoveragesCount);
    });

    it("Should have all core coverages selected by default", () => {
        // Actions
        const coreCoverages = component.coverageItems.filter((coverageItem) => !coverageItem.coverage.coverageType.isAdditionalCoverage);
        const selectedCoreCoverages = component.coverageItems.filter(
            (coverageItem) => coverageItem.isSelected && !coverageItem.coverage.coverageType.isAdditionalCoverage
        );

        // Asserts
        expect(coreCoverages).toBeDefined();
        expect(selectedCoreCoverages.length).toBe(coreCoverages.length);
    });

    it("Should have all additional coverages unselected by default", () => {
        // Actions
        const additionalCoverages = component.coverageItems.filter((coverageItem) => coverageItem.coverage.coverageType.isAdditionalCoverage);
        const unselectedAdditionalCoverages = component.coverageItems.filter(
            (coverageItem) => !coverageItem.isSelected && coverageItem.coverage.coverageType.isAdditionalCoverage
        );

        // Asserts
        expect(unselectedAdditionalCoverages).toBeDefined();
        expect(unselectedAdditionalCoverages.length).toBe(additionalCoverages.length);
    });

    it("Should set coverageItem.isSelected to true for all newly loaded coverages by default, for all coverages that has isSelectedByDefault as true", () => {
        // Actors
        const corporateLiabilityCoverageType = getTestCoverageTypes()[1];
        const kidnapAndRandomCoverageType = getTestCoverageTypes()[5];

        component.selectedCoverages = [
            {
                coverageType: corporateLiabilityCoverageType,
            },
            {
                coverageType: kidnapAndRandomCoverageType,
            },
        ] as Coverage[];

        // Actions
        component.loadCoverageItems(getTestCoverageTypes());
        const selectedCoverageItems = component.coverageItems.filter((coverageItem) => coverageItem.isSelected);

        // Asserts
        expect(selectedCoverageItems).toBeDefined();
        expect(coverageHttpService.getAvailable).toHaveBeenCalledTimes(1);
        expect(coverageService.getAvailableSelectedCoverages).toHaveBeenCalledTimes(2);
        expect(coverageItemService.getCoverageItems).toHaveBeenCalledTimes(2);
        // component.selectedCoverages seems to never have been modified on calling loadCoverageItems
        expect(component.selectedCoverages.length).toBe(2);
        expect(selectedCoverageItems.length).toBe(2);
        expect(selectedCoverageItems.some((sci) => sci.coverage.coverageType.insuringClauseCode.name == corporateLiabilityCoverageType?.insuringClauseCode?.name)).toBeTruthy();
        expect(selectedCoverageItems.some((sci) => sci.coverage.coverageType.insuringClauseCode.name == kidnapAndRandomCoverageType?.insuringClauseCode?.name)).toBeTruthy();
        expect(selectedCoverageItems.every((sci) => sci.isSelected)).toBeTruthy();
        /**
         * The component's full list of coverageItems and testCoverageTypes list are the same size
         */
        expect(component.coverageItems.length).toBe(getTestCoverageTypes().length);
        /**
         * two coverage items were selected
         */
        expect(component.coverageItems.filter((ci) => ci.isSelected).length).toBe(component.selectedCoverages.length);
    });

    it("Should only load valid selected coverages that are still available on first change", () => {
        // Actors
        const corporateLiabilityCoverageType = getTestCoverageTypes()[1];
        const invalidCoverageType = {
            id: 66,
            name: "Invalid Coverage",
        } as CoverageType;

        component.selectedCoverages = [
            {
                coverageType: corporateLiabilityCoverageType,
            },
            {
                coverageType: invalidCoverageType,
            },
        ] as Coverage[];

        // Actions
        component.loadCoverageItems(getTestCoverageTypes());

        const selectedCoverageItems = component.coverageItems.filter((coverageItem) => coverageItem.isSelected);
        // Asserts
        expect(selectedCoverageItems).toBeDefined();
        expect(coverageHttpService.getAvailable).toHaveBeenCalledTimes(1);
        expect(coverageService.getAvailableSelectedCoverages).toHaveBeenCalledTimes(2);
        expect(coverageItemService.getCoverageItems).toHaveBeenCalledTimes(2);
        expect(component.selectedCoverages.length).toBe(2);
        expect(selectedCoverageItems.length).toBe(1);
        expect(selectedCoverageItems.some((sci) => sci.coverage.coverageType.insuringClauseCode.name == corporateLiabilityCoverageType.insuringClauseCode.name)).toBeTruthy();
        expect(selectedCoverageItems.some((sci) => sci.coverage.coverageType.insuringClauseCode.name == invalidCoverageType?.insuringClauseCode?.name)).toBeFalsy();
        expect(component.coverageItems.filter((ci) => ci.isSelected).length).toBe(selectedCoverageItems.length);
    });

    it("Should reset selected coverages to default values if the wording version changed", () => {
        // Actors
        const testCoverageTypes = [getCoverageType3351(), getCoverageType3353()];

        const coverages = testCoverageTypes.map((ct) => CoverageModelTestUtilities.translateToCoverage(ct));

        component.selectedCoverages = [coverages[1]];

        // Actions
        component.vm.reAutoSelectAllCoverages = false;
        fixture.detectChanges();

        const previousValue: Quote = JSON.parse(JSON.stringify(component.vm));
        component.vm.reAutoSelectAllCoverages = true;
        fixture.detectChanges();

        const selectedCoverageItems = component.coverageItems.filter((coverageItem) => coverageItem.isSelected);

        // Asserts
        expect(selectedCoverageItems).toBeDefined();
        expect(coverageHttpService.getAvailable).toHaveBeenCalled();
        expect(coverageItemService.getCoverageItems).toHaveBeenCalled();
        expect(coverageService.getAvailableSelectedCoverages).toHaveBeenCalled();
        expect(component.selectedCoverages);
    });

    it("Should load binder validation criterias on first change", () => {
        // Asserts
        expect(binderValidationService.loadBinderValidationCriterias).toHaveBeenCalledTimes(1);
        expect(binderValidationService.loadBinderValidationCriterias).toHaveBeenCalledWith(component.vm.draftQuoteId, "DO,CL", component.vm.product?.productId);
    });

    it("Should add coverage to selected coverages list on selection", () => {
        // Actors
        component.selectedCoverages = [
            {
                coverageType: getTestCoverageTypes()[0],
            },
            {
                coverageType: getTestCoverageTypes()[1],
            },
        ] as Coverage[];

        const testCoverage = {
            coverageType: {
                id: 7,
                isAdditionalCoverage: false,
                name: "Test coverage to be added",
                businessLine: {
                    name: "TC",
                },
                childCoverageTypes: [] as CoverageType[],
                insuringClauseCode: { name: "TC", description: "" }
            },
        } as Coverage;

        // Actions
        component.loadCoverageItems([getTestCoverageTypes()[0], getTestCoverageTypes()[1]]);
        const numberOfSelectedCoveragesInitial = component.selectedCoverages.length;
        component.onSelection(testCoverage);

        // Asserts
        expect(numberOfSelectedCoveragesInitial).toBe(component.coreCoverageItems.length);
        expect(component.selectedCoverages.length).toBe(component.coreCoverageItems.length + 1);
        expect(component.selectedCoverages[numberOfSelectedCoveragesInitial].coverageType.insuringClauseCode).toBe(testCoverage.coverageType.insuringClauseCode);
        expect(component.selectedCoverages[numberOfSelectedCoveragesInitial].coverageType.name).toBe(testCoverage.coverageType.name);
    });

    it("Should remove coverage from selected coverages list on deselection", () => {
        // Actors
        const testCoverage = { coverageType: getTestCoverageTypes()[1] } as Coverage;
        component.selectedCoverages = [testCoverage];

        // Actions
        const numberOfSelectedCoveragesInitial = component.selectedCoverages.length;
        component.onDeselection(testCoverage);

        // Asserts
        expect(numberOfSelectedCoveragesInitial).toBe(1);
        expect(component.selectedCoverages.length).toBe(0);
    });

    it("Should be valid", () => {
        // Asserts
        expect(component.isValid).toBeTruthy();
    });

    it("Should return false if there are no loaded core coverages", () => {
        // Actors
        component.coreCoverageItems.splice(0);

        // Actions
        const result = component.areAllCoveragesSelected();

        // Asserts
        expect(result).toBeFalsy();
    });

    it("Should return false if at least one coverage is not selected", () => {
        // Actors
        component.coverageItems[0].isSelected = true;
        component.coverageItems[1].isSelected = false;
        component.selectedCoverages = [
            {
                coverageType: getTestCoverageTypes()[0],
            },
        ] as Coverage[];

        // Actions
        const result = component.areAllCoveragesSelected();

        // Asserts
        expect(result).toBeFalsy();
    });

    it("Should return true if all coverages are selected", () => {
        // Actors
        component.coverageItems.forEach((coverageItem) => (coverageItem.isSelected = true));
        component.selectedCoverages = [
            {
                coverageType: getTestCoverageTypes()[0],
            },
            {
                coverageType: getTestCoverageTypes()[1],
            },
            {
                coverageType: getTestCoverageTypes()[2],
            },
            {
                coverageType: getTestCoverageTypes()[3],
            },
            {
                coverageType: getTestCoverageTypes()[4],
            },
            {
                coverageType: getTestCoverageTypes()[5],
            },
        ] as Coverage[];

        // Actions
        const result = component.areAllCoveragesSelected();

        // Asserts
        expect(result).toBeTruthy();
    });

    it("Should return false if no core coverage is selected", () => {
        // Actors
        component.coreCoverageItems.forEach((coverageItem) => (coverageItem.isSelected = false));
        component.selectedCoverages.splice(0);
        // Actions
        const result = component.areAllCoveragesSelected();

        // Asserts
        expect(result).toBeFalsy();
    });

    it("Should toggle selection on all core coverages", () => {
        // Actors
        const numberOfSelectedCoverageItemsInitial = component.coverageItems.filter((coverageItem) => coverageItem.isSelected).length;
        const numberOfSelectedAdditionalCoveragesInitial = component.coverageItems.filter(
            (coverageItem) => coverageItem.isSelected && coverageItem.coverage.coverageType.isAdditionalCoverage
        ).length;

        // Actions
        component.toggleSelectAll();
        const numberOfSelectedCoverageItemsFirst = component.coverageItems.filter((coverageItem) => coverageItem.isSelected).length;
        const numberOfSelectedAdditionalCoveragesFirst = component.coverageItems.filter(
            (coverageItem) => coverageItem.isSelected && coverageItem.coverage.coverageType.isAdditionalCoverage
        ).length;

        component.toggleSelectAll();
        const numberOfSelectedCoverageItemsSecond = component.coverageItems.filter((coverageItem) => coverageItem.isSelected).length;
        const numberOfSelectedAdditionalCoveragesSecond = component.coverageItems.filter(
            (coverageItem) => coverageItem.isSelected && coverageItem.coverage.coverageType.isAdditionalCoverage
        ).length;

        // Asserts
        expect(numberOfSelectedCoverageItemsInitial).toBe(component.coreCoverageItems.length);
        expect(numberOfSelectedAdditionalCoveragesInitial).toBe(0);
        expect(numberOfSelectedCoverageItemsFirst).toBe(0);
        expect(numberOfSelectedAdditionalCoveragesFirst).toBe(0);
        expect(numberOfSelectedCoverageItemsSecond).toBe(component.coreCoverageItems.length);
        expect(numberOfSelectedAdditionalCoveragesSecond).toBe(0);
    });

    it("Should select all core coverages if one of them is already selected", () => {
        // Actors
        component.coverageItems.forEach((coverageItem) => (coverageItem.isSelected = false));
        component.selectedCoverages.splice(0);
        component.coverageItems[0].isSelected = true;
        const numberOfSelectedCoverageItemsInitial = component.coverageItems.filter((coverageItem) => coverageItem.isSelected).length;

        // Actions
        component.toggleSelectAll();
        const numberOfSelectedCoverageItemsFirst = component.coverageItems.filter((coverageItem) => coverageItem.isSelected).length;

        // Asserts
        expect(numberOfSelectedCoverageItemsInitial).toBe(1);
        expect(numberOfSelectedCoverageItemsFirst).toBe(component.coreCoverageItems.length);
    });

    it("should be invalid if no core coverages selected", () => {
        component.coverageItems.forEach((coverageItem: CoverageItem) => component.onDeselection(coverageItem.coverage));
        expect(component.isValid()).toBe(false);

        component.onSelection(component.coverageItems[0].coverage);
        expect(component.isValid()).toBe(true);
    });

    it("should be invalid if no core coverages selected even if additional is selected", () => {
        component.coverageItems.forEach((coverageItem: CoverageItem) => component.onDeselection(coverageItem.coverage));
        expect(component.isValid()).toBe(false);

        component.coverageItems.forEach((coverageItem) => {
            if (coverageItem.coverage.coverageType.isAdditionalCoverage) {
                component.onSelection(coverageItem.coverage);
            }
        });
        expect(component.isValid()).toBe(false);

        component.onSelection(component.coverageItems[0].coverage);
        expect(component.isValid()).toBe(true);
    });

    it("Should select following child coverages when mandatory or hidden on leader section selection", () => {
        const coverageItems = getCoreCoverageItems();
        component.coreCoverageItems = coverageItems;

        const leader = coverageItems[1].childCoverageItems[0];
        const followerHidden = coverageItems[1].childCoverageItems[1];
        const followerMandatory = coverageItems[1].childCoverageItems[1];

        // Actions
        leader.isSelected = false;
        followerHidden.isSelected = false;
        followerMandatory.isSelected = false;
        component.onOptionSelection(leader.coverage);

        // Asserts
        expect(followerHidden.isSelected).toBeFalsy();
        expect(followerMandatory.isSelected).toBeFalsy();
    });

    it("Should unselect following child coverages when mandatory or hidden on leader section selection", () => {
        const coverageItems = getCoreCoverageItems();
        component.coreCoverageItems = coverageItems;

        const leader = coverageItems[1].childCoverageItems[0];
        const followerHidden = coverageItems[1].childCoverageItems[1];
        const followerMandatory = coverageItems[1].childCoverageItems[1];

        // Actions
        leader.isSelected = true;
        followerHidden.isSelected = true;
        followerMandatory.isSelected = true;
        component.onOptionDeselection(leader.coverage);

        // Asserts
        expect(followerHidden.isSelected).toBeTruthy();
        expect(followerMandatory.isSelected).toBeTruthy();
    });

    it("Should remove following child coverages from selected coverages when leader section deselected", () => {
        const coreCoverageItems = getCoreCoverageItems();
        const parentCoverageItem = coreCoverageItems[1];
        const childCoverageItem = coreCoverageItems[1].childCoverageItems[1];
        const leadLimitCodes = ["15"];
        const leadExcessCodes = ["4"];
        component.selectedCoverages = [CoverageModelTestUtilities.translateToCoverage(getCoverageType3353())];
        const childCoverageLength = coreCoverageItems[1].childCoverageItems.length;

        // Actions
        component.selectCoverageIfNeeded(parentCoverageItem, childCoverageItem, leadLimitCodes, leadExcessCodes, false);

        // Asserts
        expect(component.selectedCoverages[0].childCoverages.length).toBe(childCoverageLength);
    });

    it("Should raise warning when coverageAuthorityService raise a warning", () => {
        spyOn(fixture.componentInstance.onWarningChange, "emit");

        // Actions
        coverageAuthorityService.setWarningStatus("TEST", true);

        // Asserts
        expect(fixture.componentInstance.onWarningChange.emit).toHaveBeenCalled();
    });

    it("should sum correct number with TRPDPDL2 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        const mockPropertyFloatingValues = getPropertyFloatingValues();
        // Act
        const propertyLimitNameList: string[] = PropertyLimitConfig.LimitMapper.get("TRPDPDL2");
        let sumLimitValues = component.sumLimitValueFromTemplate(mockPropertyLimits, mockPropertyFloatingValues, propertyLimitNameList);
        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => { return acc + curr.propertyDamageLimit + curr.contentsDamageLimit }, 0);
        sumMockValues += mockPropertyFloatingValues.contentsDamageLimit ?? 0;
        // Assert
        expect(sumLimitValues).toBe(sumMockValues);
    });

    it("should sum correct number with TRBIALL1 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        const mockPropertyFloatingValues = getPropertyFloatingValues();
        // Act
        const propertyLimitNameList: string[] = PropertyLimitConfig.LimitMapper.get("TRBIALL1");
        let sumLimitValues = component.sumLimitValueFromTemplate(mockPropertyLimits, mockPropertyFloatingValues, propertyLimitNameList);
        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => { return acc + curr.actualLossSustainedLimit + curr.increasedCostOfWorkingLimit }, 0);
        sumMockValues += (mockPropertyFloatingValues.actualLossSustainedLimit ?? 0) + (mockPropertyFloatingValues.increasedCostOfWorkingLimit ?? 0);
        // Assert
        expect(sumLimitValues).toBe(sumMockValues);
    });

    it("should sum correct number with TRBIGRL1 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        const mockPropertyFloatingValues = getPropertyFloatingValues();
        // Act
        const propertyLimitNameList: string[] = PropertyLimitConfig.LimitMapper.get("TRBIGRL1");
        let sumLimitValues = component.sumLimitValueFromTemplate(mockPropertyLimits, mockPropertyFloatingValues, propertyLimitNameList);
        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => { return acc + curr.lossOfRentLimit + curr.alternativeAccommodationLimit }, 0);
        sumMockValues += (mockPropertyFloatingValues.lossOfRentLimit ?? 0) + (mockPropertyFloatingValues.alternativeAccommodationLimit ?? 0);
        // Assert
        expect(sumLimitValues).toBe(sumMockValues);
    });

    it("should sum correct number with TRPDPDL1 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        const mockPropertyFloatingValues = getPropertyFloatingValues();
        // Act
        const allPropertyNameList: string[] = component.getAllPropertyLimitNames();
        let sumLimitValues = component.sumLimitValueFromTemplate(mockPropertyLimits, mockPropertyFloatingValues, allPropertyNameList);

        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => {
            return acc + curr.lossOfRentLimit + curr.alternativeAccommodationLimit +
                curr.propertyDamageLimit + curr.contentsDamageLimit +
                curr.increasedCostOfWorkingLimit + curr.actualLossSustainedLimit
        }, 0);
        sumMockValues += (mockPropertyFloatingValues.lossOfRentLimit ?? 0) + (mockPropertyFloatingValues.alternativeAccommodationLimit ?? 0)
            + (mockPropertyFloatingValues.contentsDamageLimit ?? 0) + (mockPropertyFloatingValues.actualLossSustainedLimit ?? 0) +
            (mockPropertyFloatingValues.increasedCostOfWorkingLimit ?? 0);
        // Assert
        expect(sumLimitValues).toBe(sumMockValues);
    });

    function getPropertyLimits(): PropertyLimit[] {
        return [
            {
                contentsDamageLimit: 10000,
                stockDamageLimit: 10000,
                actualLossSustainedLimit: 15000,
                grossRentalLimit: 20000,
                insuredAddress: new ClientLocation(),
                additionalIncreasedCostOfWorkingLimit: 10000,
                increasedCostOfWorkingLimit: 10000,
                propertyDamageLimit: 10000,
                alternativeAccommodationLimit: 10000,
                lossOfRentLimit: 10000,
                totalInsuredValue: 60000
            },
            {
                contentsDamageLimit: 10000,
                stockDamageLimit: 10000,
                actualLossSustainedLimit: 10000,
                grossRentalLimit: 10000,
                insuredAddress: new ClientLocation(),
                additionalIncreasedCostOfWorkingLimit: 10000,
                increasedCostOfWorkingLimit: 10000,
                propertyDamageLimit: 10000,
                alternativeAccommodationLimit: 10000,
                lossOfRentLimit: 10000,
                totalInsuredValue: 60000
            },
        ];
    }

    function getPropertyFloatingValues(): PropertyLimitFloatingValues {
        return {
            contentsDamageLimit: 10000,
            actualLossSustainedLimit: 10000,
            increasedCostOfWorkingLimit: 10000,
            lossOfRentLimit: 10000,
            alternativeAccommodationLimit: 10000,
        };
    }

    function getCoreCoverageItems(): CoverageItem[] {
        const coverageType3351 = getCoverageType3351();
        const coverageType3353 = getCoverageType3353();

        return [
            {
                childCoverageItems: [
                    {
                        childCoverageItems: [],
                        coverage: {
                            coverageType: coverageType3351.childCoverageTypes[0],
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 12,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3351.childCoverageTypes[0].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 1,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3351.childCoverageTypes[0].excessTypes[0],
                                },
                            ],
                        },
                        isSelected: true,
                        leadLimits: getLeadLimits(),
                        leadExcesses: getLeadExcesses(),
                    },
                ],
                coverage: {
                    coverageType: coverageType3351,
                    childCoverages: [
                        {
                            coverageType: coverageType3351.childCoverageTypes[0],
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 12,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3351.childCoverageTypes[0].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 1,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3351.childCoverageTypes[0].excessTypes[0],
                                },
                            ],
                        },
                    ],
                    isExpanded: true,
                },
                isSelected: true,
                leadLimits: getLeadLimits(),
                leadExcesses: getLeadExcesses(),
            },
            {
                childCoverageItems: [
                    {
                        childCoverageItems: [],
                        coverage: {
                            coverageType: {
                                id: 4306,
                                name: "SECTION A: INDIVIDUAL COVER",
                                isMandatory: false,
                                businessLine: null,
                                insuringClauseCode: null,
                                insuringClauseSectionCode: null,
                                childCoverageTypes: null,
                                limitTypes: [coverageType3353.childCoverageTypes[0].limitTypes[0]],
                                excessTypes: [coverageType3353.childCoverageTypes[0].excessTypes[0]],
                                isAdditionalCoverage: false,
                                additionalCoverageCategories: null,
                                order: 1,
                            },
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 15,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3353.childCoverageTypes[0].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 4,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3353.childCoverageTypes[0].excessTypes[0],
                                },
                            ],
                        },
                        isSelected: true,
                        leadLimits: getLeadLimits(),
                        leadExcesses: getLeadExcesses(),
                    },
                    {
                        childCoverageItems: [],
                        coverage: {
                            coverageType: {
                                id: 4307,
                                name: "SECTION B: FUND REIMBURSEMENT COVER",
                                isMandatory: false,
                                businessLine: null,
                                insuringClauseCode: null,
                                insuringClauseSectionCode: {
                                    name: "DOIFCL",
                                    description: "Investment fund civil liability",
                                },
                                childCoverageTypes: null,
                                limitTypes: [coverageType3353.childCoverageTypes[1].limitTypes[0]],
                                excessTypes: [coverageType3353.childCoverageTypes[1].excessTypes[0]],
                                isAdditionalCoverage: false,
                                additionalCoverageCategories: null,
                                order: 2,
                            },
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 16,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3353.childCoverageTypes[1].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 5,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3353.childCoverageTypes[1].excessTypes[0],
                                },
                            ],
                        },
                        isSelected: true,
                        leadLimits: getLeadLimits(),
                        leadExcesses: getLeadExcesses(),
                    },
                    {
                        childCoverageItems: [],
                        coverage: {
                            coverageType: {
                                id: 4308,
                                name: "SECTION C: COVER FOR NON-EXECUTIVE DIRECTORS",
                                isMandatory: false,
                                businessLine: null,
                                insuringClauseCode: null,
                                insuringClauseSectionCode: null,
                                childCoverageTypes: null,
                                limitTypes: [coverageType3353.childCoverageTypes[2].limitTypes[0]],
                                excessTypes: [coverageType3353.childCoverageTypes[2].excessTypes[0]],
                                isAdditionalCoverage: false,
                                additionalCoverageCategories: null,
                                order: 3,
                            },
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 17,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3353.childCoverageTypes[2].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 6,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3353.childCoverageTypes[2].excessTypes[0],
                                },
                            ],
                        },
                        isSelected: true,
                        leadLimits: getLeadLimits(),
                        leadExcesses: getLeadExcesses(),
                    },
                ],
                coverage: {
                    coverageType: coverageType3353,
                    childCoverages: [
                        {
                            coverageType: coverageType3353.childCoverageTypes[0],
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 15,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3353.childCoverageTypes[0].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 4,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3353.childCoverageTypes[0].excessTypes[0],
                                },
                            ],
                        },
                        {
                            coverageType: coverageType3353.childCoverageTypes[1],
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 16,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3353.childCoverageTypes[1].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 5,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3353.childCoverageTypes[1].excessTypes[0],
                                },
                            ],
                        },
                        {
                            coverageType: coverageType3353.childCoverageTypes[2],
                            childCoverages: [],
                            limits: [
                                {
                                    limitTypeId: 17,
                                    limit: 1000000,
                                    limitBasis: 1,
                                    costBasis: 1,
                                    coverageLimitType: coverageType3353.childCoverageTypes[2].limitTypes[0],
                                },
                            ],
                            excesses: [
                                {
                                    coverageExcessTypeId: 6,
                                    excess: null,
                                    excessBasisId: 0,
                                    excessType: coverageType3353.childCoverageTypes[2].excessTypes[0],
                                },
                            ],
                        },
                    ],
                    isExpanded: true,
                },
                isSelected: true,
                leadLimits: getLeadLimits(),
                leadExcesses: getLeadExcesses(),
            },
        ] as CoverageItem[];
    }

    function getCoverageType3353(): CoverageType {
        return {
            id: 3353,
            name: "INSURING CLAUSE 2: INVESTMENT FUND MANAGEMENT LIABILITY COVER",
            isMandatory: false,
            businessLine: {
                name: "DO",
                description: "Directors and Officers",
            },
            insuringClauseCode: null,
            insuringClauseSectionCode: null,
            childCoverageTypes: [
                {
                    id: 4306,
                    name: "SECTION A: INDIVIDUAL COVER",
                    isMandatory: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: null,
                    childCoverageTypes: null,
                    limitTypes: [
                        {
                            limitTypeId: 15,
                            limitTypeCode: null,
                            order: null,
                            followLimitTypeId: null,
                            isReadOnly: false,
                            isHidden: false,
                            isMandatory: false,
                            defaultLimit: 1000000,
                            limitFollowMultiplicationFactor: 1,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
                            availableLimitBasis: {
                                1: "Any one claim",
                                2: "Maximum per day",
                                3: "Annual Aggregate",
                            },
                            availableCostBasis: {
                                1: "Costs Inclusive",
                                2: "Costs in Addition, Unlimited",
                                3: "Costs in Addition, Capped at limit",
                                4: "Costs in Addition, Capped at lower of 1m or limit",
                                5: "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: ["XX"]
                        } as CoverageLimitType,
                    ],
                    excessTypes: [
                        {
                            coverageExcessTypeId: 4,
                            excessTypeCode: null,
                            order: null,
                            followExcessTypeId: null,
                            description: "Excess",
                            isReadOnly: false,
                            isHidden: false,
                            isMandatory: false,
                            defaultExcess: null,
                            excessFollowMultiplicationFactor: 1,
                            defaultExcessBasis: 0,
                            availableExcessBasis: {
                                1: "Costs Inclusive",
                                2: "Costs Exclusive",
                            },
                            followExcessCodes: ["XX"]
                        } as CoverageExcessType,
                    ],
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 1,
                } as CoverageType,
                {
                    id: 4307,
                    name: "SECTION B: FUND REIMBURSEMENT COVER",
                    isMandatory: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: {
                        name: "DOIFCL",
                        description: "Investment fund civil liability",
                    } as Tag,
                    childCoverageTypes: null,
                    limitTypes: [
                        {
                            limitTypeId: 16,
                            limitTypeCode: null,
                            order: null,
                            followLimitTypeId: 15,
                            isReadOnly: false,
                            isHidden: true,
                            isMandatory: false,
                            defaultLimit: 1000000,
                            limitFollowMultiplicationFactor: 1,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
                            availableLimitBasis: {
                                1: "Any one claim",
                                2: "Maximum per day",
                                3: "Annual Aggregate",
                            },
                            availableCostBasis: {
                                1: "Costs Inclusive",
                                2: "Costs in Addition, Unlimited",
                                3: "Costs in Addition, Capped at limit",
                                4: "Costs in Addition, Capped at lower of 1m or limit",
                                5: "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: ["XX"]
                        } as CoverageLimitType,
                    ],
                    excessTypes: [
                        {
                            coverageExcessTypeId: 5,
                            excessTypeCode: null,
                            order: null,
                            followExcessTypeId: 4,
                            description: "Excess",
                            isReadOnly: false,
                            isHidden: true,
                            isMandatory: false,
                            defaultExcess: null,
                            excessFollowMultiplicationFactor: 1,
                            defaultExcessBasis: 0,
                            availableExcessBasis: {
                                1: "Costs Inclusive",
                                2: "Costs Exclusive",
                            },
                            followExcessCodes: ["XX"]
                        } as CoverageExcessType,
                    ],
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 2,
                } as CoverageType,
                {
                    id: 4308,
                    name: "SECTION C: COVER FOR NON-EXECUTIVE DIRECTORS",
                    isMandatory: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: null,
                    childCoverageTypes: null,
                    limitTypes: [
                        {
                            limitTypeId: 17,
                            limitTypeCode: "",
                            order: 1,
                            followLimitTypeId: 15,
                            isReadOnly: false,
                            isHidden: false,
                            isMandatory: true,
                            defaultLimit: 1000000,
                            limitFollowMultiplicationFactor: 1,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
                            availableLimitBasis: {
                                1: "Any one claim",
                                2: "Maximum per day",
                                3: "Annual Aggregate",
                            },
                            availableCostBasis: {
                                1: "Costs Inclusive",
                                2: "Costs in Addition, Unlimited",
                                3: "Costs in Addition, Capped at limit",
                                4: "Costs in Addition, Capped at lower of 1m or limit",
                                5: "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: ["XX"]
                        } as CoverageLimitType,
                    ],
                    excessTypes: [
                        {
                            coverageExcessTypeId: 6,
                            excessTypeCode: "",
                            order: 1,
                            followExcessTypeId: 4,
                            description: "Excess",
                            isReadOnly: false,
                            isHidden: false,
                            isMandatory: true,
                            defaultExcess: null,
                            excessFollowMultiplicationFactor: 1,
                            defaultExcessBasis: 0,
                            availableExcessBasis: {
                                1: "Costs Inclusive",
                                2: "Costs Exclusive",
                            },
                            followExcessCodes: ["XX"]
                        } as CoverageExcessType,
                    ],
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 3,
                } as CoverageType,
            ],
            limitTypes: null,
            excessTypes: null,
            isAdditionalCoverage: false,
            additionalCoverageCategories: null,
            order: 2,
        } as CoverageType;
    }

    function getCoverageType3351(): CoverageType {
        return {
            id: 3351,
            name: "INSURING CLAUSE 1: INVESTMENT MANAGER AND FUND CIVIL LIABILITY",
            isMandatory: false,
            businessLine: {
                name: "EO",
                description: "Professional indemnity E&O",
            } as Tag,
            insuringClauseCode: null,
            insuringClauseSectionCode: null,
            childCoverageTypes: [
                {
                    id: 4300,
                    name: "SECTION A: INVESTMENT MANAGER AND FUND CIVIL LIABILITY",
                    isMandatory: false,
                    businessLine: null,
                    insuringClauseCode: null,
                    insuringClauseSectionCode: {
                        name: "DOIMPCL",
                        description: "Investment manager professional civil liability ",
                    },
                    childCoverageTypes: null,
                    limitTypes: [
                        {
                            limitTypeId: 12,
                            limitTypeCode: "",
                            order: 1,
                            followLimitTypeId: 16,
                            isReadOnly: true,
                            isHidden: false,
                            isMandatory: false,
                            defaultLimit: 1000000,
                            limitFollowMultiplicationFactor: 1,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
                            availableLimitBasis: {
                                1: "Any one claim",
                                2: "Maximum per day",
                                3: "Annual Aggregate",
                            },
                            availableCostBasis: {
                                1: "Costs Inclusive",
                                2: "Costs in Addition, Unlimited",
                                3: "Costs in Addition, Capped at limit",
                                4: "Costs in Addition, Capped at lower of 1m or limit",
                                5: "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: ["XX"]
                        } as CoverageLimitType,
                    ],
                    excessTypes: [
                        {
                            coverageExcessTypeId: 1,
                            excessTypeCode: "",
                            order: 1,
                            followExcessTypeId: null,
                            description: "Excess",
                            isReadOnly: false,
                            isHidden: false,
                            isMandatory: false,
                            defaultExcess: null,
                            excessFollowMultiplicationFactor: 1,
                            defaultExcessBasis: 0,
                            availableExcessBasis: {
                                1: "Costs Inclusive",
                                2: "Costs Exclusive",
                            },
                            followExcessCodes: ["XX"]
                        } as CoverageExcessType,
                    ],
                    isAdditionalCoverage: false,
                    additionalCoverageCategories: null,
                    order: 1,
                },
            ],
            limitTypes: null,
            excessTypes: null,
            isAdditionalCoverage: false,
            additionalCoverageCategories: null,
            order: 1,
        } as CoverageType;
    }

    function getLeadLimits(): { [id: number]: CoverageLimit } {
        return {
            16: {
                limitTypeId: 16,
                limit: 1000000,
                limitBasis: 1,
                costBasis: 1,
                subLimitCap: null,
                coverageLimitType: {
                    limitTypeId: 16,
                    limitTypeCode: "",
                    order: 1,
                    followLimitTypeId: null,
                    isReadOnly: false,
                    isHidden: false,
                    isMandatory: false,
                    defaultLimit: 1000000,
                    limitFollowMultiplicationFactor: 1,
                    defaultLimitBasis: 1,
                    defaultCostBasis: 1,
                    subLimitCap: null,
                    cap: null,
                    availableLimitBasis: {
                        1: "Any one claim",
                        2: "Maximum per day",
                        3: "Annual Aggregate",
                    },
                    availableCostBasis: {
                        1: "Costs Inclusive",
                        2: "Costs in Addition, Unlimited",
                        3: "Costs in Addition, Capped at limit",
                        4: "Costs in Addition, Capped at lower of 1m or limit",
                        5: "Costs in Addition, Capped at 10%",
                    },
                    followLimitCodes: ["XX"]
                },
            },
        };
    }

    function getLeadExcesses(): { [id: number]: CoverageExcess } {
        return {
            4: {
                coverageExcessTypeId: 4,
                excess: null,
                excessBasisId: 0,
                excessType: {
                    coverageExcessTypeId: 4,
                    excessTypeCode: "",
                    order: 1,
                    followExcessTypeId: null,
                    description: "Excess",
                    isReadOnly: false,
                    isHidden: false,
                    isMandatory: false,
                    defaultExcess: null,
                    excessFollowMultiplicationFactor: 1,
                    defaultExcessBasis: 0,
                    availableExcessBasis: {
                        1: "Costs Inclusive",
                        2: "Costs Exclusive",
                    },
                    followExcessCodes: ["XX"]
                },
            },
        };
    }

    function getTestCoverageTypes() {
        return [
            {
                id: 1,
                isAdditionalCoverage: false,
                name: "Directors & Officers",
                businessLine: {
                    name: "DO",
                },
                childCoverageTypes: [{ name: "test" }] as CoverageType[],
                isSelectedByDefault: true,
                insuringClauseCode: { name: "DO", description: "" },
                insuringClauseSectionCode: {}
            } as CoverageType,
            {
                id: 2,
                isAdditionalCoverage: false,
                name: "Corporate Liability",
                businessLine: {
                    name: "CL",
                },
                childCoverageTypes: [{ name: "test" }] as CoverageType[],
                isSelectedByDefault: true,
                insuringClauseCode: { name: "CLCL", description: "" },
                insuringClauseSectionCode: {}
            } as CoverageType,
            {
                id: 3,
                isAdditionalCoverage: false,
                name: "Employment Practices Liability",
                insuringClauseCode: { name: "EPL", description: "" },
                insuringClauseSectionCode: {},
                isSelectedByDefault: true,
            } as CoverageType,
            {
                id: 4,
                isAdditionalCoverage: false,
                name: "Cyber, Privacy, Media",
                isSelectedByDefault: true,
                insuringClauseCode: { name: "CPM", description: "" },
                insuringClauseSectionCode: {}
            } as CoverageType,
            {
                id: 5,
                isAdditionalCoverage: false,
                name: "Crime",
                isSelectedByDefault: true,
                insuringClauseCode: { name: "CR", description: "" },
                insuringClauseSectionCode: {}
            } as CoverageType,
            {
                id: 6,
                isAdditionalCoverage: false,
                name: "Kidnap & Ransom",
                isSelectedByDefault: true,
                insuringClauseCode: { name: "KR", description: "" },
                insuringClauseSectionCode: {}
            } as CoverageType,
            {
                id: 7,
                isAdditionalCoverage: true,
                name: "TRIA",
                isSelectedByDefault: false,
                additionalCoverageCategories: [
                    {
                        name: "GL",
                        description: "General Liability",
                    },
                ],
                insuringClauseCode: { name: "TR", description: "" },
                insuringClauseSectionCode: {}
            } as CoverageType,
        ] as CoverageType[];
    }
});

@Component({ selector: "coverage", template: "" })
class MockCoverageComponent implements IsValid, MarkAsTouched {
    @Input() public coverageItem: CoverageItem;
    @Input() public isSelected: boolean;
    @Input() public currency: Currency;
    @Input() public isFirstLoad: boolean;
    @Output() public isSelectedChange = new EventEmitter<boolean>();
    @Output() public onSelection = new EventEmitter<Coverage>();
    @Output() public onDeselection = new EventEmitter<Coverage>();
    @Output() public onClearVisited = new EventEmitter();
    @Input() public readonly: boolean = false;

    public isValid(): boolean {
        return true;
    }
    public coverage: Coverage;
    public markAsTouched(): void {
        return;
    }
}

@Injectable()
class MockUserService {
    isFeatureAccessible(featureName: string) {
        return true;
    }
    public getUser() {
        const contact = new CfcContact();
        contact.cfcContactId = 123;
        return contact;
    }
}

// tslint:disable-next-line:max-classes-per-file
@Injectable()
class MockBinderValidationService {
    public loadBinderValidationCriterias(draftQuoteId: string, businessLineCodes: string) { }

    public get binderValidationCriterias(): {
        [businessCategoryTagName: string]: BinderValidationCriteria[];
    } {
        const criterias: { [businessCategoryTagName: string]: BinderValidationCriteria[] } = {};

        criterias.DO = [{ binderSectionId: 1 }, { binderSectionId: 2 }] as BinderValidationCriteria[];
        criterias.CL = [{ binderSectionId: 1 }, { binderSectionId: 3 }] as BinderValidationCriteria[];

        return criterias;
    }

    public getBusinessLineCodes(newCoverageTypes: CoverageType[]) { }

    public getTerrorismBinderSectionId(): number {
        return 1;
    }
}

@Injectable()
class MockQuoteService {
    public getCurrency(): Currency {
        return { isoCode: "USD", rate: 1 } as Currency;
    }
}
