import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { DecimalPipe } from "@angular/common";
import { CoverageOptionComponent } from "./coverage-option.component";
import { Coverage, CoverageExcess, CoverageLimit, CoverageType, Currency } from "@app/models";
import { LimitComponent } from "@app/quote/components/coverage/limit/limit.component";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { ExcessComponent } from "@app/quote/components/coverage/excess/excess.component";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { By } from "@angular/platform-browser";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";
import { DictionaryHelperService } from "@app/services/dictionary-helper.service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { LeadLimitConfiguration } from "@app/models/extendedModels/LeadLimitConfiguration";
import { LeadExcessConfiguration } from "@app/models/extendedModels/LeadExcessConfiguration";
import { CookieService } from "ngx-cookie-service";
import { QuoteService } from "@app/quote/services/quote.service";
import { DebugElement, Injectable } from "@angular/core";
import { CoverageService } from '@app/services/coverage.service';

describe("CoverageOptionComponent", () => {
	let component: CoverageOptionComponent;
	let fixture: ComponentFixture<CoverageOptionComponent>;
	let currency: Currency = {
		id: 1,
		symbol: "£",
		isoCode: "GBP",
		name: "pound",
		rate: 1.0,
	};

	beforeEach(async() => {
		TestBed.configureTestingModule({
			declarations: [CoverageOptionComponent, LimitComponent, ExcessComponent, CurrencyComponent, LargeNumberMask],
			imports: [FormsModule, ReactiveFormsModule, CommonModule, ErrorModule],
			providers: [
				UnderwriterCoverageAuthorityService,
				DecimalPipe,
				DictionaryHelperService,
				UserService,
                CookieService,
                CoverageCalculationService,
				{ provide: QuoteService, useClass: MockQuoteService },
                { provide: CoverageService, useClass: MockCoverageService }
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(CoverageOptionComponent);
				component = fixture.componentInstance;
				component.option = getTestCoverageItem();
				component.currency = currency;
				fixture.detectChanges();
			});
	});

	it("Should create component", () => {
		expect(component).toBeTruthy();
	});

	it("Should emit onSelection event on selection boolean value input change", () => {
		// Actors
		component.isSelected = false;
		spyOn(component.onSelection, "emit");

		// Actions
		component.toggleSelection();

		// Asserts
		expect(component.onSelection.emit).toHaveBeenCalledTimes(1);
		expect(component.onSelection.emit).toHaveBeenCalledWith(getTestCoverage());
	});

	it("Should not emit onSelection event on the first selection boolean value input change", () => {
		// Actors
		spyOn(component.onSelection, "emit");

		// Actions
		component.isSelected = true;

		// Asserts
		expect(component.onSelection.emit).toHaveBeenCalledTimes(0);
	});

	it("Should emit onDeselection event on selection boolean value input change", () => {
		// Actors
		component.isSelected = true;
		spyOn(component.onDeselection, "emit");

		// Actions
		component.toggleSelection();

		// Asserts
		expect(component.onDeselection.emit).toHaveBeenCalledTimes(1);
		expect(component.onDeselection.emit).toHaveBeenCalledWith(getTestCoverage());
	});

	it("Should not emit onDeselection event on the first selection boolean value input change", () => {
		// Actors
		spyOn(component.onSelection, "emit");

		// Actions
		component.isSelected = false;

		// Asserts
		expect(component.onSelection.emit).toHaveBeenCalledTimes(0);
	});

	it("Should toggle selection boolean value on selection", () => {
		// Actions
		var isSelectedInitial = component.isSelected;
		component.toggleSelection();
		var isSelectedFirst = component.isSelected;
		component.toggleSelection();
		var isSelectedSecond = component.isSelected;

		// Asserts
		expect(isSelectedInitial).toBeFalsy();
		expect(isSelectedFirst).toBeTruthy();
		expect(isSelectedSecond).toBeFalsy();
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
		expect(component.onSelection.emit).toHaveBeenCalledWith(getTestCoverage());
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
		expect(component.onDeselection.emit).toHaveBeenCalledWith(getTestCoverage());
	});

	it("Should properly set input to readonly for a limit that provides isReadOnly=true", () => {
		// Actors
		spyOn(component.onSelection, "emit");

		// Actions
		component.coverage.limits[0].coverageLimitType.isReadOnly = true;
		component.isSelected = true;

		fixture.detectChanges();
		// Asserts
		const limitInputEl = fixture.debugElement.query(By.css(".coverage-option-limits limit input")).nativeElement;
		expect(limitInputEl).toBeDefined();
		expect(limitInputEl).not.toBeNull();
		expect(limitInputEl.attributes.getNamedItem("readonly")).toBeDefined();
		expect(limitInputEl.attributes.getNamedItem("readonly")).toBeTruthy();
	});

	it("Should properly set input to readonly for an excess that provides isReadOnly = true", () => {
		// Actors
		spyOn(component.onSelection, "emit");

		// Actions
		component.coverage.excesses[0].excessType.isReadOnly = true;
		component.isSelected = true;

		fixture.detectChanges();
		// Asserts
		const excessInputEl = fixture.debugElement.query(By.css(".coverage-option-limits excess input")).nativeElement;
		expect(excessInputEl).toBeDefined();
		expect(excessInputEl).not.toBeNull();
		expect(excessInputEl.attributes.getNamedItem("readonly")).toBeDefined();
		expect(excessInputEl.attributes.getNamedItem("readonly")).toBeTruthy();
	});

	it("If one limit of many is hidden within a coverage, then the coverage is still visibile", () => {
		// Actions
		component.coverage.limits[0].coverageLimitType.isHidden = true;
		fixture.detectChanges();

		// Asserts
		const coverageEl = fixture.debugElement.query(By.css(".coverage-option")).nativeElement;
		expect(coverageEl).toBeDefined();
		expect(coverageEl).not.toBeNull();
		expect(coverageEl.hidden).toBe(false);
	});

	it("If all limits of many are hidden within a coverage, then the coverage is no longer visibile", () => {
		// Actions
		component.coverage.limits[0].coverageLimitType.isHidden = true;
		component.coverage.excesses[0].excessType.isHidden = true;

		fixture.detectChanges();

		// Asserts
		const coverageEl = fixture.debugElement.query(By.css(".coverage-option")).nativeElement;
		expect(coverageEl).toBeDefined();
		expect(coverageEl).not.toBeNull();
		expect(coverageEl.hidden).toBe(true);
	});

	it("If a limit is mandatory within a coverage, then the coverages checkbox is disabled", () => {
		// Actions
		component.coverage.limits[0].coverageLimitType.isMandatory = true;

		fixture.detectChanges();

		// Asserts
		const checkboxEl = fixture.debugElement.query(By.css(".coverage-option .input-checkbox")).nativeElement;
		expect(checkboxEl).toBeDefined();
		expect(checkboxEl).not.toBeNull();
		expect(checkboxEl.disabled).toBe(true);

		const titleEl = fixture.debugElement.query(By.css(".coverage-option .coverage-option-title")).nativeElement;
		expect(titleEl).toBeDefined();
		expect(titleEl).not.toBeNull();
		expect(titleEl.classList.contains("readonly")).toBe(true);
	});

	it("If an excess is mandatory within a coverage, then the coverages checkbox and title are disabled", () => {
		// Actions
		component.coverage.excesses[0].excessType.isMandatory = true;

		fixture.detectChanges();

		// Asserts
		const checkboxEl = fixture.debugElement.query(By.css(".coverage-option .input-checkbox")).nativeElement;
		expect(checkboxEl).toBeDefined();
		expect(checkboxEl).not.toBeNull();
		expect(checkboxEl.disabled).toBe(true);

		const titleEl = fixture.debugElement.query(By.css(".coverage-option .coverage-option-title")).nativeElement;
		expect(titleEl).toBeDefined();
		expect(titleEl).not.toBeNull();
		expect(titleEl.classList.contains("readonly")).toBe(true);
	});

    it("Given two limits, check the function getLimits returns both in the correct order", () => {
        // Actions
        const limit2 = getCoverageLimit();
        component.coverage.limits[1] = limit2;

        component.coverage.limits[0].coverageLimitType.limitTypeCode = "CP";
        component.coverage.limits[0].coverageLimitType.order = 2;
        component.coverage.limits[1].coverageLimitType.limitTypeCode = "CX";
        component.coverage.limits[1].coverageLimitType.order = 1;

        const limits = component.getLimits();
        // Asserts
        expect(limits).toBeDefined();
        expect(limits[0].coverageLimitType.limitTypeCode).toBe("CP");
        expect(limits[1].coverageLimitType.limitTypeCode).toBe("CX");
    });

	it("Given two deductibles, check the function getExcesses returns both in the correct order", () => {
		// Actions
		const excess2 = getCoverageExcess();
		component.coverage.excesses[1] = excess2;

		component.coverage.excesses[0].coverageExcessTypeId = 123;
		component.coverage.excesses[0].excessType.order = 2;
		component.coverage.excesses[1].coverageExcessTypeId = 456;
		component.coverage.excesses[1].excessType.order = 1;

		const deductibles = component.getExcesses();
		// Asserts
		expect(deductibles).toBeDefined();
		expect(deductibles[0].coverageExcessTypeId).toBe(456);
		expect(deductibles[1].coverageExcessTypeId).toBe(123);
	});

	it("getLeadLimitConfiguration() should return null if there is no leadLimitTypeId", () => {
		// Arrange
		const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = null;

		// Act
		const result = component.getLeadLimitConfiguration(coverageLimit);

		// Assert
		expect(result).toBeNull();
	});

	it("getLeadLimitConfiguration() should return null if there is no leadLimit", () => {
		// Arrange
		const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1"];
		component.option = getTestCoverageItem();
		component.option.leadLimits = {
            "CPCPCPL1": null,
		};

		// Act
		const result = component.getLeadLimitConfiguration(coverageLimit);

		// Assert
		expect(result).toBeNull();
	});

	it("getLeadLimitConfiguration() should return a leadLimitConfiguration if there is a leadLimit", () => {
		// Arrange
		const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1"];
		component.option = getTestCoverageItem();
		component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
		};

		// Act
		const result = component.getLeadLimitConfiguration(coverageLimit);

		// Assert
		expect(result).toEqual(jasmine.any(LeadLimitConfiguration));
	});

	it("getLeadExcessConfiguration() should return null if there is no leadExcessTypeId", () => {
		// Arrange
		const coverageExcess = getCoverageExcess();
		coverageExcess.excessType.followExcessTypeId = null;

		// Act
		const result = component.getLeadExcessConfiguration(coverageExcess);

		// Assert
		expect(result).toBeNull();
	});

	it("getLeadExcessConfiguration() should return null if there is no leadExcess", () => {
		// Arrange
		const coverageExcess = getCoverageExcess();
		coverageExcess.excessType.followExcessTypeId = 1;
		component.option = getTestCoverageItem();
		component.option.leadExcesses = {
			1: null,
		};

		// Act
		const result = component.getLeadExcessConfiguration(coverageExcess);

		// Assert
		expect(result).toBeNull();
	});

    it("getLeadExcessConfiguration() should return a leadExcessConfiguration if there is a leadExcess", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();
        coverageExcess.excessType.followExcessTypeId = 1;
        coverageExcess.excessType.followExcessCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadExcesses = {
            1: coverageExcess,
        };

        // Act
        const result = component.getLeadExcessConfiguration(coverageExcess);
        // Assert
        expect(result).toEqual(jasmine.any(LeadExcessConfiguration));
    });

    it("getLeadLimitValue() should return null if there is no followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();

        // Act
        const result = component.getLeadLimitValue(coverageLimit);

        // Assert
        expect(result).toBeNull();
    });

    it("getLeadLimitValue() should return a leadLimitValue if there are followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
        };

        // Act
        const result = component.getLeadLimitValue(coverageLimit);

        // Assert
        expect(result).toEqual(jasmine.any(Number));
    });

    it("getLeadLimitValue() should return the correct leadLimitValue if there are multiple followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        const result = component.getLeadLimitValue(coverageLimit);

        // Assert
        expect(result).toEqual(2000000);
    });

    it("getLeadLimitValue() should return the correct leadLimitValue if there are multiple followLimitCodes and limits are hidden", () => {
        // Actions
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        coverageLimit.coverageLimitType.isHidden = true;
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        const result = component.getLeadLimitValue(coverageLimit);

        // Asserts
        expect(result).toEqual(2000000);
    });

    it("getLeadLimitValue() should return the correct leadLimitValue if there are multiple followLimitCodes, limits are hidden and lead limits are amended", () => {
        // Actions
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        coverageLimit.coverageLimitType.isHidden = true;
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        const result = component.getLeadLimitValue(coverageLimit);

        // Asserts
        expect(result).toEqual(2000000);
        coverageLimit.limit = 5000;
        const newResult = component.getLeadLimitValue(coverageLimit);
        expect(newResult).toEqual(10000);
    });

    it("getLeadLimitValue() should return the correct leadLimitValue if there are multiple followLimitCodes and limits are read only", () => {
        // Actions
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        coverageLimit.coverageLimitType.isReadOnly = true;
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        const result = component.getLeadLimitValue(coverageLimit);

        // Asserts
        expect(result).toEqual(2000000);
    });

    it("getLeadLimitValue() should return the correct leadLimitValue if there are multiple followLimitCodes and limits are read only and lead limits are amended", () => {
        // Actions
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        coverageLimit.coverageLimitType.isReadOnly = true;
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        const result = component.getLeadLimitValue(coverageLimit);

        // Asserts
        expect(result).toEqual(2000000);
        coverageLimit.limit = 5000;
        const newResult = component.getLeadLimitValue(coverageLimit);
        expect(newResult).toEqual(10000);
    });

    it("getLeadLimitBasis() should return null if there is no followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();

        // Act
        const result = component.getLeadLimitBasis(coverageLimit);

        // Assert
        expect(result).toBeNull();
    });

    it("getLeadLimitBasis() should return a limitBasis value if there are followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
        };

        // Act
        const result = component.getLeadLimitBasis(coverageLimit);

        // Assert
        expect(result).toEqual(jasmine.any(Number));
    });

    it("getLeadLimitBasis() should return a limitBasis value if there are multiple followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
        };

        // Act
        const result = component.getLeadLimitBasis(coverageLimit);

        // Assert
        expect(result).toEqual(jasmine.any(Number));
    });

    it("getLeadCostBasis() should return null if there is no followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();

        // Act
        const result = component.getLeadCostBasis(coverageLimit);

        // Assert
        expect(result).toBeNull();
    });

    it("getLeadCostBasis() should return a costBasis value if there are followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        const result = component.getLeadCostBasis(coverageLimit);

        // Assert
        expect(result).toEqual(jasmine.any(Number));
    });

    it("getLeadLimits() should return null if there is no followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();

        // Act
        const result = component.getLeadLimits(coverageLimit);

        // Assert
        expect(result).toBeNull();
    });

    it("getLeadLimits() should return leaders if there are followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
        };

        // Act
        const result = component.getLeadLimits(coverageLimit);

        // Assert
        expect(result).toBeDefined();
        expect(result[0].coverageLimitType.followLimitCodes[0]).toBe("CPCPCPL1");
    });

    it("getLeadLimits() should return leaders if there are multiple followLimitCodes", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        const result = component.getLeadLimits(coverageLimit);

        // Assert
        expect(result).toBeDefined();
        expect(result[0].coverageLimitType.followLimitCodes[0]).toBe("CPCPCPL1");
        expect(result[1].coverageLimitType.followLimitCodes[1]).toBe("CPCPCPL2");
    });

    it("getLeadExcessValue() should return null if there is no followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();

        // Act
        const result = component.getLeadExcessValue(coverageExcess);

        // Assert
        expect(result).toBeNull();
    });

    it("getLeadExcessValue() should return a leadExcessValue if there are followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();
        coverageExcess.excessType.followExcessCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadExcesses = {
            "CPCPCPL1": coverageExcess,
        };

        // Act
        const result = component.getLeadExcessValue(coverageExcess);

        // Assert
        expect(result).toEqual(jasmine.any(Number));
    });

    it("getLeadExcessValue() should return the correct leadExcessValue if there are multiple followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();
        coverageExcess.excessType.followExcessCodes = ["CPCPCPL1", "CPCPCPL2"];
        component.option = getTestCoverageItem();
        component.option.leadExcesses = {
            "CPCPCPL1": coverageExcess,
            "CPCPCPL2": coverageExcess
        };

        // Act
        const result = component.getLeadExcessValue(coverageExcess);

        // Assert
        expect(result).toEqual(2000);
    });

    it("getLeadExcessBasis() should return null if there is no followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();

        // Act
        const result = component.getLeadExcessBasis(coverageExcess);

        // Assert
        expect(result).toBeNull();
    });

    it("getLeadExcessBasis() should return an excessBasis value if there are followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();
        coverageExcess.excessType.followExcessCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadExcesses = {
            "CPCPCPL1": coverageExcess,
        };

        // Act
        const result = component.getLeadExcessBasis(coverageExcess);

        // Assert
        expect(result).toEqual(jasmine.any(Number));
    });

    it("getLeadExcessBasis() should return an excessBasis value if there are multiple followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();
        coverageExcess.excessType.followExcessCodes = ["CPCPCPL1", "CPCPCPL2"];
        component.option = getTestCoverageItem();
        component.option.leadExcesses = {
            "CPCPCPL1": coverageExcess,
            "CPCPCPL2": coverageExcess
        };

        // Act
        const result = component.getLeadExcessBasis(coverageExcess);

        // Assert
        expect(result).toEqual(jasmine.any(Number));
    });

    it("getLeadExcesses() should return null if there is no followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();

        // Act
        const result = component.getLeadExcesses(coverageExcess);

        // Assert
        expect(result).toBeNull();
    });

    it("getLeadExcesses() should return leaders if there are followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();
        coverageExcess.excessType.followExcessCodes = ["CPCPCPL1"];
        component.option = getTestCoverageItem();
        component.option.leadExcesses = {
            "CPCPCPL1": coverageExcess,
        };

        // Act
        const result = component.getLeadExcesses(coverageExcess);

        // Assert
        expect(result).toBeDefined();
        expect(result[0].excessType.followExcessCodes[0]).toBe("CPCPCPL1");
    });

    it("getLeadExcesses() should return leaders if there are multiple followExcessCodes", () => {
        // Arrange
        const coverageExcess = getCoverageExcess();
        coverageExcess.excessType.followExcessCodes = ["CPCPCPL1", "CPCPCPL2"];
        component.option = getTestCoverageItem();
        component.option.leadExcesses = {
            "CPCPCPL1": coverageExcess,
            "CPCPCPL2": coverageExcess
        };

        // Act
        const result = component.getLeadExcesses(coverageExcess);

        // Assert
        expect(result).toBeDefined();
        expect(result[0].excessType.followExcessCodes[0]).toBe("CPCPCPL1");
        expect(result[1].excessType.followExcessCodes[1]).toBe("CPCPCPL2");
    });

    it("reCalculateLeadValues should return recalculate lead limits", () => {
        // Arrange
        const coverageLimit = getCoverageLimit();
        coverageLimit.coverageLimitType.followLimitCodes = ["CPCPCPL1", "CPCPCPL2"];
        component.option = getTestCoverageItem();
        component.option.leadLimits = {
            "CPCPCPL1": coverageLimit,
            "CPCPCPL2": coverageLimit
        };

        // Act
        component.reCalculateLeadValues();
        fixture.detectChanges();
        const limitComponentDebugElement: DebugElement = fixture.debugElement.query(By.directive(LimitComponent));
        const limitComponent = limitComponentDebugElement.componentInstance;


        // Assert
        expect(limitComponent).toBeDefined();
        expect(limitComponent.limit.limit).toBe(1000000);
    });

    function getTestCoverage(): Coverage {
        const coverage = new Coverage();
        coverage.coverageType = getCoverageType();
        coverage.limits = [getCoverageLimit()];
        coverage.excesses = [getCoverageExcess()];

        return coverage;
    }

    function getCoverageType(): CoverageType {
        return {
            id: 7,
            name: "Non-Executive Liability",
            isMandatory: false,
            businessLine: {
                name: "DO",
                description: "Directors and Officers",
            },
            insuringClauseCode: { name: "DOIF", description: "" },
            insuringClauseSectionCode: {
                name: "DOIFCL",
                description: "Investment fund civil liability",
            },
            childCoverageTypes: null,
            limitTypes: [],
            excessTypes: [],
            isAdditionalCoverage: false,
            additionalCoverageCategories: null,
            order: 2,
        } as CoverageType;
    }

    function getTestCoverageItem(): CoverageItem {
        const coverage = new CoverageItem();
        coverage.coverage = getTestCoverage();
        return coverage;
    }

    function getCoverageLimit(): CoverageLimit {
        return {
            limitTypeId: 0,
            limit: 1000000,
            limitBasis: 1,
            costBasis: 1,
            subLimitCap: null,
            coverageLimitType: {
                limitTypeId: 0,
                limitTypeCode: "",
                order: 1,
                followLimitTypeId: undefined,
                limitFollowMultiplicationFactor: 1,
                isReadOnly: false,
                isHidden: false,
                isMandatory: false,
                defaultLimit: 1000000,
                defaultLimitBasis: 1,
                defaultCostBasis: 1,
                subLimitCap: null,
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
                cap: null,
                followLimitCodes: []
            },
        } as CoverageLimit;
    }

    function getCoverageExcess(): CoverageExcess {
        return {
            coverageExcessTypeId: 0,
            excess: 1000,
            excessBasisId: 0,
            excessType: {
                coverageExcessTypeId: 0,
                excessTypeCode: "",
                order: 1,
                followExcessTypeId: undefined,
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
        } as CoverageExcess;
    }
});

@Injectable()
class MockQuoteService {
    public getCurrency(): Currency {
        return { isoCode: "USD", rate: 1 } as Currency;
    }
}

@Injectable()
class MockCoverageService{
    getTotalInsuredLimitValue(){
        return 1000000;
    }
}
