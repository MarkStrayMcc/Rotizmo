import { TransactionService } from "@app/quote/services/transaction.service";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormGroup } from "@angular/forms";
import { of } from "rxjs";
import { first } from "rxjs/operators";
import { Shallow } from "shallow-render";

import { Quote } from "@app/models";
import { PricingInformation } from "@app/quote/models/pricing/PricingInformation";
import { BindQuotePricingStepComponent } from "@app/quote/popups/bind-quote-modal/bind-quote-pricing-step/bind-quote-pricing-step.component";
import { QuoteModule } from "@app/quote/quote.module";
import { QuoteService } from "@app/quote/services/quote.service";
import { UserService } from "@app/services/user.service";
import { ContactDetails } from "./contact-details.model";
import { DirectBillingService } from "./direct-billing.service";

describe("BindQuotePricingStepComponent", () => {
	let shallow: Shallow<BindQuotePricingStepComponent>;

	const validPaymentLimit = { max: 10000, currency: "USD" };
	const expectedDirectBillingRules = [{ country: "US", products: ["CPA"] }, { country: "GB" }];
	const validQuote = <Quote>{
		client: { primaryLocation: { country: { isoCode: "US" } } },
		currency: { isoCode: validPaymentLimit.currency },
		pricingInformation: [
			<PricingInformation>{ businessLine: { name: "1", description: "a" }, quoted: 450, model: 500 },
			<PricingInformation>{ businessLine: { name: "2", description: "b" }, quoted: 2791, model: 3000 },
		],
		product: { productName: "CPA" },
		brokerTeam: { broker: { brokerId: 1234 } },
		commissionInformation: {
			actualGrossCommission: 0,
			cfcShare: 0,
			fee: 0,
			originalGrossCommission: 0,
		},
	};

	const validGsaBrokerGroupAusQuote = <Quote>{
		client: { primaryLocation: { country: { isoCode: "AU" } } },
		product: { productName: "CPM" },
		brokerTeam: { broker: { brokerGroupId: 1097 } },
	};

	const gsaCPAQuote = <Quote>{
		client: { primaryLocation: { country: { isoCode: "AU" } } },
		product: { productName: "CPA" },
		brokerTeam: { broker: { brokerGroupId: 1097 } },
	};

	const nonGsaBrokerGroupIDQuote = <Quote>{
		client: { primaryLocation: { country: { isoCode: "AU" } } },
		product: { productName: "CPM" },
		brokerTeam: { broker: { brokerGroupId: 1234 } },
	};

	const gsaBrokerGroupUSQuote = <Quote>{
		client: { primaryLocation: { country: { isoCode: "US" } } },
		product: { productName: "CPM" },
		brokerTeam: { broker: { brokerGroupId: 1097 } },
	};

	const expectedContactDetails = {
		firstName: "Kylian",
		lastName: "Lottin",
		companyName: "Tomato Corp.",
		addressLine1: "rue des tomates, 33",
		city: "Paris",
		countryCode: "FR",
		email: "contactez@tomatocorp.fr",
	} as ContactDetails;

	beforeEach(() => {
		shallow = new Shallow(BindQuotePricingStepComponent, QuoteModule)
			.mock(DirectBillingService, {
				getPaymentLimit: () => of(validPaymentLimit),
				directBillingRules: expectedDirectBillingRules,
				getContactDetails: (_: string) => of(expectedContactDetails),
				setIsDirectBillingEnabled: jasmine.createSpy("setIsDirectBillingEnabled"),
				getIsDirectBillingEnabled: jasmine.createSpy("getIsDirectBillingEnabled"),
			})
			.mock(QuoteService, { quote: of(validQuote) })
			.mock(UserService, { isFeatureAccessible: () => true });
	});

	describe("constructor", () => {
		let component: BindQuotePricingStepComponent;

		beforeEach(async () => {
			const { instance } = await shallow.render({ detectChanges: false });
			component = instance;
		});

		it("should create component", () => {
			expect(component).toBeDefined();
		});

		it("should create a disabled billing type control with a default value", () => {
			expect(component.formGroup.controls.isDirectBilling.value).toBe(false);
			expect(component.formGroup.controls.isDirectBilling.disabled).toBe(true);
		});

		it("should create a disabled contact form group", () => {
			expect(component.contactFormGroup.controls.firstName).toBeDefined();
			expect(component.contactFormGroup.controls.lastName).toBeDefined();
			expect(component.contactFormGroup.controls.email).toBeDefined();
			expect(component.contactFormGroup.disabled).toBe(true);
		});
	});

	describe("ngOnInit", () => {
		let component: BindQuotePricingStepComponent;
		let componentFixture: ComponentFixture<BindQuotePricingStepComponent>;

		let mockDirectBillingService: DirectBillingService;
		let mockQuoteService: QuoteService;
		let mockTransactionService: TransactionService;

		beforeEach(async () => {
			const { instance, fixture } = await shallow.render({ detectChanges: false });

			component = instance;
			componentFixture = fixture;

			mockDirectBillingService = TestBed.inject(DirectBillingService);
			mockQuoteService = TestBed.inject(QuoteService);
			mockTransactionService = TestBed.inject(TransactionService);
		});

		describe("paymentLimit$", () => {
			it("should get payment limit by quote country ISO code", () => {
				// Act
				componentFixture.detectChanges();

				// Assert
				expect(mockDirectBillingService.getPaymentLimit).toHaveBeenCalledTimes(1);
				expect(mockDirectBillingService.getPaymentLimit).toHaveBeenCalledWith(validQuote.client.primaryLocation.country.isoCode);
			});

			it("should return retrieved payment limit", async () => {
				// Act
				componentFixture.detectChanges();

				// Assert
				const paymentLimit = await component.paymentLimit$.pipe(first()).toPromise();
				expect(paymentLimit).toEqual(validPaymentLimit);
			});

			it("should return retrieved payment limit for configured country with undefined product list", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{
					...validQuote,
					client: {
						primaryLocation: { country: { isoCode: "GB" } },
					},
					product: { productName: "*" },
				});

				// Act
				componentFixture.detectChanges();

				// Assert
				const paymentLimit = await component.paymentLimit$.pipe(first()).toPromise();
				expect(paymentLimit).toBe(validPaymentLimit);
			});

			it("should be null if direct billing feature is disabled", async () => {
				// Arrange
				const mockUserService = TestBed.inject(UserService);
				mockUserService.isFeatureAccessible = jasmine.createSpy().and.returnValue(false);

				// Act
				componentFixture.detectChanges();

				// Assert
				const paymentLimit = await component.paymentLimit$.pipe(first()).toPromise();
				expect(paymentLimit).toBeNull();
			});

			it("should not get payment limit if direct billing feature is disabled", () => {
				// Arrange
				const mockUserService = TestBed.inject(UserService);
				mockUserService.isFeatureAccessible = jasmine.createSpy().and.returnValue(false);

				// Act
				componentFixture.detectChanges();

				// Assert
				expect(mockDirectBillingService.getPaymentLimit).toHaveBeenCalledTimes(0);
			});

			it("should be null if country is not configured", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{ ...validQuote, client: { primaryLocation: { country: { isoCode: "FR" } } } });

				// Act
				componentFixture.detectChanges();

				// Assert
				const paymentLimit = await component.paymentLimit$.pipe(first()).toPromise();
				expect(paymentLimit).toBeNull();
			});

			it("should be null if product is not configured", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{ ...validQuote, product: { productName: "Invalid" } });

				// Act
				componentFixture.detectChanges();

				// Assert
				const paymentLimit = await component.paymentLimit$.pipe(first()).toPromise();
				expect(paymentLimit).toBeNull();
			});

			it("should not call direct billing endpoint if product not configured", () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{ ...validQuote, product: { productName: "Invalid" } });

				// Act
				componentFixture.detectChanges();

				// Assert
				expect(mockDirectBillingService.getPaymentLimit).toHaveBeenCalledTimes(0);
			});

			it("should set isDirectBilling control true when renewal policy is direct billing", () => {
				// Arrange
				mockTransactionService.isExpiringPolicyDirectBilling$.next(true);

				// Act
				componentFixture.detectChanges();
				component.setIsDirectBillingControl();

				// Assert
				expect(component.isDirectBillingControl.value).toBe(true);
			});

			it("should set isDirectBilling control false when renewal policy is not direct billing", () => {
				// Arrange
				mockTransactionService.isExpiringPolicyDirectBilling$.next(false);

				// Act
				componentFixture.detectChanges();
				component.setIsDirectBillingControl();

				// Assert
				expect(component.isDirectBillingControl.value).toBe(false);
			});
		});

		describe("totalPremium$", () => {
			beforeEach(() => {
				componentFixture.detectChanges();
			});

			it("should build business category form groups from pricing information", () => {
				// Assert
				for (let i = 0; i < validQuote.pricingInformation.length; i++) {
					const pricingInformation = validQuote.pricingInformation[i];
					const formGroup = component.businessCategoriesFormArray.controls[i] as FormGroup;

					expect(formGroup.controls.tagName.value).toBe(pricingInformation.businessLine.name);
					expect(formGroup.controls.description.value).toBe(pricingInformation.businessLine.description);
					expect(formGroup.controls.model.value).toBe(pricingInformation.model);
					expect(formGroup.controls.quoted.value).toBe(pricingInformation.quoted);
				}
			});

			it("should get total premium from business category quotes", async () => {
				// Arrange
				const expectedTotalPremium = component.businessCategoriesFormArray.value
					.map((businessCategory) => businessCategory.quoted)
					.reduce((totalPremium, quoted) => totalPremium + quoted);

				// Act
				const totalPremium = await component.totalPremium$.pipe(first()).toPromise();

				// Assert
				expect(totalPremium).toBe(expectedTotalPremium);
			});
		});

		describe("isDirectBillingVisible$", () => {
			it("should be visible if payment limit exists and currency matches", async () => {
				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(true);
			});

			it("should be hidden if limit currency does not much quote currency", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{ ...validQuote, product: { productName: "Invalid" } });

				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(false);
			});

			it("should be hidden if no payment limit exists", async () => {
				// Arrange
				mockDirectBillingService.getPaymentLimit = jasmine.createSpy().and.returnValue(of(null));

				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(false);
			});

			it("should call direct billing service to set direct billing as disabled if selected as agency billing", () => {
				// Arrange
				mockDirectBillingService.setIsDirectBillingEnabled = jasmine.createSpy("setDirectBillingEnabled");

				// Act
				componentFixture.detectChanges();

				// Assert
				expect(mockDirectBillingService.setIsDirectBillingEnabled).toHaveBeenCalledWith(false);
			});

			it("should call direct billing service to set direct billing as enabled if selected as direct billing", () => {
				// Arrange
				mockDirectBillingService.setIsDirectBillingEnabled = jasmine.createSpy("setDirectBillingEnabled");
				componentFixture.detectChanges();

				//Act
				component.formGroup.controls.isDirectBilling.setValue(true);

				// Assert
				expect(mockDirectBillingService.setIsDirectBillingEnabled).toHaveBeenCalledWith(true);
			});

			it("should be visible if broker fee does not exist in commission information", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{
					...validQuote,
					commissionInformation: {
						originalGrossCommission: 1,
						actualGrossCommission: 1,
						cfcShare: 1,
						fee: 1,
					}
				});

				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(true);
			});

			it("should be visible if broker fee is null in commission information", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{
					...validQuote,
					commissionInformation: {
						originalGrossCommission: 1,
						actualGrossCommission: 1,
						cfcShare: 1,
						fee: 1,
						brokerFee: null,
					}
				});

				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(true);
			});
			it("should be visible if broker fee is undefined in commission information", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{
					...validQuote,
					commissionInformation: {
						originalGrossCommission: 1,
						actualGrossCommission: 1,
						cfcShare: 1,
						fee: 1,
						brokerFee: undefined,
					}
				});

				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(true);
			});

			it("should not be visible if broker fee is greater than 0", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{
					...validQuote,
					commissionInformation: {
						originalGrossCommission: 1,
						actualGrossCommission: 1,
						cfcShare: 1,
						fee: 1,
						brokerFee: 100.00,
					}
				});

				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(false);
			});

			it("should be visible if broker fee is 0", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{
					...validQuote,
					commissionInformation: {
						originalGrossCommission: 1,
						actualGrossCommission: 1,
						cfcShare: 1,
						fee: 1,
						brokerFee: 0,
					}
				});

				// Act
				componentFixture.detectChanges();

				// Assert
				const isDirectBillingVisible = await component.isDirectBillingVisible$.pipe(first()).toPromise();
				expect(isDirectBillingVisible).toBe(true);
			});
		});

		describe("isPaymentPeriodVisible$", () => {
			it("should be visible if bizcover quote ", async () => {
				//Arrange
				mockQuoteService.quote = of(<Quote>{ ...validGsaBrokerGroupAusQuote });

				// Act
				componentFixture.detectChanges();

				// Assert
				const isPaymentPeriodEnabled = await component.isPaymentPeriodVisible$.pipe(first()).toPromise();
				expect(isPaymentPeriodEnabled).toBe(true);
			});

			it("should not be visible if bizcover quote is not Australia", async () => {
				//Arrange
				mockQuoteService.quote = of(<Quote>{ ...gsaBrokerGroupUSQuote });

				// Act
				componentFixture.detectChanges();

				// Assert
				const isPaymentPeriodEnabled = await component.isPaymentPeriodVisible$.pipe(first()).toPromise();

				expect(isPaymentPeriodEnabled).toBe(false);
			});

			it("should not be visible if bizcover quote is not CPM", async () => {
				//Arrange
				mockQuoteService.quote = of(<Quote>{ ...gsaCPAQuote });

				// Act
				componentFixture.detectChanges();

				// Assert
				const isPaymentPeriodEnabled = await component.isPaymentPeriodVisible$.pipe(first()).toPromise();

				expect(isPaymentPeriodEnabled).toBe(false);
			});

			it("should not be visible if quote doesn't have BizCover quote ID", async () => {
				//Arrange
				mockQuoteService.quote = of(<Quote>{ ...nonGsaBrokerGroupIDQuote });

				// Act
				componentFixture.detectChanges();

				// Assert
				const isPaymentPeriodEnabled = await component.isPaymentPeriodVisible$.pipe(first()).toPromise();

				expect(isPaymentPeriodEnabled).toBe(false);
			});

			it("should not be visible if not a bizcover quote ", async () => {
				//Arrange
				mockQuoteService.quote = of(<Quote>{ ...validQuote });

				// Act
				componentFixture.detectChanges();

				// Assert
				const isPaymentPeriodEnabled = await component.isPaymentPeriodVisible$.pipe(first()).toPromise();
				expect(isPaymentPeriodEnabled).toBe(false);
			});
		});

		describe("contactDetails$", () => {
			it("should get contact details if direct billing is available and returns valid response", async () => {
				// Act
				componentFixture.detectChanges();
				const contactDetails = await component.contactDetails$.pipe(first()).toPromise();

				// Assert
				expect(contactDetails).toEqual(expectedContactDetails);
			});

			it("should update contact form values on load with contact details response", async () => {
				// Arrange
				const expectedFormValues = {
					firstName: expectedContactDetails.firstName,
					lastName: expectedContactDetails.lastName,
					email: expectedContactDetails.email,
				};

				// Act
				componentFixture.detectChanges();
				await component.contactDetails$.pipe(first()).toPromise();

				// Assert
				expect(component.contactFormGroup.value).toEqual(expectedFormValues);
			});

			it("should empty direct billing form value on load if direct billing is available and returns not found response", async () => {
				// Arrange
				mockDirectBillingService.getContactDetails = jasmine.createSpy("mockDirectBillingService.getContactDetails").and.returnValue(of(null));
				const expectedFormValues = {
					firstName: null,
					lastName: null,
					email: null,
				};

				// Act
				componentFixture.detectChanges();
				component.contactDetails$.pipe(first()).toPromise();

				// Assert
				expect(component.contactFormGroup.value).toEqual(expectedFormValues);
			});

			it("should not get contact details if direct billing is not available", async () => {
				// Arrange
				mockQuoteService.quote = of(<Quote>{
					...validQuote,
					product: { productName: "TECH" },
				});

				// Act
				componentFixture.detectChanges();
				const contactDetails = await component.contactDetails$.pipe(first()).toPromise();

				// Assert
				expect(contactDetails).toBeNull();
			});
		});

		describe("isMaxLimitExceeded$", () => {
			it("should be true if total premium is great than payment limit", async () => {
				// Arrange
				const lowPaymentLimit = { max: 10, currency: "USD" };
				mockDirectBillingService.getPaymentLimit = jasmine.createSpy().and.returnValue(of(lowPaymentLimit));

				// Act
				componentFixture.detectChanges();

				// Assert
				const isMaxLimitExceeded = await component.isMaxLimitExceeded$.pipe(first()).toPromise();
				expect(isMaxLimitExceeded).toBe(true);
			});

			it("should be false if total premium is is less than or equal to payment limit", async () => {
				// Act
				componentFixture.detectChanges();

				// Assert
				const isMaxLimitExceeded = await component.isMaxLimitExceeded$.pipe(first()).toPromise();
				expect(isMaxLimitExceeded).toBe(false);
			});

			it("should be false if payment limit is null", async () => {
				// Arrange
				mockDirectBillingService.getPaymentLimit = jasmine.createSpy().and.returnValue(of(null));

				// Act
				componentFixture.detectChanges();

				// Assert
				const isMaxLimitExceeded = await component.isMaxLimitExceeded$.pipe(first()).toPromise();
				expect(isMaxLimitExceeded).toBe(false);
			});
		});

		describe("subscribeToTotalPremiumChange", () => {
			const totalPremium = validQuote.pricingInformation.map((pi) => pi.quoted).reduce((totalPremium, quoted) => totalPremium + quoted);

			const validLimit = { max: totalPremium + 1, currency: validQuote.currency.isoCode };

			beforeEach(() => {
				mockDirectBillingService.getPaymentLimit = () => of(validLimit);
				component.formGroup.controls.isDirectBilling.setValue(true);
			});

			it("should enable billing dropdown when quote is valid for direct billing", () => {
				// Act
				componentFixture.detectChanges();

				// Assert
				expect(component.formGroup.controls.isDirectBilling.enabled).toBe(true);
			});

			it("should disable and reset billing dropdown when no limit exists", () => {
				// Arrange
				mockDirectBillingService.getPaymentLimit = () => of(null);

				// Act
				componentFixture.detectChanges();

				// Assert
				expect(component.formGroup.controls.isDirectBilling.disabled).toBe(true);
				expect(component.formGroup.controls.isDirectBilling.value).toBe(false);
			});

			it("should disable and reset billing dropdown when limit max is less than total premium", () => {
				// Arrange
				mockDirectBillingService.getPaymentLimit = () => of({ max: totalPremium - 1, currency: "USD" });

				// Act
				componentFixture.detectChanges();

				// Assert
				expect(component.formGroup.controls.isDirectBilling.disabled).toBe(true);
				expect(component.formGroup.controls.isDirectBilling.value).toBe(false);
			});
		});

		describe("subscribeToIsDirectBillingSelected", () => {
			beforeEach(() => {
				mockDirectBillingService.setIsDirectBillingEnabled = jasmine.createSpy("setDirectBillingEnabled");
				componentFixture.detectChanges();
			});

			it("should enable contact form when direct billing is selected", async () => {
				// Act
				component.formGroup.controls.isDirectBilling.setValue(true);

				// Assert
				expect(component.contactFormGroup.enabled).toBe(true);
			});

			it("should disable contact form when agency billing is selected", () => {
				// Act
				component.formGroup.controls.isDirectBilling.setValue(false);

				// Assert
				expect(component.contactFormGroup.disabled).toBe(true);
			});
		});
	});

	describe("validate", () => {
		let component: BindQuotePricingStepComponent;

		beforeEach(async () => {
			const { instance } = await shallow.render({ detectChanges: false });
			component = instance;
		});

		it("should return invalid when the form group is invalid", () => {
			// Arrange
			component.formGroup.setErrors({ incorrect: true });

			// Act
			const errors = component.validate();

			// Assert
			expect(errors).toEqual({ invalid: true });
		});

		it("should return null when the form group is valid", () => {
			// Act
			const errors = component.validate();

			// Assert
			expect(errors).toBeNull();
		});
	});
});
