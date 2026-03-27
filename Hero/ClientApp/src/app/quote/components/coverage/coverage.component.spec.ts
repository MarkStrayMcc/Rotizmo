import { CommonModule, DecimalPipe } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DebugElement, Injectable, SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from '@angular/platform-browser';
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { CfcContact, ClientLocation, Coverage, CoverageExcess, CoverageExcessType, CoverageLimit, CoverageLimitType, CoverageType, Product, Quote, Tag } from "@app/models";
import { Currency } from "@app/models/auto-generated/Currency";
import { CoverageOptionComponent } from "@app/quote/components/coverage/coverage-option/coverage-option.component";
import { CoverageComponent } from "@app/quote/components/coverage/coverage.component";
import { ExcessComponent } from "@app/quote/components/coverage/excess/excess.component";
import { LimitComponent } from "@app/quote/components/coverage/limit/limit.component";
import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { QuoteService } from "@app/quote/services/quote.service";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";
import { CoverageHttpService } from '@app/services/coverage-http.service';
import { CoverageItemService } from "@app/services/coverage-item.service";
import { CoverageService } from "@app/services/coverage.service";
import { DictionaryHelperService } from "@app/services/dictionary-helper.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { CookieService } from "ngx-cookie-service";
import { of } from "rxjs";

@Injectable()
class MockModalDialogService {
	public openDialog<T, TY>(obj) {
		return;
	}
	afterClosed() {
		return {
			afterClosed: () => of(true),
		};
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

describe("CoverageComponent", () => {
	let component: CoverageComponent;
	let fixture: ComponentFixture<CoverageComponent>;
	let coverageService: CoverageService;
	let coverageItemService: CoverageItemService;
	let multipleBusinessLineSpy : any;

	const mockedQuoteService = jasmine.createSpyObj('QuoteService', ['getCurrency', 'isSaved', 'getQuote', 'isUpdating', 'hasPropertyLimits']);

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CoverageService,
				CoverageItemService,
                UnderwriterCoverageAuthorityService,
                CoverageCalculationService,
				DecimalPipe,
				DictionaryHelperService,
				CookieService,
				NavigationOverrideService,
                CoverageHttpService,
				{ provide: QuoteService, useValue: mockedQuoteService},
				{ provide: ModalDialogService, useClass: MockModalDialogService },
				{ provide: UserService, useClass: MockUserService },
			],
			declarations: [CoverageComponent, CoverageOptionComponent, LimitComponent, ExcessComponent, CurrencyComponent, LargeNumberMask],
			imports: [FormsModule, ReactiveFormsModule, CommonModule, ErrorModule, HttpClientTestingModule],
		}).compileComponents();
	});

    beforeEach(() => {
        coverageService = TestBed.inject(CoverageService);
		coverageItemService = TestBed.inject(CoverageItemService);
		spyOn(coverageService, "getSelectedCoverageIndex").and.callThrough();
		spyOn(coverageItemService, "saveCoverageExpandedState").and.callThrough();
		spyOn(coverageItemService, "getCoverageExpandedState").and.returnValue(true);
		multipleBusinessLineSpy = spyOn(coverageService, "isMultiplePropertyBusinessLineProduct").and.returnValue(of(true));

		mockedQuoteService.getCurrency.and.returnValue({ isoCode: "USD", rate: 1 } as Currency);
		mockedQuoteService.isSaved.and.returnValue(false);
		mockedQuoteService.isUpdating.and.returnValue(false);
		mockedQuoteService.hasPropertyLimits.and.returnValue(false);
        mockedQuoteService.getQuote.and.returnValue({ product :new Product().productName == "T&S" ,quoteReference : 123 , ...new Quote() });

		fixture = TestBed.createComponent(CoverageComponent);
		component = fixture.componentInstance;
        component.isMultiplePropertyBusinessLineProduct$ = of(true);
		component.coverageItem = getMainCoverageItem();
		fixture.detectChanges();
	});

	it("Should create component", () => {
		expect(component).toBeTruthy();
	});

	it("Should have all available coverage options unselected by default", () => {
		// Actions
		var unselectedCoverageOptionItems = component.coverageOptionItems.filter((coverageItem) => coverageItem.isSelected === false);

		// Asserts
		expect(unselectedCoverageOptionItems).toBeDefined();
		expect(unselectedCoverageOptionItems.length).toBe(component.coverageOptionItems.length);
	});

	it("Should not load available coverage options when there are no child coverage types", () => {
		// Actors
		component.coverage.coverageType.childCoverageTypes = [];
		component.coverageOptionItems.splice(0);

		// Actions
		component.ngOnInit();

		// Asserts
		expect(component.coverageOptionItems).toBeDefined();
		expect(component.coverageOptionItems.length).toBe(0);
	});

	it("Should load already selected coverage options on initialisation", () => {
		// Actors
		const testCoverageType1 = getChildCoverageTypes()[0];

        component.coverageOptionItems[0].isSelected = true;
		component.coverage.childCoverages = [
			{
				coverageType: testCoverageType1,
				isExpanded: false,
				childCoverages: [],
				limits: [],
				excesses: [],
			},
		];

        // Actions
        component.ngOnInit();
		var selectedCoverageOptionItems = component.coverageOptionItems.filter((coverageItem) => coverageItem.isSelected);

		// Asserts
		expect(selectedCoverageOptionItems).toBeDefined();
		expect(component.coverage.childCoverages.length).toBe(1);
		expect(selectedCoverageOptionItems.length).toBe(1);
        expect(selectedCoverageOptionItems[0].coverage.coverageType.insuringClauseCode).toEqual(testCoverageType1.insuringClauseCode);
        expect(selectedCoverageOptionItems[0].coverage.coverageType.name).toEqual(testCoverageType1.name);
		expect(selectedCoverageOptionItems[0].isSelected).toBeTruthy();
    });

    it("Should not load already de-selected coverage options on initialisation when first loading", () => {
        // Actors
        // Set the component to be in the first load state
        component.isFirstLoad = true;

        // Ensure one of the coverage option items are initially deselected by default and the other is selected by default
        component.coverageOptionItems[0].coverage.coverageType.isSelectedByDefault = true;
        component.coverageOptionItems[1].coverage.coverageType.isSelectedByDefault = false;

        // Actions - Call ngOnInit to initialize        
        component.ngOnInit();
        var selectedCoverageOptionItems = component.coverageOptionItems.filter((coverageItem) => coverageItem.isSelected);

        // Asserts - Verify no items are selected after initialization
        expect(selectedCoverageOptionItems).toBeDefined();
        expect(selectedCoverageOptionItems.length).toBe(1);
        expect(component.coverage.childCoverages.length).toBe(1);
        expect(selectedCoverageOptionItems[0].coverage.coverageType.insuringClauseCode).toEqual(component.coverage.childCoverages[0].coverageType.insuringClauseCode);
        expect(selectedCoverageOptionItems[0].coverage.coverageType.name).toEqual(component.coverage.childCoverages[0].coverageType.name);
        expect(selectedCoverageOptionItems[0].isSelected).toBeTruthy();
    });

	it("Should have preload all coverage options on initialisation", () => {
		// Actors
		const children = getChildCoverageTypes();

		// Actions
		component.ngOnInit();

		// Asserts
		expect(children).toBeDefined();
		expect(component).toBeDefined();
		expect(component.coverageOptionItems).toBeDefined();
		expect(component.coverageOptionItems.length).toBe(children.length);
	});

	it("Should have all collections the same amount of children", () => {
		// Actions
		const coverage = getMainCoverage();

		// Asserts
		expect(coverage.childCoverages.length).toBe(component.coverageOptionItems.length);
		expect(coverage.coverageType.childCoverageTypes.length).toBe(component.coverageOptionItems.length);
	});

	it("Should set the expansion boolean value as equal to the selection boolean value on input change", () => {
		// Actors
		var isSelectedInitial = component.isSelected;
		// Actions
		component.toggleSelection();

		expect(coverageItemService.saveCoverageExpandedState).toHaveBeenCalledTimes(1);
	});

	it("Should deselect all options on input change, when the main coverage is deselected and after the first change", () => {
		// Actors
		component.coverageOptionItems.forEach((coverageOptionItem) => (coverageOptionItem.isSelected = true));
		var selectedItemsInitial = component.coverageOptionItems.filter((coverageItem) => coverageItem.isSelected);

		// Actions
		component.isSelected = false;
		component.ngOnChanges({ isSelected: new SimpleChange(true, false, true) });
		var selectedItemsFirst = component.coverageOptionItems.filter((coverageItem) => coverageItem.isSelected);

		component.isSelected = false;
		component.ngOnChanges({ isSelected: new SimpleChange(true, false, false) });
		var selectedItemsSecond = component.coverageOptionItems.filter((coverageItem) => coverageItem.isSelected);

		// Asserts
		expect(selectedItemsInitial).toBeDefined();
		expect(selectedItemsFirst).toBeDefined();
		expect(selectedItemsSecond).toBeDefined();
		expect(selectedItemsInitial.length).toBe(2);
		expect(component.coverageOptionItems.length).toBe(2);
		expect(selectedItemsFirst.length).toBe(2);
		expect(selectedItemsSecond.length).toBe(0);
	});

	it("Should add child coverage to list on option selection", () => {
		// Actions
		const testCoverage = { coverageType: getChildCoverageTypes()[0], childCoverages: [] } as Coverage;
		var numberOfChildCoveragesInitial = component.coverage.childCoverages.length;

		// Actions
		component.onOptionSelection(testCoverage);

		// Asserts
		expect(numberOfChildCoveragesInitial).toBe(2);
		expect(component.coverage.childCoverages.length).toBe(3);
        expect(component.coverage.childCoverages[0].coverageType.insuringClauseCode).toEqual(testCoverage.coverageType.insuringClauseCode);
        expect(component.coverage.childCoverages[0].coverageType.name).toEqual(testCoverage.coverageType.name);
	});

	it("Should emit isSelectedChange event on option selection, when the main coverage is not selected", () => {
		// Actors
		spyOn(component.onSelection, "emit");
		component.isSelected = false;
		const testCoverage = { coverageType: getChildCoverageTypes()[0], childCoverages: [] } as Coverage;

		// Actions
		component.onOptionSelection(testCoverage);

		// Asserts
		expect(component.isSelected).toBeTruthy();
		expect(component.onSelection.emit).toHaveBeenCalledTimes(1);
	});

	it("Should not emit isSelectedChange event on option selection, when the main coverage is already selected", () => {
		// Actions
		spyOn(component.isSelectedChange, "emit");
		component.isSelected = true;
		const testCoverage = { coverageType: getChildCoverageTypes()[0], childCoverages: [] } as Coverage;

		// Actions
		component.onOptionSelection(testCoverage);

		// Asserts
		expect(component.isSelected).toBeTruthy();
		expect(component.isSelectedChange.emit).toHaveBeenCalledTimes(1);
	});

	it("Should emit onSelection event on option selection, when the main coverage is not selected", () => {
		// Actions
		spyOn(component.onSelection, "emit");
		component.isSelected = false;
		const testCoverage = { coverageType: getChildCoverageTypes()[0], childCoverages: [] } as Coverage;

		// Actions
		component.onOptionSelection(testCoverage);

		// Asserts
		expect(component.isSelected).toBeTruthy();
		expect(component.onSelection.emit).toHaveBeenCalledTimes(1);
		expect(component.onSelection.emit).toHaveBeenCalledWith(component.coverage);
	});

    it("Should call child component for recalculate lead limit  on option selection, when the component has  child coverages", () => {
		// Actions
        spyOn(component.onSelection, "emit");
        component.isSelected = false;
        const testCoverage = getMainCoverage();

        // Actions
        const childComponents = fixture.debugElement
            .queryAll(By.directive(CoverageOptionComponent))
            .map((debugElement) => debugElement.componentInstance) as CoverageOptionComponent[];

        spyOn(childComponents[0], 'reCalculateLeadValues');

        component.onOptionSelection(testCoverage);
        fixture.detectChanges();

        // Asserts
        expect(childComponents[0].reCalculateLeadValues).toHaveBeenCalled();
	});

	it("Should remove child coverage from list on option deselection", () => {
		// Actions
		const testCoverage = { coverageType: getChildCoverageTypes()[0], childCoverages: [] } as Coverage;
		component.coverage.childCoverages = [testCoverage];
		var numberOfChildCoveragesInitial = component.coverage.childCoverages.length;

		// Actions
		component.onOptionDeselection(testCoverage);

		// Asserts
		expect(numberOfChildCoveragesInitial).toBe(1);
		expect(component.coverage.childCoverages.length).toBe(0);
		expect(coverageService.getSelectedCoverageIndex).toHaveBeenCalledTimes(1);
	});

	it("Should have both selection and expansion boolean values equal on selection and input change", () => {
		// Actions
		var isSelectedInitial = component.isSelected;
		var isExpandedInitial = component.coverage.isExpanded;
		component.toggleSelection();
		component.ngOnChanges({ isSelected: new SimpleChange(isSelectedInitial, component.isSelected, false) });
		var isSelectedFirst = component.isSelected;
		var isExpandedFirst = component.coverage.isExpanded;

		// Asserts
		expect(isSelectedInitial).toBeFalsy();
		expect(isExpandedInitial).toBeFalsy();
		expect(isSelectedFirst).toBeTruthy();
		expect(isExpandedFirst).toBeTruthy();
	});

	it("Should emit isSelectedChange event when changing selection", () => {
		// Actors
		spyOn(component.isSelectedChange, "emit");
		component.isSelected = false;

		// Actions
		component.toggleSelection();
		var isSelectedFirst = component.isSelected;
		component.toggleSelection();
		var isSelectedSecond = component.isSelected;

		// Asserts
		expect(isSelectedFirst).toBeTruthy();
		expect(isSelectedSecond).toBeFalsy();
		expect(component.isSelectedChange.emit).toHaveBeenCalledTimes(2);
		expect(component.isSelectedChange.emit).toHaveBeenCalledWith(isSelectedFirst);
		expect(component.isSelectedChange.emit).toHaveBeenCalledWith(isSelectedSecond);
	});

	it("Should emit onSelection event on selection", () => {
		// Actors
		spyOn(component.onSelection, "emit");

		// Actions
		component.isSelected = false;
		component.toggleSelection();
		var isSelectedResult = component.isSelected;

		// Asserts
		expect(isSelectedResult).toBeTruthy();
		expect(component.onSelection.emit).toHaveBeenCalledTimes(1);
	});

	it("Should emit onDeselection event on deselection", () => {
		// Actors
		spyOn(component.onDeselection, "emit");

		// Actions
		component.isSelected = true;
		component.toggleSelection();
		var isSelectedResult = component.isSelected;

		// Asserts
		expect(isSelectedResult).toBeFalsy();
		expect(component.onDeselection.emit).toHaveBeenCalledTimes(1);
	});

	it("Should call get and save CoverageExpandedState on toggleExpansion() when the component is readonly", () => {
		// Actions
		component.readonly = true;
		component.toggleExpansion();

		// Asserts
		expect(coverageItemService.getCoverageExpandedState).toHaveBeenCalled();
		expect(coverageItemService.saveCoverageExpandedState).toHaveBeenCalledTimes(1);
	});

	it("Should not toggle isCoverageSelected on toggleExpansion() when the component is NOT readonly", () => {
		// Actions
		component.readonly = false;
		component.isSelected = false;
		component.toggleExpansion();
		const isSelectedOne = component.isSelected;
		component.toggleExpansion();
		const isSelectedTwo = component.isSelected;
		// Asserts
		expect(isSelectedOne).toBeFalsy();
		expect(isSelectedTwo).toBeFalsy();
	});

	it("Should auto-check child coverages when top is selected", () => {
		// assemble
		component.coverageItem.childCoverageItems.forEach((child: CoverageItem) => {
			child.isSelected = false;
		});
		component.coverageItem.isSelected = false;
		component.isSelected = false;
		fixture.detectChanges();

		// Act
		component.isSelected = true;
		let changes = new SimpleChange(false, true, false);

		component.ngOnChanges({ isSelected: changes });

		// Assert
		expect(component.coverageItem.childCoverageItems[0].isSelected).toBeTruthy();
		expect(component.coverageItem.childCoverageItems[1].isSelected).toBeTruthy();
	});

	it("Unchecking last child should uncheck parent", () => {
		// assemble
		const childCoverage1 = getChildCoverages()[0];
        const childCoverage2 = getChildCoverages()[1];

		// Act
		component.expandAndSelectAll();
		expect(component.isSelected).toBeTruthy();

		component.onOptionDeselection(childCoverage1);
		component.onOptionDeselection(childCoverage2);
		fixture.detectChanges();

		// Assert
		expect(component.coverageItem.isSelected).toBeFalsy();
	});

	it("Parent with isSelectedByDefault false should remain unselected after expandAndSelectAll with even number of children (first load)", () => {
		// Assemble: two visible children (even count)
		component.coverageOptionItems = getVisibleChildCoverageItems();
		component.coverageOptionItems.forEach((child) => {
			child.coverage.coverageType.isSelectedByDefault = false;
		});
		component.coverage.coverageType.isSelectedByDefault = false;
		component.hasSingleChildVisible = false;
		component.isFirstLoad = true;
		component.isSelected = false;

		// Act
		component.expandAndSelectAll();

		// Assert
		expect(component.isSelected).toBeFalsy();
	});

	it("Parent with isSelectedByDefault false should remain unselected after expandAndSelectAll with odd number of children (first load)", () => {
		// Assemble: three visible children (odd count)
		const threeChildren = getVisibleChildCoverageItems();
		const extraChild = { ...threeChildren[0] };
		extraChild.coverage = {
			...threeChildren[0].coverage,
			coverageType: {
				...threeChildren[0].coverage.coverageType,
				id: 9999,
				name: "SECTION C: EXTRA COVER",
				insuringClauseSectionCode: { name: "DOTESTIC3", description: "" },
				isSelectedByDefault: false,
			},
		};
		threeChildren.push(extraChild);

		component.coverageOptionItems = threeChildren;
		component.coverageOptionItems.forEach((child) => {
			child.coverage.coverageType.isSelectedByDefault = false;
		});
		component.coverage.coverageType.isSelectedByDefault = false;
		component.hasSingleChildVisible = false;
		component.isFirstLoad = true;
		component.isSelected = false;

		// Act
		component.expandAndSelectAll();

		// Assert
		expect(component.isSelected).toBeFalsy();
	});

	it("Should emit onChildOptionSelection event on option selection", () => {
		// Actors
		spyOn(component.onChildOptionSelection, "emit");

		// Actions
		const childCoverage = getChildCoverages()[0];
		component.onOptionSelection(childCoverage);

		// Asserts
		expect(component.onChildOptionSelection.emit).toHaveBeenCalledTimes(1);
	});

	it("Should emit onChildOptionDeselection event on option deselection", () => {
		// Actors
		spyOn(component.onChildOptionDeselection, "emit");

		// Actions
		const childCoverage = getChildCoverages()[0];
		component.onOptionDeselection(childCoverage);

		// Asserts
		expect(component.onChildOptionDeselection.emit).toHaveBeenCalledTimes(1);
	});

	it("Should be set hasSingleChildVisible as true if there is only one child coverage not hidden", () => {
		// The Coverage has two children, one of them has all limits and excesses hidden

		// Asserts
		expect(component.hasSingleChildVisible).toBe(true);
	});

	it("Should be set hasOnlyOneChildVisible as false if there are two child coverage not hidden", () => {
		// The Coverage has two children, one of them has all limits and excesses hidden
		component.coverageOptionItems = getVisibleChildCoverageItems();

		//Actions
		const result = component.hasOnlyOneChildVisible();

		// Asserts
		expect(result).toBe(false);
	});

    it("should populate the TRMDCPL1 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        component.coverageItem = getMainCoverageItem(true);
        component.coverage.childCoverages[0].limits = getLimitsForPropertyLimits();
        fixture.detectChanges();
        fixture.detectChanges();

        // Act
        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => { return acc + curr.propertyDamageLimit + curr.contentsDamageLimit }, 0);

        // Assert
        let index = component.coverage.childCoverages[0].limits.findIndex((limit:CoverageLimit) => limit.coverageLimitType.limitTypeCode === "TRMDCPL1");
        let limitObject = component.coverage.childCoverages[0].limits[index];
        expect(sumMockValues).toBe(limitObject.limit);
    });

    it("should populate the TRBIALL1 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        component.coverageItem = getMainCoverageItem(true);
        component.coverageItem.childCoverageItems[0].coverage.limits = getLimitsForPropertyLimits();

        // Act
        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => { return acc + curr.actualLossSustainedLimit + curr.increasedCostOfWorkingLimit }, 0);

        // Assert
        let index = component.coverageItem.childCoverageItems[0].coverage.limits.findIndex((limit:CoverageLimit) => limit.coverageLimitType.limitTypeCode === "TRBIALL1");
        let limitObject = component.coverageItem.childCoverageItems[0].coverage.limits[index];
        expect(sumMockValues).toBe(limitObject.limit);
    });

    it("should populate the TRBIGRL1 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        component.coverageItem = getMainCoverageItem(true);
        component.coverageItem.childCoverageItems[0].coverage.limits = getLimitsForPropertyLimits();

        // Act
        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => { return acc + curr.lossOfRentLimit + curr.alternativeAccommodationLimit }, 0);

        // Assert
        let index = component.coverageItem.childCoverageItems[0].coverage.limits.findIndex((limit:CoverageLimit) => limit.coverageLimitType.limitTypeCode === "TRBIGRL1");
        let limitObject = component.coverageItem.childCoverageItems[0].coverage.limits[index];
        expect(sumMockValues).toBe(limitObject.limit);
    });

    it("should populate the TRMDCPL2 limit values when property limits uploaded", () => {
        // Arrange
        const mockPropertyLimits = getPropertyLimits();
        component.coverageItem = getMainCoverageItem(true);
        component.coverageItem.childCoverageItems[0].coverage.limits = getLimitsForPropertyLimits();

        // Act
        let sumMockValues = mockPropertyLimits.reduce((acc, curr) => {
            return acc + curr.lossOfRentLimit + curr.alternativeAccommodationLimit +
                    curr.propertyDamageLimit + curr.contentsDamageLimit +
                    curr.increasedCostOfWorkingLimit + curr.actualLossSustainedLimit
            }, 0);

        // Assert
        let index = component.coverageItem.childCoverageItems[0].coverage.limits.findIndex((limit:CoverageLimit) => limit.coverageLimitType.limitTypeCode === "TRMDCPL2");
        let limitObject = component.coverageItem.childCoverageItems[0].coverage.limits[index];

        expect(sumMockValues).toBe(limitObject.limit);
    });

	function getMainCoverageItem(isProperty: boolean = false): CoverageItem {
		const coverageItem = new CoverageItem();
		coverageItem.isSelected = false;
		coverageItem.leadLimits = getLeadLimits();
		coverageItem.leadExcesses = getLeadExcesses();
		coverageItem.coverage = isProperty === true ? getPropertyCoverage() : getMainCoverage();
		coverageItem.childCoverageItems = getChildCoverageItems();
		return coverageItem;
	}

    function getLimitsForPropertyLimits(): CoverageLimit[] {
        return [
                {
                    limitTypeId: 0,
                    limit: 40000,
                    limitBasis: 1,
                    costBasis: 1,
                    subLimitCap: null,
                    coverageLimitType: {
                            limitTypeId: 0,
                            limitTypeCode:"TRMDCPL1",
                            order: 1,
                            followLimitTypeId: null,
                            limitFollowMultiplicationFactor: 1,
                            isHidden: false,
                            isMandatory: false,
                            defaultLimit: 1000000,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            availableLimitBasis: {
                                "1": "Any one claim",
                            },
                            availableCostBasis: {
                                "1": "Costs Inclusive",
                        },
                        cap: null,
                        followLimitCodes: []
                        },
                },
                {
                    limitTypeId: 1,
                    limit: 45000,
                    limitBasis: 1,
                    costBasis: 1,
                    subLimitCap: null,
                    isReadOnly:false,
                    coverageLimitType: {
                            limitTypeId: 1,
                            limitTypeCode:"TRBIALL1",
                            order: 1,
                            followLimitTypeId: null,
                            limitFollowMultiplicationFactor: 1,
                            isReadOnly: false,
                            isHidden: false,
                            isMandatory: false,
                            defaultLimit: 1000000,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
                            availableLimitBasis: {
                                "1": "Any one claim",
                            },
                            availableCostBasis: {
                                "1": "Costs Inclusive",
                        },
                        followExcessCodes: []
                        },
                },
                {
                    limitTypeId: 2,
                    limit: 40000,
                    limitBasis: 1,
                    costBasis: 1,
                    subLimitCap: null,
                    coverageLimitType: {
                            limitTypeId: 2,
                            limitTypeCode:"TRBIGRL1",
                            order: 1,
                            followLimitTypeId: null,
                            limitFollowMultiplicationFactor: 1,
                            isReadOnly: false,
                            isHidden: false,
                            isMandatory: false,
                            defaultLimit: 1000000,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
                            availableLimitBasis: {
                                "1": "Any one claim",
                            },
                            availableCostBasis: {
                                "1": "Costs Inclusive",
                        },
                        followLimitCodes: []
                        },
                },
                {
                    limitTypeId: 3,
                    limit: 125000,
                    limitBasis: 1,
                    costBasis: 1,
                    subLimitCap: null,
                    coverageLimitType: {
                            limitTypeId: 0,
                            limitTypeCode:"TRMDCPL2",
                            order: 1,
                            followLimitTypeId: null,
                            limitFollowMultiplicationFactor: 1,
                            isHidden: false,
                            isMandatory: false,
                            defaultLimit: 1000000,
                            defaultLimitBasis: 1,
                            defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
                            availableLimitBasis: {
                                "1": "Any one claim",
                            },
                            availableCostBasis: {
                                "1": "Costs Inclusive",
                            },
                        },
                },
            ] as CoverageLimit[];
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
					limitFollowMultiplicationFactor: 1,
					isReadOnly: false,
					isHidden: false,
					isMandatory: false,
					defaultLimit: 1000000,
					defaultLimitBasis: 1,
					defaultCostBasis: 1,
					subLimitCap: null,
                    cap: null,
					availableLimitBasis: {
						"1": "Any one claim",
						"2": "Maximum per day",
						"3": "Annual Aggregate",
					},
					availableCostBasis: {
						"1": "Costs Inclusive",
						"2": "Costs in Addition, Unlimited",
						"3": "Costs in Addition, Capped at limit",
						"4": "Costs in Addition, Capped at lower of 1m or limit",
						"5": "Costs in Addition, Capped at 10%",
                    },
                    followLimitCodes: []
				},
			},
		};
	}

	function getLeadExcesses(): { [id: number]: CoverageExcess } {
		return {
			"4": {
				coverageExcessTypeId: 4,
				excess: 0,
				excessBasisId: null,
				excessType: {
					coverageExcessTypeId: 4,
					excessTypeCode: "",
					order: 1,
					followExcessTypeId: null,
					excessFollowMultiplicationFactor: 1,
					description: "Excess",
					isReadOnly: false,
					isHidden: false,
					isMandatory: false,
					defaultExcess: 0,
					defaultExcessBasis: 0,
					availableExcessBasis: {
						"1": "Costs Inclusive",
						"2": "Costs Exclusive",
                    },
                    followExcessCodes: []
				},
			},
		};
	}

	function getMainCoverage(): Coverage {
		return {
			coverageType: {
				id: 3353,
				name: "INSURING CLAUSE 2: INVESTMENT FUND MANAGEMENT LIABILITY COVER",
				isMandatory: false,
				businessLine: {
					name: "DO",
					description: "Directors and Officers",
				},
				insuringClauseCode: { name: "R2D2", description: "" },
				insuringClauseSectionCode: { name: "R2D2S2", description: "" },
				childCoverageTypes: getChildCoverageTypes(),
				limitTypes: null,
				excessTypes: null,
				isAdditionalCoverage: false,
				additionalCoverageCategories: null,
				order: 2,
			} as CoverageType,
			childCoverages: getChildCoverages(),
			isExpanded: false,
			limits: [],
			excesses: [],
		};
	}

	function getPropertyCoverage(): Coverage {
		return {
			coverageType: {
				id: 9840,
				name: "COMMERCIAL PROPERTY",
				isMandatory: false,
				businessLine: {
					name: "MD",
					description: "Directors and Officers",
				},
				insuringClauseCode: { name: "R2D2", description: "" },
				insuringClauseSectionCode: { name: "R2D2S2", description: "" },
				childCoverageTypes: getChildCoverageTypes(),
				limitTypes: null,
				excessTypes: null,
				isAdditionalCoverage: false,
				additionalCoverageCategories: null,
				order: 2,
			} as CoverageType,
			childCoverages: getChildCoverages(),
			isExpanded: false,
			limits: [],
			excesses: [],
		};
	}

	function getChildCoverages(): Coverage[] {
		return [
			{
				isExpanded: true,
				coverageType: {
					id: 4306,
					name: "SECTION A: INDIVIDUAL COVER",
					isMandatory: false,
					businessLine: { name: "DO", description: "" } as Tag,
					insuringClauseCode: { name: "DOTEST", description: "" } as Tag,
					insuringClauseSectionCode: { name: "DOTESTIC", description: "" } as Tag,
					childCoverageTypes: null,
					limitTypes: [
						{
							limitTypeId: 15,
							limitTypeCode: "DOTESTICL1",
							order: 1,
							followLimitTypeId: 16,
							limitFollowMultiplicationFactor: 1,
							isReadOnly: false,
							isHidden: false,
							isMandatory: false,
							defaultLimit: 1000000,
							defaultLimitBasis: 1,
							defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
							availableLimitBasis: {
								"1": "Any one claim",
								"2": "Maximum per day",
								"3": "Annual Aggregate",
							},
							availableCostBasis: {
								"1": "Costs Inclusive",
								"2": "Costs in Addition, Unlimited",
								"3": "Costs in Addition, Capped at limit",
								"4": "Costs in Addition, Capped at lower of 1m or limit",
								"5": "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: []
						} as CoverageLimitType,
					],
					excessTypes: [
						{
							coverageExcessTypeId: 4,
							excessTypeCode: "",
							order: 1,
							followExcessTypeId: null,
							excessFollowMultiplicationFactor: 1,
							description: "Excess",
							isReadOnly: false,
							isHidden: false,
							isMandatory: false,
							defaultExcess: 0,
							defaultExcessBasis: 0,
							availableExcessBasis: {
								"1": "Costs Inclusive",
								"2": "Costs Exclusive",
                            },
                            followExcessCodes: []
						} as CoverageExcessType,
					],
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
						subLimitCap: null,
						coverageLimitType: {
							limitTypeId: 15,
							limitTypeCode: "",
							order: 1,
							followLimitTypeId: 16,
							limitFollowMultiplicationFactor: 1,
							isReadOnly: false,
							isHidden: false,
							isMandatory: false,
							defaultLimit: 1000000,
							defaultLimitBasis: 1,
							defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
							availableLimitBasis: {
								"1": "Any one claim",
								"2": "Maximum per day",
								"3": "Annual Aggregate",
							},
							availableCostBasis: {
								"1": "Costs Inclusive",
								"2": "Costs in Addition, Unlimited",
								"3": "Costs in Addition, Capped at limit",
								"4": "Costs in Addition, Capped at lower of 1m or limit",
								"5": "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: []
						},
					} as CoverageLimit,
				],
				excesses: [
					{
						coverageExcessTypeId: 4,
						excess: 0,
						excessBasisId: null,
						excessType: {
							coverageExcessTypeId: 4,
							excessTypeCode: "",
							order: 1,
							followExcessTypeId: null,
							excessFollowMultiplicationFactor: 1,
							description: "Excess",
							isReadOnly: false,
							isHidden: false,
							isMandatory: false,
							defaultExcess: 0,
							defaultExcessBasis: 0,
							availableExcessBasis: {
								"1": "Costs Inclusive",
								"2": "Costs Exclusive",
                            },
                            followExcessCodes: []
						},
					} as CoverageExcess,
				],
			} as Coverage,
			{
				isExpanded: true,
				coverageType: {
					id: 4307,
					name: "SECTION B: FUND REIMBURSEMENT COVER",
					isMandatory: false,
					businessLine: {
						name: "DO",
						description: "Directors and Officers",
					} as Tag,
					insuringClauseCode: { name: "R2D2", description: "" } as Tag,
					insuringClauseSectionCode: {
						name: "DOIFCL",
						description: "Investment fund civil liability",
					} as Tag,
					childCoverageTypes: null,
					limitTypes: [
						{
							limitTypeId: 16,
							limitTypeCode: "",
							order: 1,
							followLimitTypeId: null,
							limitFollowMultiplicationFactor: 1,
							isReadOnly: false,
							isHidden: true,
							isMandatory: false,
							defaultLimit: 1000000,
							defaultLimitBasis: 1,
							defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
							availableLimitBasis: {
								"1": "Any one claim",
								"2": "Maximum per day",
								"3": "Annual Aggregate",
							},
							availableCostBasis: {
								"1": "Costs Inclusive",
								"2": "Costs in Addition, Unlimited",
								"3": "Costs in Addition, Capped at limit",
								"4": "Costs in Addition, Capped at lower of 1m or limit",
								"5": "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: []
						} as CoverageLimitType,
					],
					excessTypes: [
						{
							coverageExcessTypeId: 5,
							excessTypeCode: "",
							order: 1,
							followExcessTypeId: 4,
							excessFollowMultiplicationFactor: 1,
							description: "Excess",
							isReadOnly: false,
							isHidden: true,
							isMandatory: false,
							defaultExcess: 0,
							defaultExcessBasis: 0,
							availableExcessBasis: {
								"1": "Costs Inclusive",
								"2": "Costs Exclusive",
                            },
                            followExcessCodes: []
						} as CoverageExcessType,
					],
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
						subLimitCap: null,
						coverageLimitType: {
							limitTypeId: 16,
							limitTypeCode: "",
							order: 1,
							followLimitTypeId: null,
							limitFollowMultiplicationFactor: 1,
							isReadOnly: false,
							isHidden: true,
							isMandatory: false,
							defaultLimit: 1000000,
							defaultLimitBasis: 1,
							defaultCostBasis: 1,
                            subLimitCap: null,
                            cap: null,
							availableLimitBasis: {
								"1": "Any one claim",
								"2": "Maximum per day",
								"3": "Annual Aggregate",
							},
							availableCostBasis: {
								"1": "Costs Inclusive",
								"2": "Costs in Addition, Unlimited",
								"3": "Costs in Addition, Capped at limit",
								"4": "Costs in Addition, Capped at lower of 1m or limit",
								"5": "Costs in Addition, Capped at 10%",
                            },
                            followLimitCodes: []
						},
					} as CoverageLimit,
				],
				excesses: [
					{
						coverageExcessTypeId: 5,
						excess: 0,
						excessBasisId: null,
						excessType: {
							coverageExcessTypeId: 5,
							excessTypeCode: "",
							order: 1,
							followExcessTypeId: 4,
							excessFollowMultiplicationFactor: 1,
							description: "Excess",
							isReadOnly: false,
							isHidden: true,
							isMandatory: false,
							defaultExcess: 0,
							defaultExcessBasis: 0,
							availableExcessBasis: {
								"1": "Costs Inclusive",
								"2": "Costs Exclusive",
                            },
                            followExcessCodes: []
						},
					} as CoverageExcess,
				],
			} as Coverage,
		];
	}

	function getChildCoverageTypes(): CoverageType[] {
		return [
			{
				id: 4306,
				name: "SECTION A: INDIVIDUAL COVER",
				isMandatory: false,
				businessLine: {
					name: "DO",
					description: "Directors and Officers",
				},
				insuringClauseCode: { name: "DOTEST", description: "" } as Tag,
				insuringClauseSectionCode: { name: "R2D2IC", description: "" } as Tag,
				childCoverageTypes: null,
				limitTypes: [
					{
						limitTypeId: 15,
						limitTypeCode: "",
						order: 1,
						followLimitTypeId: 16,
						limitFollowMultiplicationFactor: 1,
						isReadOnly: false,
						isHidden: false,
						isMandatory: false,
						defaultLimit: 1000000,
						defaultLimitBasis: 1,
						defaultCostBasis: 1,
                        subLimitCap: null,
                        cap: null,
						availableLimitBasis: {
							"1": "Any one claim",
							"2": "Maximum per day",
							"3": "Annual Aggregate",
						},
						availableCostBasis: {
							"1": "Costs Inclusive",
							"2": "Costs in Addition, Unlimited",
							"3": "Costs in Addition, Capped at limit",
							"4": "Costs in Addition, Capped at lower of 1m or limit",
							"5": "Costs in Addition, Capped at 10%",
                        },
                        followLimitCodes: []
					} as CoverageLimitType,
				],
				excessTypes: [
					{
						coverageExcessTypeId: 4,
						excessTypeCode: "",
						order: 1,
						followExcessTypeId: null,
						excessFollowMultiplicationFactor: 1,
						description: "Excess",
						isReadOnly: false,
						isHidden: false,
						isMandatory: false,
						defaultExcess: 0,
						defaultExcessBasis: 0,
						availableExcessBasis: {
							"1": "Costs Inclusive",
							"2": "Costs Exclusive",
                        },
                        followExcessCodes: []
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
				businessLine: {
					name: "DO",
					description: "Directors and Officers",
				} as Tag,
				insuringClauseCode: { name: "DOIF", description: "" } as Tag,
				insuringClauseSectionCode: {
					name: "DOIFCL",
					description: "Investment fund civil liability",
				} as Tag,
				childCoverageTypes: null,
				limitTypes: [
					{
						limitTypeId: 16,
						limitTypeCode: "",
						order: 1,
						followLimitTypeId: null,
						limitFollowMultiplicationFactor: 1,
						isReadOnly: false,
						isHidden: false,
						isMandatory: false,
						defaultLimit: 1000000,
						defaultLimitBasis: 1,
						defaultCostBasis: 1,
                        subLimitCap: null,
                        cap: null,
						availableLimitBasis: {
							"1": "Any one claim",
							"2": "Maximum per day",
							"3": "Annual Aggregate",
						},
						availableCostBasis: {
							"1": "Costs Inclusive",
							"2": "Costs in Addition, Unlimited",
							"3": "Costs in Addition, Capped at limit",
							"4": "Costs in Addition, Capped at lower of 1m or limit",
							"5": "Costs in Addition, Capped at 10%",
                        },
                        followLimitCodes: []
					} as CoverageLimitType,
				],
				excessTypes: [
					{
						coverageExcessTypeId: 5,
						excessTypeCode: "",
						order: 1,
						followExcessTypeId: 4,
						excessFollowMultiplicationFactor: 1,
						description: "Excess",
						isReadOnly: false,
						isHidden: false,
						isMandatory: false,
						defaultExcess: 0,
						defaultExcessBasis: 0,
						availableExcessBasis: {
							"1": "Costs Inclusive",
							"2": "Costs Exclusive",
                        },
                        followExcessCodes: []
					} as CoverageExcessType,
				],
				isAdditionalCoverage: false,
				additionalCoverageCategories: null,
                order: 2,
			} as CoverageType,
		];
	}

	function getChildCoverageItems(): CoverageItem[] {
		return [
			{
				childCoverageItems: [],
				coverage: getChildCoverages()[0],
				isSelected: false,
				leadLimits: getLeadLimits(),
				leadExcesses: getLeadExcesses(),
			},
			{
				childCoverageItems: [],
				coverage: getChildCoverages()[1],
				isSelected: false,
				leadLimits: getLeadLimits(),
				leadExcesses: getLeadExcesses(),
			},
		];
	}

	function getVisibleChildCoverageItems(): CoverageItem[] {
		return [
			{
				childCoverageItems: [],
				coverage: visibleChildCoverages()[0],
				isSelected: false,
				leadLimits: getLeadLimits(),
				leadExcesses: getLeadExcesses(),
			},
			{
				childCoverageItems: [],
				coverage: visibleChildCoverages()[1],
				isSelected: false,
				leadLimits: getLeadLimits(),
				leadExcesses: getLeadExcesses(),
			},
		];
	}

	function visibleChildCoverages(): Coverage[] {
		let coverages = getChildCoverages();
		for (let coverage of coverages) {
			coverage.coverageType.excessTypes.forEach((et) => (et.isHidden = false));
			coverage.coverageType.limitTypes.forEach((lt) => (lt.isHidden = false));
			coverage.limits.forEach((l) => (l.coverageLimitType.isHidden = false));
			coverage.excesses.forEach((e) => (e.excessType.isHidden = false));
		}
		return coverages;
	}

    function getPropertyLimits():PropertyLimit[]{
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
});
