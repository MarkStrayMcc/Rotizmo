import { Component, Directive, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick, flush, discardPeriodicTasks } from "@angular/core/testing";
import { inject } from "@angular/core/testing";
import { ControlValueAccessor, FormBuilder, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { Binder, Currency, PricingInformation, Document, Tag } from "@app/models";
import { BusinessLine } from "./business-line.component";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { CookieService } from "ngx-cookie-service";
import { PricingService } from "@app/quote/services/pricing-service";
import * as pricingServiceMocks from "@app/quote/services/pricing-service.mock";
import { PricingHttpService } from "@app/services/pricing-http-service";
import { MessageService } from "@app/services/message.service";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { MockQuoteService } from "@app/quote/quote.component.mock";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { CombineDiscountPricingService } from "@app/services/combine-discount-pricing.service";
import { MockFeaturesHttpService, MockUserService } from "@app/quote/steps/base-step.component.mock";
import { FeaturesHttpService } from "@app/services/features-http.service";

let businessLine: Tag;
let binder: Binder;
let pricingInfo: PricingInformation;
let currency: Currency;

let form: FormGroup;

describe("BusinessLine Component", () => {
	let component: BusinessLine;
	let fixture: ComponentFixture<BusinessLine>;

	beforeEach(() =>
		TestBed.configureTestingModule({
			declarations: [BusinessLine, MockCurrencyComponent, MockPercentageInputComponent, MockLargeNumberMask, MockNumberOnly],
			imports: [FormsModule, ErrorModule, ReactiveFormsModule],
			providers: [
				UnderwriterDiscountAuthorityService,
				PricingService,
				CookieService,
				{
					provide: PricingHttpService,
					useClass: pricingServiceMocks.MockPricingHttpService,
				},
				{
					provide: CoverageHttpService,
					useClass: pricingServiceMocks.MockCoverageHttpService,
				},
				{
					provide: QuoteService,
					useClass: MockQuoteService,
				},
				{
					provide: PremiumCalculationsService,
					useClass: pricingServiceMocks.MockPremiumCalculationsService,
				},
				{
					provide: UserService,
					useClass: MockUserService,
				},
				{
					provide: FeaturesHttpService,
					useClass: MockFeaturesHttpService,
				},
				CombineDiscountPricingService,
				MessageService,
			],
		})
	);

	beforeEach(inject([FormBuilder], (formBuilder: FormBuilder) => setupTestData(formBuilder)));

	beforeEach(() => {
		fixture = TestBed.createComponent(BusinessLine);
		component = fixture.componentInstance;
		component.isNewQuote = false;
		component.isAdmitted = true;
		component.endorsements = [];
		component.form = form;
		component.currency = currency;
		fixture.detectChanges();
	});

	it("should create the component", () => {
		expect(component).toBeDefined();
	});

	it("should default isPremiumEditable to false", () => {
		expect(component.isPremiumEditable).toBe(false);
	});

	describe("ngOnInit", () => {
		describe("initaliseIsPremiumEditable", () => {
			beforeEach(() => {
				component.readonly = false;
				component.form.controls.businessLine.setValue({ name: "MD" });
				component.endorsements.push(<Document>{ reference: "3646" });
			});

			it("should set isPremiumEditable to true when business line is MD and is multiple properties", () => {
				// Act
				component.ngOnInit();

				// Assert
				expect(component.isPremiumEditable).toBe(true);
			});

			it("should set isPremiumEditable to false when business line is not MD", () => {
				// Arrange
				component.form.controls.businessLine.setValue({ name: "OTHER" });

				// Act
				component.ngOnInit();

				// Assert
				expect(component.isPremiumEditable).toBe(false);
			});

			it("should set isPremiumEditable to false when is multiple properties", () => {
				// Arrange
				component.endorsements.length = 0;

				// Act
				component.ngOnInit();

				// Assert
				expect(component.isPremiumEditable).toBe(false);
			});

			it("should set isPremiumEditable to false when is readonly", () => {
				// Arrange
				component.readonly = true;

				// Act
				component.ngOnInit();

				// Assert
				expect(component.isPremiumEditable).toBe(false);
			});
		});
	});

	describe("updating the quoted premium", () => {
		beforeEach(() => {
			// Arrange
			form.get("quoted").setValue(59.7);

			// Act
			component.quotedChanged();
		});

		// Assert
		it("should update the discount", () => expect(form.controls.discount.value).toBe(40));
	});

	describe("Underwriter validation", () => {
		it("should call the discount service and set the max discount", () => {
			// Arrange
			let discountService = fixture.debugElement.injector.get(UnderwriterDiscountAuthorityService);
			let discountSpy = spyOn(discountService, "getMaxDiscountPercentage").and.returnValue(45);

			// Act
			component.ngOnChanges({});

			// Assert
			expect(discountSpy).toHaveBeenCalled();
			expect(component.maxDiscount).toBe(45);
		});

		it("should trigger the warning event if discount is greater than max given", () => {
			// Arrange
			let discountService = fixture.debugElement.injector.get(UnderwriterDiscountAuthorityService);
			spyOn(discountService, "getMaxDiscountPercentage").and.returnValue(45);
			component.ngOnChanges({}); // set max first
			let warningSpy = spyOn(component.onWarning, "emit").and.callFake((val: boolean) => {});

			// Act
			component.hasWarning();

			// Assert
			expect(warningSpy).toHaveBeenCalled();
		});

		it("should call the discount service an set the max suggested discount", () => {
			// Arrange
			let discountService = fixture.debugElement.injector.get(UnderwriterDiscountAuthorityService);
			let discountSpy = spyOn(discountService, "getMaxSuggestedDiscountPercentage").and.returnValue(45);

			// Act
			component.ngOnChanges({});

			// Assert
			expect(discountSpy).toHaveBeenCalled();
			expect(component.maxSuggestedDiscountPercentage).toBe(45);
		});

		it("should trigger the warning event if suggested discount is greater than max suggested given", () => {
			// Arrange
			let discountService = fixture.debugElement.injector.get(UnderwriterDiscountAuthorityService);
			spyOn(discountService, "getMaxSuggestedDiscountPercentage").and.returnValue(45);
			component.ngOnChanges({}); // set max first
			let warningSpy = spyOn(component.onWarning, "emit").and.callFake((val: boolean) => {});

			// Act
			component.suggestedDiscountWarning();

			// Assert
			expect(warningSpy).toHaveBeenCalled();
		});
	});

	describe("updating the quoted premium to a value that causes the discount to be rounded", () => {
		beforeEach(() => {
			// Arrange
			form.controls.quoted.setValue(70.1);

			// Act
			component.quotedChanged();
		});

		// Assert
		it("should update the discount", () => expect(form.controls.discount.value).toBe(29.55));
	});

	describe("updating the discount", () => {
		beforeEach(() => {
			// Arrange
			component.isFiledPremiumAndDiscountAvailable = true;
			form.controls.discount.setValue(40);

			// Act
			component.discountChanged();
		});

		// Assert
		it("should update the quoted premium", () => expect(form.controls.quoted.value).toBe(59.7));

		it("should update the rate change percentage", () => expect(form.controls.rateChangePercentage.value).toBe(-33.296));

		it("should update the filed discount", () => {
			expect(form.controls.filedDiscount.value).toBe(0.5);
		});

		it("should update the suggested discount", () => {
			expect(form.controls.suggestedDiscountPercentage.value).toBe(25.37);
		});
	});

	describe("updating the rate change percentage", () => {
		it("should update the quoted premium", fakeAsync(() => {
			// Arrange + Act
			form.controls.rateChangePercentage.setValue(40);
			tick(500);

			// Assert
			expect(form.controls.quoted.value).toBe(125.3);
		}));

		it("should update the discount", fakeAsync(() => {
			// Arrange + Act
			form.controls.rateChangePercentage.setValue(40);
			tick(500);

			// Assert
			expect(form.controls.discount.value).toBe(-25.93);
		}));

		it("should update the filed discount", fakeAsync(() => {
			// Arrange + Act
			component.isFiledPremiumAndDiscountAvailable = true;
			form.controls.rateChangePercentage.setValue(40);

			tick(500);

			// Assert
			expect(form.controls.filedDiscount.value).toBe(-108.83);
		}));

		it("should update the suggested discount percentage", fakeAsync(() => {
			// Arrange + Act

			form.controls.rateChangePercentage.setValue(40);
			tick(500);

			// Assert
			expect(form.controls.suggestedDiscountPercentage.value).toBe(-56.62);
		}));
	});

	describe("updating the suggested discount percentage", () => {
		beforeEach(() => {
			// Act
			component["triggerSuggestedDiscountPercentage"] = true;
		});
		it("should update the quoted premium", fakeAsync(() => {
			// Arrange + Act
			form.controls.suggestedDiscountPercentage.setValue(0.2);
			tick(500);

			// Assert
			expect(form.controls.quoted.value).toBe(79.84);
		}));

		it("should update the discount", fakeAsync(() => {
			// Arrange + Act
			form.controls.suggestedDiscountPercentage.setValue(0.2);
			tick(500);

			// Assert
			expect(form.controls.discount.value).toBe(19.76);
		}));

		it("should update the filed discount", fakeAsync(() => {
			// Arrange + Act
			form.controls.suggestedDiscountPercentage.setValue(0.2);
			tick(500);

			// Assert
			expect(form.controls.filedDiscount.value).toBe(-33.07);
		}));

		it("should update the rate change percentage", fakeAsync(() => {
			// Arrange + Act

			form.controls.suggestedDiscountPercentage.setValue(0.2);
			tick(500);

			// Assert
			expect(form.controls.rateChangePercentage.value).toBe(-10.793);
		}));
	});

	describe("updating the filed discount", () => {
		beforeEach(() => {
			// Act
			component["triggerFiledDiscountChange"] = true;
		});

		it("should update the quoted premium", fakeAsync(() => {
			// Arrange + Act

			component.form.controls.filedDiscount.setValue(-2);
			tick(500);

			// Assert
			expect(form.controls.quoted.value).toBe(61.2);
		}));

		it("should update the dicount", fakeAsync(() => {
			// Arrange + Act
			component.form.controls.filedDiscount.setValue(-2);
			tick(500);

			// Assert
			expect(form.controls.discount.value).toBe(38.49);
		}));

		it("should update the rate change percentage", fakeAsync(() => {
			// Arrange + Act

			component.form.controls.filedDiscount.setValue(-2);
			tick(500);

			// Assert
			expect(form.controls.rateChangePercentage.value).toBe(-31.62);
		}));

		it("should update the suggested discount percentage", fakeAsync(() => {
			// Arrange + Act

			component.form.controls.filedDiscount.setValue(-2);
			tick(500);

			// Assert
			expect(form.controls.suggestedDiscountPercentage.value).toBe(23.5);
		}));
	});

	describe("updating the discount to a percentage that causes the quoted premium to be rounded", () => {
		beforeEach(() => {
			// Arrange
			component.form.get("discount").setValue(29.5);

			// Act
			component.discountChanged();
		});

		// Assert
		it("should update the quoted premium", () => expect(form.controls.quoted.value).toBe(70.15));

		it("should update the rate change percentage", () => expect(form.controls.rateChangePercentage.value).toBe(-21.62));

		it("should not update the discount", () => expect(form.controls.discount.value).toBe(29.5));
	});

	describe("calling the name method", () => {
		// Arrange
		let result: string = null;

		beforeEach(() => {
			// Act
			result = component.name();
		});

		// Assert
		it("should return the correct name", fakeAsync(() => expect(result).toBe("Test Binder Description - Test Business Line 1")));
	});

	describe("setting quoted to below minimumPremium", () => {
		beforeEach(() => {
			// Arrange
			form.controls.quoted.setValue(40);
		});

		// Assert
		it("should cause a quotedBelowMinimumPremium error", () => {
			expect(form.controls.quoted.errors.quotedBelowMinimumPremium).toBeDefined();
		});
	});

	describe("setting quoted to be equal to minimumPremium", () => {
		beforeEach(() => {
			// Arrange
			form.controls.quoted.setValue(100);
		});

		// Assert
		it("should run as normal because quoted is equal to minimumPremium", () => {
			expect(form.controls.quoted.errors).toBeNull();
		});
	});

	describe("setting quoted to above minimumPremium", () => {
		beforeEach(() => {
			// Arrange
			form.controls.quoted.setValue(200);
		});

		// Assert
		it("should run as normal because quoted is greater than minimumPremium", () => {
			expect(form.controls.quoted.errors).toBeNull();
		});
	});

	function setupTestData(formBuilder: FormBuilder) {
		businessLine = {
			name: "XX",
			description: "Test Business Line 1",
		};

		binder = {
			binderId: 1,
			binderDescription: "Test Binder Description",
			isEuBinder: false,
		};

		pricingInfo = new PricingInformation();
		pricingInfo.businessLine = businessLine;
		pricingInfo.binder = binder;
		pricingInfo.model = 99.5;
		pricingInfo.suggested = 80;
		pricingInfo.minimumPremium = 100;
		pricingInfo.quoted = 79.6;
		pricingInfo.discount = 0;
		pricingInfo.isExpanded = false;
		pricingInfo.defaultFeePercentage = 10;
		pricingInfo.fee = 0;
		pricingInfo.suggestedDiscount = 0;
		pricingInfo.currentRateChangePremium = 100;
		pricingInfo.expiringRateChangePremium = 100;
		pricingInfo.expiringQuotedPremium = 89.5;
		pricingInfo.rateChangePercentage = -11.061;
		pricingInfo.filedPremium = 60;
		pricingInfo.filedDiscount = Math.round((1 - pricingInfo.quoted / pricingInfo.filedPremium) * 100) / 100;
		pricingInfo.suggestedDiscountPercentage = Math.round((1 - pricingInfo.quoted / pricingInfo.suggested) * 100) / 100;
		currency = {
			id: 1,
			name: "US Dollar",
			isoCode: "USD",
			symbol: "$",
			rate: 1.0,
		};

		form = formBuilder.group(pricingInfo);
	}
});

@Component({
	selector: "percentage-input",
	template: "",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockPercentageInputComponent),
			multi: true,
		},
	],
})
class MockPercentageInputComponent implements ControlValueAccessor {
	@Input() public defaultValue: number = 100;
	@Input() public isRequired: boolean = false;
	@Input() public allowNegative: boolean = false;
	@Input() public allowDecimal: boolean = false;
	@Input() public minValue: number = 0;
	@Input() public maxValue: number = 100;
	@Input() public decimalPlaces: number = 2;
	@Output() public valueChange = new EventEmitter<number>();
	@Output() public percentageFormCreated = new EventEmitter<FormGroup>();
	@Input() public readonly: boolean = false;

	public writeValue(obj) {
		return;
	}
	public registerOnChange(fn) {
		return;
	}
	public registerOnTouched(fn) {
		return;
	}
}

@Component({
	selector: "currency",
	template: "",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockCurrencyComponent),
			multi: true,
		},
	],
})
class MockCurrencyComponent implements ControlValueAccessor {
	@Input() public inputName: string = "currency";
	@Input() public isRequired: boolean = false;
	@Input() public decimals: boolean = false;
	@Input() public readonly: boolean = false;
	@Input() public currency: Currency;
	@Input() public value: any;
	@Output() public valueChange = new EventEmitter<number>();
	@Output() public focus = new EventEmitter<boolean>();

	public writeValue(obj) {
		return;
	}
	public registerOnChange(fn) {
		return;
	}
	public registerOnTouched(fn) {
		return;
	}
}

@Directive({ selector: "[LargeNumber]" })
class MockLargeNumberMask {
	@Input() public allowDecimals: boolean = null;
	@Input() public initialValue: number;
	@Output() public onValueChanged = new EventEmitter<number>();
}

@Directive({ selector: "[number-only]" })
class MockNumberOnly {
	@Input() public allowNegative: boolean = false;
	@Input() public allowDecimal: boolean = false;
}
