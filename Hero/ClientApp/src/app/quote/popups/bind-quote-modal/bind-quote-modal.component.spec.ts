import { Component, EventEmitter, forwardRef, Injectable, Input, Output } from "@angular/core";
import { ComponentFixture, inject, TestBed } from "@angular/core/testing";
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { CfcContact, Currency, Quote, QuoteSubjectivity, RiskQuestionAnswer, SurplusLine } from "@app/models";
import { BordereauHttpService } from "@app/quote/services/bordereau-http.service";
import { SurplusLinesLicenseHttpService } from "@app/quote/services/surplus-lines-license-http.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PricingService } from "@app/quote/services/pricing-service";
import { QuoteHttpService } from "@app/services/quote-http.service";
import { UserService } from "@app/services/user.service";
import * as moment from "moment";
import { from, of } from "rxjs";
import { getTestQuote } from "../../../../test-helpers/index";
import { BindQuoteModalComponent } from "./bind-quote-modal.component";
import { DirectBillingService } from "./bind-quote-pricing-step/direct-billing.service";
import { TransactionBillingHttpService } from "./transaction-billing.http-service";
import { PricingResult } from "@app/quote/models/pricing/PricingResult";
import { QuoteService } from "@app/quote/services/quote.service";
import { BlastZoneHttpService } from "@app/services/blast-zone-http.service";
import { ToastrService } from "@app/shared/toastr/toastr.service";

describe("BindQuoteModalComponent", () => {
	let component: BindQuoteModalComponent;
	let fixture: ComponentFixture<BindQuoteModalComponent>;
	let matDialogRef: MatDialogRef<BindQuoteModalComponent>;
	let pricingService: PricingService;
	let quoteService: QuoteService;

	let mockBlastZoneHttpService = jasmine.createSpyObj("BlastZoneHttpService", ["updateBlastZoneReservation"]);
	let mockToastrService = jasmine.createSpyObj("ToastrService", ["show"]);


	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				BindQuoteModalComponent,
				MockSkipToComponent,
				MockBindQuoteBasicStepComponent,
				MockBindQuoteSubjectivitiesStepComponent,
				MockBindQuotePricingStepComponent,
			],
			imports: [MatDialogModule, ReactiveFormsModule],
			providers: [
				{ provide: MatDialogRef, useClass: MockMatDialogRef },
				{ provide: ModalDialogService, useClass: MockModalDialogService },
				{ provide: QuoteHttpService, useValue: { bindQuote: () => null } },
				{ provide: DropDownManagerService, useClass: MockDropDownManagerService },
				{ provide: PremiumCalculationsService, useClass: MockPremiumCalculationsService },
				{ provide: PricingService, useClass: MockPricingService },
				{ provide: UserService, useValue: { getUser: () => null } },
				{ provide: SurplusLinesLicenseHttpService, useClass: MockSurplusLineHttpService },
				{ provide: BordereauHttpService, useClass: MockBordereauHttpService },
				{ provide: TransactionBillingHttpService, useValue: { put: () => of() } },
				{ provide: DirectBillingService, useValue: { getPaymentLimit: () => of(null), getIsDirectBillingEnabled: () => of(null) } },
				{ provide: QuoteService, useValue: { calculatePolicyLocationPremiums: () => [] } },
				{ provide: BlastZoneHttpService, useValue: mockBlastZoneHttpService },
				{ provide: ToastrService, useValue: mockToastrService }
			],
		}).compileComponents();
	});

	beforeEach(() => {
		matDialogRef = TestBed.inject(MatDialogRef);
		fixture = TestBed.createComponent(BindQuoteModalComponent);
		component = fixture.componentInstance;
		component.quote = getTestQuote();
		pricingService = TestBed.inject(PricingService);
		quoteService = TestBed.inject(QuoteService);
		fixture.detectChanges();
	});

	it("should create component", () => {
		expect(component).toBeDefined();
	});

	it("should have the current step set to Basic on initialisation", () => {
		// Assert
		expect(component.currentStep).toBe(0);
		expect(component.steps.basic).toBe(component.currentStep);
	});

	it("should have 3 ordered steps on initialisation", () => {
		// Assert
		expect(Object.keys(component.steps).length).toBe(3);
		expect(component.steps.basic).toBe(0);
		expect(component.steps.subjectivities).toBe(1);
		expect(component.steps.pricing).toBe(2);
	});

	it("should have 3 form controls on initialisation", () => {
		// Assert
		expect(component.bindQuoteForm.controls.basic).toBeDefined();
		expect(component.bindQuoteForm.controls.subjectivities).toBeDefined();
		expect(component.bindQuoteForm.controls.pricing).toBeDefined();
	});

	it("should set ABN form control to null if the risk question is not on the quote", () => {
		// Arrange
		const riskQuestionAnswers = [{ riskQuestionTag: "TEST1", text: "Blah" }] as RiskQuestionAnswer[];
		component.quote.riskQuestionAnswers = riskQuestionAnswers;

		// Act
		component.ngOnInit();

		// Assert
		expect(component.ABN).toBeFalsy();
	});

	it("should set ABN form control to the risk question answer text value", () => {
		// Arrange
		const riskQuestionAnswers = [
			{ riskQuestionTag: "TEST1", text: "Blah" },
			{ riskQuestionTag: "ABN", text: "123456" },
		] as RiskQuestionAnswer[];
		component.quote.riskQuestionAnswers = riskQuestionAnswers;

		// Act
		component.ngOnInit();

		// Assert
		expect(component.ABN).toBe("123456");
	});

	describe("setStep", () => {
		const eeaSubjectivity = <QuoteSubjectivity>{ subjectivity: { subjectivityId: 246002 } };
		const slSubjectivity = <QuoteSubjectivity>{ subjectivity: { subjectivityId: 23 } };
		const abnSubjectivity = <QuoteSubjectivity>{ subjectivity: { subjectivityId: 131245 } };
		const eeaSubjectivityConfiguration = <QuoteSubjectivity>{ subjectivityUid: "c54b3ea3-f78d-428c-99a6-c8756a268265" };
		const slSubjectivityConfiguration = <QuoteSubjectivity>{ subjectivityUid: "6b7e36d4-5364-4762-9341-657d7336f4f8" };
		const abnSubjectivityConfiguration = <QuoteSubjectivity>{ subjectivityUid: "6a5a6a63-4aee-450d-8072-3ab5d06f2d80" };
		const abnRiskQuestionAnswer = <RiskQuestionAnswer>{ riskQuestionTag: "ABN", text: "Blah" };

		beforeEach(() => {
			component.currentStep = 0;
			component.quote.subjectivities.push(eeaSubjectivity);
			component.quote.subjectivities.push(slSubjectivity);
			component.quote.subjectivities.push(abnSubjectivity);
		});

		it("should remove SL broker subjectivity if there is an SL Broker present", () => {
			// Arrange
			component.quote.surplusLineBroker = <SurplusLine>{ id: 654, brokerName: "Test Broker" };
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).not.toContain(slSubjectivity);
		});

		it("should remove SL broker subjectivity using SubjectivityUid if there is an SL Broker present", () => {
			// Arrange
			component.quote.surplusLineBroker = <SurplusLine>{ id: 654, brokerName: "Test Broker" };
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).not.toContain(slSubjectivityConfiguration);
		});

		it("should keep SL broker subjectivity if no SL Broker is present", () => {
			// Arrange
			component.quote.surplusLineBroker = null;
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).toContain(slSubjectivity);
		});

		it("should remove ABN subjectivity if there is an answered ABN risk question", () => {
			// Arrange
			component.quote.riskQuestionAnswers = [abnRiskQuestionAnswer];
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).not.toContain(abnSubjectivity);
		});

		it("should remove ABN subjectivity using SubjectivityUid if there is an answered ABN risk question", () => {
			// Arrange
			component.quote.riskQuestionAnswers = [abnRiskQuestionAnswer];
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).not.toContain(abnSubjectivityConfiguration);
		});

		it("should keep ABN subjectivity if there is not an answered ABN risk question", () => {
			// Arrange
			component.quote.riskQuestionAnswers = [];
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).toContain(abnSubjectivity);
		});

		it("should remove EEA broker subjectivity if there is a Local Broker present", () => {
			// Arrange
			component.quote.localBroker = { id: 453, name: "Test", broker: <any>{} };
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).not.toContain(eeaSubjectivity);
		});

		it("should remove EEA broker subjectivity using SubjectivityUid if there is a Local Broker present ", () => {
			// Arrange
			component.quote.localBroker = { id: 453, name: "Test", broker: <any>{} };

			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).not.toContain(eeaSubjectivityConfiguration);
		});

		it("should keep EEA broker subjectivity if no Local Broker is present", () => {
			// Arrange
			component.quote.localBroker = null;
			component.ngOnInit();

			// Act
			component.setStep(1);

			// Assert
			expect(component.subjectivities).toContain(eeaSubjectivity);
		});
	});

	it("should close Material modal when closing modal", () => {
		// Arrange
		spyOn(matDialogRef, "close");

		// Act
		component.onCloseModal();

		// Assert
		expect(matDialogRef.close).toHaveBeenCalledTimes(1);
	});

	it("should set current step when the given step number is available", () => {
		// Arrange
		component.currentStep = 0;

		// Act
		component.setStep(1);
		const currentStepFirst = component.currentStep;
		component.setStep(-1);
		const currentStepSecond = component.currentStep;
		component.setStep(2);
		const currentStepThird = component.currentStep;
		component.setStep(10);

		// Assert
		expect(currentStepFirst).toBe(1);
		expect(currentStepSecond).toBe(1);
		expect(currentStepThird).toBe(2);
		expect(component.currentStep).toBe(2);
	});

	it("should set current step when the given step number is enabled", () => {
		// Arrange
		component.currentStep = 0;

		// Act
		component.setStep(1);
		const currentStepFirst = component.currentStep;
		component.setStep(0);
		const currentStepSecond = component.currentStep;
		component.setStep(2);
		const currentStepThird = component.currentStep;
		component.setStep(1);
		const currentStepFourth = component.currentStep;
		component.setStep(2);
		const currentStepFifth = component.currentStep;
		component.setStep(0);

		// Assert
		expect(currentStepFirst).toBe(1);
		expect(currentStepSecond).toBe(0);
		expect(currentStepThird).toBe(0);
		expect(currentStepFourth).toBe(1);
		expect(currentStepFifth).toBe(2);
		expect(component.currentStep).toBe(0);
	});

	it("should set the current step to the next step if available", () => {
		// Arrange
		component.currentStep = 0;

		// Act
		component.nextStep();
		const currentStepFirst = component.currentStep;
		component.nextStep();
		const currentStepSecond = component.currentStep;
		component.nextStep();

		// Assert
		expect(currentStepFirst).toBe(1);
		expect(currentStepSecond).toBe(2);
		expect(component.currentStep).toBe(2);
	});

	it("should set the current step to the previous step if available", () => {
		// Arrange
		component.currentStep = 2;

		// Act
		component.previousStep();
		const currentStepFirst = component.currentStep;
		component.previousStep();
		const currentStepSecond = component.currentStep;
		component.previousStep();

		// Assert
		expect(currentStepFirst).toBe(1);
		expect(currentStepSecond).toBe(0);
		expect(component.currentStep).toBe(0);
	});

	it("should only enable steps sequentially", () => {
		// Arrange
		component.currentStep = 0;

		// Act
		const isEnabledDatesFirst = component.isEnabled(0);
		const isEnabledSubjectivitiesFirst = component.isEnabled(1);
		const isEnabledPricingFirst = component.isEnabled(2);

		component.currentStep = 1;

		const isEnabledDatesSecond = component.isEnabled(0);
		const isEnabledSubjectivitiesSecond = component.isEnabled(1);
		const isEnabledPricingSecond = component.isEnabled(2);

		component.currentStep = 2;

		const isEnabledDatesThird = component.isEnabled(0);
		const isEnabledSubjectivitiesThird = component.isEnabled(1);
		const isEnabledPricingThird = component.isEnabled(2);

		// Assert
		expect(isEnabledDatesFirst).toBeTruthy();
		expect(isEnabledSubjectivitiesFirst).toBeTruthy();
		expect(isEnabledPricingFirst).toBeFalsy();

		expect(isEnabledDatesSecond).toBeTruthy();
		expect(isEnabledSubjectivitiesSecond).toBeTruthy();
		expect(isEnabledPricingSecond).toBeTruthy();

		expect(isEnabledDatesThird).toBeTruthy();
		expect(isEnabledSubjectivitiesThird).toBeTruthy();
		expect(isEnabledPricingThird).toBeTruthy();
	});

	describe("direct billing", () => {
		let directBillingService: DirectBillingService;
		let quoteHttpService: QuoteHttpService;
		let isDirectBillingEnabledSpy: jasmine.Spy;

		beforeEach(() => {
			directBillingService = TestBed.inject(DirectBillingService);
			quoteHttpService = TestBed.inject(QuoteHttpService);
			isDirectBillingEnabledSpy = spyOn(directBillingService, "getIsDirectBillingEnabled").and.returnValue(of(true));
		});

		it("should watch for direct billing changes", () => {
			component.ngOnInit();
			expect(isDirectBillingEnabledSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("prorating", () => {
		it("should call calculateProRatedPremiums when expiryDate is changed", () => {
			// Arrange
			component.currentStep = 0;
			spyOn(component, "recalculatePremiums");

			// Act
			component.bindQuoteForm.get("basic").get("expiryDate").markAsDirty();
			component.nextStep();

			// Assert
			expect(component.recalculatePremiums).toHaveBeenCalled();
		});

		it("should update the prorated pricing information keeping the full fee when the expiry date is changed", () => {
			// Arrange
			component.currentStep = 0;

			component.quote.pricingInformation = getMockPricingInformation();
			let proRatedPricing = getMockPricingInformation();
			proRatedPricing[0].quoted = cpQuoted - 500;
			proRatedPricing[1].quoted = cxQuoted - 500;
			proRatedPricing[0].fee = cpFee - 30;
			proRatedPricing[1].fee = cxFee - 30;

			let proRatedPricingResult = new PricingResult();
			proRatedPricingResult.pricingInformations = proRatedPricing;

			spyOn(pricingService, "getProRatedPricingInformation").and.returnValue(of(proRatedPricingResult));
			spyOn(pricingService, "updateProRatedPricingInformationWithFullFee");

			// Act
			component.bindQuoteForm.get("basic").get("expiryDate").markAsDirty();
			component.nextStep();

			// Assert
			expect(pricingService.updateProRatedPricingInformationWithFullFee).toHaveBeenCalledWith(component.quote.pricingInformation, proRatedPricing);
		});

		it("should not change the fee when inception date or expiryDate is changed on bind", () => {
			// Arrange
			component.currentStep = 0;
			component.quote.pricingInformation = getMockPricingInformation();
			spyOn(component, "recalculatePremiums");

			// Act
			component.bindQuoteForm.get("basic").get("expiryDate").markAsDirty();
			component.nextStep();

			// Assert
			expect(component.recalculatePremiums).toHaveBeenCalled();
			expect(component.quote.pricingInformation[0].fee).toBe(cpFee);
		});

		it("should set isCalculating to false when the call to prorate is done", () => {
			// Arrange
			component.currentStep = 0;
			component.isCalculating = true;
			component.quote.pricingInformation = getMockPricingInformation();

			// Act
			component.bindQuoteForm.get("basic").get("expiryDate").markAsDirty();
			component.nextStep();

			// Assert
			expect(component.isCalculating).toBe(false);
		});
	});

	it("should display an error when the bordereau http service returns false for the received date", inject(
		[BordereauHttpService],
		(bordereauHttpService: BordereauHttpService) => {
			// Arrange
			spyOn(bordereauHttpService, "isReceivedDateValid").and.returnValue(of(false));

			// Act
			component.ngOnInit();
			component.bindQuoteForm.get("basic").get("receivedDate").setValue(moment("2021-04-21"));

			// Assert
			expect(component.bindQuoteForm.get("basic").get("receivedDate").errors.monthClosed).toBeTruthy();
		}
	));

	it("should not display an error when the bordereau http service returns true for the received date", inject(
		[BordereauHttpService],
		(bordereauHttpService: BordereauHttpService) => {
			// Arrange
			spyOn(bordereauHttpService, "isReceivedDateValid").and.returnValue(of(true));

			// Act
			component.ngOnInit();
			component.bindQuoteForm.get("basic").get("receivedDate").setValue(moment("2021-04-21"));

			// Assert
			expect(component.bindQuoteForm.get("basic").get("receivedDate").errors).toBe(null);
		}
	));
	describe("test payment object", () => {

		it("should set payment method to direct billing if direct billing is true", () => {

			//Arrange
			let isDirectBilling: boolean = true;
			let paymentPeriod: string = "Annual";

			//Act
			var paymentObject = component["getPayment"](isDirectBilling, paymentPeriod)

			//Assert
			expect(paymentObject.period).toEqual("Annual");
			expect(paymentObject.method).toBe("DirectBilling");
		});

		it("should set payment method to agency if direct billing is false", () => {

			//Arrange
			let isDirectBilling: boolean = false;
			let paymentPeriod: string = "Monthly";

			//Act
			var paymentObject = component["getPayment"](isDirectBilling, paymentPeriod)

			//Assert
			expect(paymentObject.period).toEqual("Monthly");
			expect(paymentObject.method).toBe("Agency");
		});
	});
});

@Component({ selector: "skip-to", template: "" })
class MockSkipToComponent {
	@Input() public isPrevious = false;
	@Input() public isDisabled = false;
	@Output() public onSkipToClick = new EventEmitter();
}

class MockMatDialogRef<T> {
	public close(dialogResult?: any): void {
		return;
	}
}

@Injectable()
class MockModalDialogService { }

@Component({
	selector: "bind-quote-basic-step",
	template: "",
})
class MockBindQuoteBasicStepComponent {
	@Input() public form: FormGroup;
	@Input() public countryId: number;
	@Input() public brokerTeamId: number;
	@Input() public state: string;
	@Input() public quote: Quote;
}

@Component({
	providers: [
		{
			multi: true,
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockBindQuoteSubjectivitiesStepComponent),
		},
	],
	selector: "bind-quote-subjectivities-step",
	template: "",
})
class MockBindQuoteSubjectivitiesStepComponent implements ControlValueAccessor {
	@Input() public showOnlyPostError = false;
	@Output() public sizeChanged = new EventEmitter();

	public writeValue(obj: any) {
		return;
	}

	public registerOnChange(fn: any) {
		return;
	}

	public registerOnTouched(fn: any) {
		return;
	}
}

@Component({
	selector: "bind-quote-pricing-step",
	template: "",
})
class MockBindQuotePricingStepComponent {
	@Input() public form: FormGroup;
	@Input() public currency: Currency;
	@Input() public isBinding: boolean;
	@Input() public isCalculating: boolean;
}

@Injectable()
class MockDropDownManagerService {
	public setDropDownItem = () => null;
	public setSurplusLineDropDownItem = () => null;
	public setSurplusLineFromDropDownItem = () => { };
}

@Injectable()
class MockPremiumCalculationsService {
	public resetFees = () => { };
	public calculateTotalFee = () => { };
	public calculateFeeSplit = () => { };
}

@Injectable()
class MockPricingService {
	public getProRatedPricingInformation = () => of([]);
	public updateProRatedPricingInformationWithFullFee = () => of([]);
}

@Injectable()
class MockSurplusLineHttpService {
	public getSurplusLines = () => from([[]]);
	public saveSurplusLine = () => from([]);
}

@Injectable()
class MockBordereauHttpService {
	public isReceivedDateValid = () => of(false);
}

const cpQuoted = 1350;
const cpFee = 90;
const cxQuoted = 800;
const cxFee = 50;

function getMockPricingInformation() {
	return [getPricingInformation("CP", cpQuoted, cpFee), getPricingInformation("CX", cxQuoted, cxFee)];
}

function getBinder() {
	return {
		binderId: 254,
		binderDescription: "SME Cyber",
		isEuBinder: false,
	};
}

function getBusinessLine(businessLineName: string) {
	return {
		name: businessLineName,
		description: "Cyber & Privacy",
	};
}

function getPricingInformation(businessLineName: string, quoteValue: number, feeValue: number) {
	const currentRateChangePremium = 2000;
	const expiringRateChangePremium = 1200;
	const expiringQuotedPremium = 89;
	const filedPremium = 1230;
	const suggested = 1350;

	return {
		businessLine: getBusinessLine(businessLineName),
		model: 308,
		suggested: suggested,
		minimumPremium: 300,
		quoted: quoteValue,
		discount: -338.31,
		isExpanded: true,
		defaultFeePercentage: 10,
		fee: feeValue,
		binder: getBinder(),
		binderSectionId: 828,
		isSelectedLine: true,
		ratingEngineVersionId: 1167,
		suggestedDiscount: 0,
		currentRateChangePremium: currentRateChangePremium,
		expiringRateChangePremium: expiringRateChangePremium,
		expiringQuotedPremium: expiringQuotedPremium,
		rateChangePercentage: (quoteValue / currentRateChangePremium / (expiringQuotedPremium / expiringRateChangePremium) - 1) * 100,
		filedPremium: filedPremium,
		filedDiscount: Math.round((1 - (quoteValue / filedPremium)) * 100) / 100,
		suggestedDiscountPercentage: Math.round((1 - (quoteValue / suggested)) * 100) / 100
	};
}
