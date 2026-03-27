import { BehaviorSubject } from "rxjs";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ClientLocation, Currency } from "@app/models";
import { QuoteModule } from "@app/quote/quote.module";
import { CoverageService } from "@app/services/coverage.service";
import { Shallow } from "shallow-render";
import { InsuredAddressService } from "./insured-address/insured-address.service";
import { PropertyLimitComponent } from "./property-limit.component";
import { PropertyLimit } from "../../../../../models/property-limit.model";
import { PropertyLimitsValidator } from "./property-limits-validator";
import { Validators } from "@angular/forms";

describe("PropertyLimitComponent", () => {
	let shallow: Shallow<PropertyLimitComponent>;
	let component: PropertyLimitComponent;

	let mockInsuredAddressService: InsuredAddressService;
	let mockCoverageService: CoverageService;
	let mockPropertyLimitsValidator: PropertyLimitsValidator;
	let componentFixture: ComponentFixture<PropertyLimitComponent>;

	const generateDefaultPropertyLimitWithoutBISelected = () => {
		return <PropertyLimit>{
			contentsDamageLimit: 30,
			insuredAddress: { clientLocationId: 5 },
			propertyDamageLimit: 50,
			stockDamageLimit: 60,
			additionalIncreasedCostOfWorkingLimit: 20,
		};
	};

	const generateDefaultPropertyLimitWithBISelected = () => {
		return <PropertyLimit>{
			actualLossSustainedLimit: 10,
			grossRentalLimit: 40,
			contentsDamageLimit: 30,
			insuredAddress: { clientLocationId: 5 },
			propertyDamageLimit: 50,
			stockDamageLimit: 60,
		};
	};

	beforeEach(async () => {
		shallow = new Shallow(PropertyLimitComponent, QuoteModule);

		const { instance, fixture } = await shallow
			.mock(InsuredAddressService, { select: () => {}, unselect: () => {} })
			.mock(CoverageService, { isBICoverageSelected: true })
			.mock(PropertyLimitsValidator, {
				getPropertyCoverageLimits: () => <PropertyLimit>{},
			})
			.render({
				bind: {
					isNew: true,
					currency: new Currency(),
					isEditing: true,
				},
			});

		component = instance;
		componentFixture = fixture;

		mockInsuredAddressService = TestBed.inject(InsuredAddressService);
		mockCoverageService = TestBed.inject(CoverageService);
		mockPropertyLimitsValidator = TestBed.inject(PropertyLimitsValidator);
	});

	it("should create component", () => {
		expect(component).toBeDefined();
	});

	it("should create an empty form group and controls", () => {
		expect(component.formGroup.controls.propertyDamageLimit).toBeDefined();
		expect(component.formGroup.controls.contentsDamageLimit).toBeDefined();
		expect(component.formGroup.controls.stockDamageLimit).toBeDefined();
		expect(component.formGroup.controls.actualLossSustainedLimit).toBeDefined();
		expect(component.formGroup.controls.additionalIncreasedCostOfWorkingLimit).toBeDefined();
		expect(component.formGroup.controls.grossRentalLimit).toBeDefined();
		expect(component.formGroup.controls.insuredAddress).toBeDefined();
	});

	describe("Limit fields isVisible", () => {
		it("property limit field should not be visible when property limit is not selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isPropertyDamageLimitSelected = false;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);

			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.propertyDamageLimit.enabled).toBe(false);
		});
		it("stock damage limit field should not be visible when stock damage limit is not selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isStockDamageLimitSelected = false;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.stockDamageLimit.enabled).toBe(false);
		});
		it("contents damage limit field should not be visible when contents damage limit is not selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isContentsDamageLimitSelected = false;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.contentsDamageLimit.enabled).toBe(false);
		});
		it("gross rental limit field should not be visible when gross rental limit is not selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isGrossRentalLimitSelected = false;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.grossRentalLimit.enabled).toBe(false);
		});
		it("actualLoss sustained limit field should not be visible when actualLoss sustained is not selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isActualLossSustainedLimitSelected = false;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.actualLossSustainedLimit.enabled).toBe(false);
		});
		it("property limit field should be visible when property limit is selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isPropertyDamageLimitSelected = true;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.propertyDamageLimit.enabled).toBe(true);
		});
		it("stock damage limit field should be visible when stock damage limit is selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isStockDamageLimitSelected = true;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.stockDamageLimit.enabled).toBe(true);
		});
		it("contents damage limit field should be visible when contents damage limit is selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			expectedPropertyLimit.isContentsDamageLimitSelected = true;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();

			// Assert
			expect(component.formGroup.controls.contentsDamageLimit.enabled).toBe(true);
		});
		it("gross rental limit field should be visible when gross rental limit is selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithBISelected();
			expectedPropertyLimit.isGrossRentalLimitSelected = true;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);
			component.ngOnInit();
			// Assert
			expect(component.formGroup.controls.grossRentalLimit.enabled).toBe(true);
		});
		it("actualLoss sustained limit field should be visible when actualLoss sustained is selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithBISelected();
			expectedPropertyLimit.isActualLossSustainedLimitSelected = true;
			mockPropertyLimitsValidator.getPropertyCoverageLimits = jasmine.createSpy().and.returnValue(expectedPropertyLimit);

			component.ngOnInit();
			// Assert
			expect(component.formGroup.controls.actualLossSustainedLimit.enabled).toBe(true);
		});
	});

	describe("writeValue", () => {
		it("should update the form values when BI coverage is not selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithBISelected();
			component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enable();

			// Act
			component.writeValue(expectedPropertyLimit);
			let compareValue = compareLimitValues(component.formGroup.controls, expectedPropertyLimit);

			// Assert
			expect(compareValue).toEqual(true);
		});

		it("should update the comitted property limits with the form values when BI coverage is not selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithBISelected();

			component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enable();
			component.formGroup.patchValue(expectedPropertyLimit);

			// Act
			component.add();
			component.cancel();
			let compareValue = compareLimitValues(component.formGroup.controls, expectedPropertyLimit);

			// Assert
			expect(compareValue).toEqual(true);
		});

		it("should unselect insured address from selected insured address list", () => {
			// Arrange
			const expectedClientLocationId = 91;
			const propertyLimit = generateDefaultPropertyLimitWithBISelected();
			const insuredAddress = <ClientLocation>{
				clientLocationId: expectedClientLocationId,
			};

			component.writeValue({ ...propertyLimit, insuredAddress });

			// Act
			component.writeValue(propertyLimit);

			// Assert
			expect(mockInsuredAddressService.unselect).toHaveBeenCalledTimes(1);
			expect(mockInsuredAddressService.unselect).toHaveBeenCalledWith(expectedClientLocationId);
		});

		it("should add selected insured address to selected insured address list", () => {
			// Arrange
			const propertyLimit = generateDefaultPropertyLimitWithBISelected();
			const expectedClientLocationId = propertyLimit.insuredAddress.clientLocationId;

			// Act
			component.writeValue(propertyLimit);

			// Assert
			expect(mockInsuredAddressService.select).toHaveBeenCalledTimes(1);
			expect(mockInsuredAddressService.select).toHaveBeenCalledWith(expectedClientLocationId);
		});
	});

	describe("setDisabledState", () => {
		it("should disable the form group when true", () => {
			// Act
			component.setDisabledState(true);

			// Assert
			expect(component.formGroup.enabled).toBe(false);
		});

		it("should enable the form group when false", () => {
			// Act
			component.setDisabledState(false);

			// Assert
			expect(component.formGroup.enabled).toBe(true);
		});
	});

	describe("edit", () => {
		it("should emit editing true event", () => {
			// Act
			component.edit();

			// Assert
			expect(component.editing.emit).toHaveBeenCalledTimes(1);
			expect(component.editing.emit).toHaveBeenCalledWith(true);
		});
	});

	describe("delete", () => {
		it("should emit deleted event", () => {
			// Act
			component.delete();

			// Assert
			expect(component.deleted.emit).toHaveBeenCalledTimes(1);
		});

		it("should unselect insured address from selected insured address list", () => {
			// Arrange
			const propertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			const expectedClientLocationId = propertyLimit.insuredAddress.clientLocationId;

			component.writeValue(propertyLimit);

			// Act
			component.delete();

			// Assert
			expect(mockInsuredAddressService.unselect).toHaveBeenCalledTimes(1);
			expect(mockInsuredAddressService.unselect).toHaveBeenCalledWith(expectedClientLocationId);
		});
	});

	describe("cancel", () => {
		it("should emit editing false event", () => {
			// Act
			component.cancel();

			// Assert
			expect(component.editing.emit).toHaveBeenCalledTimes(1);
			expect(component.editing.emit).toHaveBeenCalledWith(false);
		});
	});

	describe("add", () => {
		it("should collapse the property limits form when the form is valid without BI selected", () => {
			// Arrange
			component.writeValue(generateDefaultPropertyLimitWithoutBISelected());

			// Act
			component.add();

			// Assert
			expect(component.formGroup.valid).toBe(true);
			expect(component.editing.emit).toHaveBeenCalledTimes(1);
			expect(component.editing.emit).toHaveBeenCalledWith(false);
		});

		it("should update the comitted property limits with the form values without BI selected", () => {
			// Arrange
			const expectedPropertyLimit = generateDefaultPropertyLimitWithBISelected();

			component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enable();
			component.formGroup.patchValue(expectedPropertyLimit);

			// Act
			component.add();
			component.cancel();
			let compareValue = compareLimitValues(component.formGroup.controls, expectedPropertyLimit);

			// Assert
			expect(compareValue).toEqual(true);
		});

		it("should mark all fields as touched when the form is invalid", () => {
			// Arrange
			component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enable();

			// Act
			component.add();

			// Assert
			expect(component.formGroup.invalid).toBe(true);
			expect(component.formGroup.controls.propertyDamageLimit.touched).toBe(true);
			expect(component.formGroup.controls.contentsDamageLimit.touched).toBe(true);
			expect(component.formGroup.controls.actualLossSustainedLimit.touched).toBe(true);
			expect(component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.touched).toBe(true);
			expect(component.formGroup.controls.grossRentalLimit.touched).toBe(true);
			expect(component.formGroup.controls.insuredAddress.touched).toBe(true);
		});

		it("should unselect insured address from selected insured address list", () => {
			// Arrange
			const propertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			const expectedClientLocationId = propertyLimit.insuredAddress.clientLocationId;

			component.writeValue(propertyLimit);

			// Act
			component.add();

			// Assert
			expect(mockInsuredAddressService.unselect).toHaveBeenCalledTimes(1);
			expect(mockInsuredAddressService.unselect).toHaveBeenCalledWith(expectedClientLocationId);
		});

		it("should add selected insured address to selected insured address list", () => {
			// Arrange
			const propertyLimit = generateDefaultPropertyLimitWithoutBISelected();
			const expectedClientLocationId = propertyLimit.insuredAddress.clientLocationId;

			component.formGroup.patchValue(propertyLimit);

			// Act
			component.add();

			// Assert
			expect(mockInsuredAddressService.select).toHaveBeenCalledTimes(1);
			expect(mockInsuredAddressService.select).toHaveBeenCalledWith(expectedClientLocationId);
		});
	});

	describe("onCountrySelected", () => {
		describe("UR Or Irelend", () => {
			// Arrange
			const isoCodes = ["GB", "IE"];

			it("should enable the AICOWL field", () => {
				for (const isoCode of isoCodes) {
					// Act
					component.onCountrySelected(isoCode);

					// Assert
					expect(component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enabled).toBe(true);
				}
			});
		});

		describe("Other countries", () => {
			it("should disable the AICOWL field", () => {
				// Act
				component.onCountrySelected("US");

				// Assert
				expect(component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enabled).toBe(false);
			});
		});

		it("should not update form when ISO code is null", () => {
			// Arrange
			component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enable();

			// Act
			component.onCountrySelected(null);

			// Assert
			expect(component.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enabled).toBe(true);
		});
	});
});

function compareLimitValues(controls, expectedPropertyLimit: PropertyLimit): boolean {
	if (
		expectedPropertyLimit.propertyDamageLimit != controls.propertyDamageLimit.value ||
		expectedPropertyLimit.contentsDamageLimit != controls.contentsDamageLimit.value ||
		expectedPropertyLimit.stockDamageLimit != controls.stockDamageLimit.value ||
		expectedPropertyLimit.actualLossSustainedLimit != controls.actualLossSustainedLimit.value ||
		expectedPropertyLimit.grossRentalLimit != controls.grossRentalLimit.value
	) {
		return false;
	}
	return true;
}
