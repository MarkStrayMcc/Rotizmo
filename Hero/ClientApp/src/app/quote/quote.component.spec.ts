/* tslint:disable:max-classes-per-file */
import { ChangeDetectorRef } from "@angular/core";
import { fakeAsync, flush, tick } from "@angular/core/testing";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { EmailType, QuoteState } from "@app/enums";
import { CfcContact, DropDownItem, Email, Quote } from "@app/models";
import { MtaService } from "@app/policy/services/mta.service";
import { Enquiry } from "@app/quote/models/enquiry/Enquiry";
import { CurrencyService } from "@app/quote/services/currency.service";
import { EnquiryService } from "@app/quote/services/enquiry.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PricingService } from "@app/quote/services/pricing-service";
import { SubjectivityService } from "@app/quote/services/subjectivity/subjectivity.service";
import { WordingVersionHttpService } from "@app/quote/services/wording-version/wording-version-http-service";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { ClientClearanceService } from "@app/services/client-clearance-service";
import { ConfigService } from "@app/services/config.service";
import { DropdownService } from "@app/services/dropdown.service";
import { EnquiryValidationService } from "@app/services/enquiry-validation.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { QuoteHttpService } from "@app/services/quote-http.service";
import { TaxHttpService } from "@app/services/tax-http.service";
import { UserService } from "@app/services/user.service";
import { getTestQuote } from "@test-helpers/index";
import { Observable, of } from "rxjs";
import { CheckClientSanctionsService } from "./components/client-sanctions-check/check-client-sanctions.service";
import { Language } from "./models/Language";
import { QuoteComponent } from "./quote.component";
import { LanguageService } from "./services/language.service";
import { QuoteService } from "./services/quote.service";
import { PropertyLimitsValidator } from "./steps/endorsements-step/modals/multiple-property/property-limit/property-limits-validator";
import { ButtonStatus } from "./view-models/ButtonStatus";
import { ToastrService } from "@app/shared/toastr/toastr.service";
import { CoverageService } from '@app/services/coverage.service';
import { BlastZoneHttpService } from '@app/services/blast-zone-http.service';
import { PropertyLimit } from './models/property-limit.model';
import { LoggingService } from "@app/services/logging.service";
import { BrokerContactHttpService } from '@app/services/broker-contact-http-service';

describe("QuoteComponent", () => {
	let component: QuoteComponent;
	let dropdownService: DropdownService;
	let cdRef: ChangeDetectorRef;
	let taxHttpService: TaxHttpService;
	let dialog: MatDialog;
	let messageErrorHandler: ErrorMessageHandlerService;
	let configService: ConfigService;
	let underwriterDiscountService: UnderwriterDiscountAuthorityService;
	let underwriterActivityValidationService: UnderwriterActivityValidationService;
	let underwriterRiskValidationService: UnderwriterRiskValidationService;
	let coverageAuthorityService: UnderwriterCoverageAuthorityService;
	let goodsAndServicesTaxService: GoodsAndServicesTaxService;
	let clientClearanceService: ClientClearanceService;
	let subjectivityService: SubjectivityService;
	let mtaService: MtaService;
	let currencyService: CurrencyService;
	let propertyLimitsValidator: PropertyLimitsValidator;
    let mockQuoteService :any;

	beforeEach(() => {
        mockQuoteService = {
            insertQuote: jasmine.createSpy("insertQuote").and.returnValue(of(mockInsertQuoteResponse)),
            saveDraft: () => of(getTestQuote()),
            isPublishableQuote: () => of(true),
            confirmQuoteSent: jasmine.createSpy("confirmQuoteSent").and.returnValue(of(true)),
        };
		component = new QuoteComponent(
			mockRouter as unknown as Router,
			dialog,
			dropdownService,
			mockQuoteService as unknown as QuoteHttpService,
			cdRef,
			mockEnquiryService as unknown as EnquiryService,
			taxHttpService,
			mockPremiumCalculationsService as unknown as PremiumCalculationsService,
			mockActivatedRouteMock as unknown as ActivatedRoute,
			mockModalDialogService as unknown as ModalDialogService,
			mockUserService as unknown as UserService,
			mockBinderValidationService as unknown as BinderValidationService,
			messageErrorHandler,
			mockMessageService as unknown as MessageService,
			mockEnquiryValidationService as unknown as EnquiryValidationService,
			configService,
			mockNavigationOverrideService as unknown as NavigationOverrideService,
			mockPricingService as unknown as PricingService,
			underwriterDiscountService,
			underwriterActivityValidationService,
			underwriterRiskValidationService,
			coverageAuthorityService,
			goodsAndServicesTaxService,
			mockWordingVersionService as unknown as WordingVersionHttpService,
			clientClearanceService,
			mockQuoteVMService as unknown as QuoteService,
			mtaService,
			currencyService,
			propertyLimitsValidator,
			mockCheckClientSanctionsService as unknown as CheckClientSanctionsService,
			subjectivityService,
			mockLanguageService as unknown as LanguageService,
			mockToastrService as unknown as ToastrService,
            mockCoverageService as unknown as CoverageService,
            mockBlastZoneHttpService as unknown as BlastZoneHttpService,
			mockLogService as unknown as LoggingService,
            mockBrokerContactService as unknown as BrokerContactHttpService,
		);
	});

	it("should create QuoteComponent", () => {
		expect(component).toBeTruthy();
	});

	it("should have unsaved data", () => {
		// Arrange
		component.vm = getTestQuote();

		// Act
		const hasUnsavedData = component.hasUnsavedData();

		// Assert
		expect(hasUnsavedData).toBeTruthy();
	});

	it("should allow recalculate on pricing step", () => {
		// Arrange
		component.vm = getTestQuote();
		component.currentStep = component.stepPricing;
		const expectedButtonStatus: ButtonStatus = {
			canSaveAfterRecalculate: true,
			allowRecalculate: true,
		};

		// Act
		component.handleStepDataChange(component.stepPricing, null);

		// Assert
		expect(component.buttonStatus).toEqual(expectedButtonStatus);
	});

	it("should not allow enable save when needsPricingRecalculation is true", () => {
		// Arrange
		component.vm = getTestQuote();
		component.vm.pricingInformation = mockPricingInfo;
		component.currentStep = component.stepActivities;

		// Act
		component.handleStepDataChange(component.currentStep, null);

		// Assert
		expect(component.enableSave).toEqual(false);
	});

	it("should change the button status value when canSaveAfterRecalculate equals true or allowRecalculate equals true and not at the pricing step", () => {
		// Arrange
		component.vm = getTestQuote();
		component.currentStep = component.stepBasicInfo;
		component.buttonStatus = {
			canSaveAfterRecalculate: true,
			allowRecalculate: true,
		};
		const expectedButtonStatus: ButtonStatus = {
			canSaveAfterRecalculate: false,
			allowRecalculate: false,
		};

		// Act
		component.handleStepDataChange(component.stepPricing, expectedButtonStatus);

		// Assert
		expect(component.buttonStatus).toEqual(expectedButtonStatus);
	});

	it("should not change the button status value when canSaveAfterRecalculate equals false or allowRecalculate equals false and not at the pricing step", () => {
		// Arrange
		component.vm = getTestQuote();
		component.currentStep = component.stepBasicInfo;
		component.buttonStatus = {
			canSaveAfterRecalculate: false,
			allowRecalculate: false,
		};
		const buttonStatusParameter: ButtonStatus = {
			canSaveAfterRecalculate: true,
			allowRecalculate: true,
		};
		const expectedButtonStatus: ButtonStatus = {
			canSaveAfterRecalculate: false,
			allowRecalculate: false,
		};

		// Act
		component.handleStepDataChange(component.stepPricing, buttonStatusParameter);

		// Assert
		expect(component.buttonStatus).toEqual(expectedButtonStatus);
	});

	it("should re-initialise pricing info when not allowed to recalculate and not pricing step", () => {
		// Arrange
		component.vm = getTestQuote();
		component.vm.pricingInformation = mockPricingInfo;
		component.currentStep = component.stepBasicInfo;
		component.buttonStatus = {
			canSaveAfterRecalculate: true,
			allowRecalculate: true,
		};
		const expectedButtonStatus: ButtonStatus = {
			canSaveAfterRecalculate: false,
			allowRecalculate: false,
		};

		// Act
		component.handleStepDataChange(component.stepPricing, expectedButtonStatus);

		// Assert
		expect(component.vm.pricingInformation).toEqual([]);
	});

	it("should initialise pricing info as an Array when null", () => {
		// Arrange
		component.vm = getTestQuote();
		component.vm.pricingInformation = null;

		// Act
		component.handleStepDataChange(component.stepPricing, null);

		// Assert
		expect(component.vm.pricingInformation).toEqual([]);
	});

	it("should need pricing recalculation and set pricing as valid when pricing info contains value and not pricing step and allowed to recalculate", () => {
		// Arrange
		component.vm = getTestQuote();
		component.vm.pricingInformation = mockPricingInfo;
		component.vm.needsPricingRecalculation = false;
		component.isPricingValid = false;

		// Act
		component.handleStepDataChange(component.stepPricing, null);

		// Assert
		expect(component.vm.needsPricingRecalculation).toBeTruthy();
		expect(component.isPricingValid).toBeTruthy();
	});

	it("should inform that there is no unsaved data when the draft quote is an empty guid", () => {
		// Arrange
		component.vm = getTestQuote();
		component.vm.draftQuoteId = "00000000-0000-0000-0000-000000000000";

		// Act
		const hasUnsavedData = component.hasUnsavedData();

		// Assert
		expect(hasUnsavedData).toBeFalsy();
	});

	it("should inform that there is unsaved data when the draft quote have a valid guid", () => {
		// Arrange
		component.vm = getTestQuote();

		// Act
		const hasUnsavedData = component.hasUnsavedData();

		// Assert
		expect(hasUnsavedData).toBeTruthy();
	});

	it("should inform that there is unsaved data when the draft quote is null", () => {
		// Arrange
		component.vm = getTestQuote();
		component.vm.draftQuoteId = null;

		// Act
		const hasUnsavedData = component.hasUnsavedData();

		// Assert
		expect(hasUnsavedData).toBeTruthy();
	});

	it("should call the warning sanction breach on saving quote when the client has sanctions", () => {
		//Arrange
		const checkClientSanctionsSpy = spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(true));
		spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
		component.vm = getTestQuote();
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();

		// Assert
		expect(checkClientSanctionsSpy).toHaveBeenCalled();
	});

	it("should open the confirmation modal on saving quote when the client has sanctions", () => {
		//Arrange
		const checkClientSanctionsSpy = spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(true));
		spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
		const openDialogSpy = spyOn(mockModalDialogService, "openDialog").and.callThrough();

		component.vm = getTestQuote();
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();

		// Assert
		expect(openDialogSpy).toHaveBeenCalled();
	});

	it("should save the quote when the client has no sanctions", fakeAsync(() => {
		//Arrange
		spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
		const openDialogSpy = spyOn(mockModalDialogService, "openDialog").and.callThrough();

		component.vm = getTestQuote();
		component.vm.pricingInformation = mockPricingInfo;
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
		expect(openDialogSpy).toHaveBeenCalledTimes(0);
		expect(mockQuoteService.insertQuote).toHaveBeenCalled();
	}));

	it("should update quote location premiums when they are present on vm", fakeAsync(() => {
		//Arrange
		spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
		const locationsSpy = spyOn(mockQuoteVMService, "applyModelDiscountToLocationPremiums").and.returnValue(null);
		spyOn(mockQuoteVMService, "hasQuoteLocationPremiums").and.returnValue(true);

		component.vm = getTestQuote();
		component.vm.pricingInformation = mockPricingInfo;
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
		expect(locationsSpy).toHaveBeenCalled()
	}));

	it("should NOT update quote location premiums when they are NOT present on vm", fakeAsync(() => {
		//Arrange
		spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
		const locationsSpy = spyOn(mockQuoteVMService, "applyModelDiscountToLocationPremiums").and.returnValue(null);

		component.vm = getTestQuote();
		component.vm.pricingInformation = mockPricingInfo;
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
		expect(locationsSpy).toHaveBeenCalledTimes(0);
	}));

	// binding

	it("should call the warning sanction breach on binding quote when the client has sanctions", fakeAsync(() => {
		//Arrange
		const checkClientSanctionsSpy = spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(true));
		spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
		component.vm = getTestQuote();
		component.vm.state = QuoteState.Saved;
		// Act
		component.bindQuote();

		// Assert
		expect(checkClientSanctionsSpy).toHaveBeenCalled();
	}));

	it("should bind the quote when the client has no sanctions", fakeAsync(() => {
		//Arrange
		spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
		const openDialogSpy = spyOn(mockModalDialogService, "openDialog").and.callThrough();

		component.vm = getTestQuote();
		component.vm.state = QuoteState.Saved;
		// Act
		component.bindQuote();
		tick(1000);
		// Assert
		expect(openDialogSpy).toHaveBeenCalledTimes(1);
	}));

	it("should return true when selected wording version is an earlier version", () => {
		//Arrange
		component.vm = getTestQuote();
		component.vm.wordingVersionId = 1;
		component.vm.state = QuoteState.Saved;
		// Act
		const wordingVersionIsOld = component.checkMaxWordingVersionIsNotSelected(mockWordingVersions);
		// Assert
		expect(wordingVersionIsOld).toBe(true);
	});

	it("should return false when selected wording version is the latest version", () => {
		//Arrange
		component.vm = getTestQuote();
		component.vm.wordingVersionId = 3;
		component.vm.state = QuoteState.Saved;
		// Act
		const wordingVersionIsOld = component.checkMaxWordingVersionIsNotSelected(mockWordingVersions);
		// Assert
		expect(wordingVersionIsOld).toBe(false);
	});

    it("should NOT call save quote if blast zone check returns false", fakeAsync(() => {
		//Arrange
        spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
        spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
        spyOn(mockCoverageService, "getMultiplePropertiesBusinessLine").and.returnValue('MD');
		spyOn(mockBlastZoneHttpService, "createBlastZoneReservation").and.returnValue(of({ blastZoneCheckResult: false, propertyLimits: [] }));

		component.vm = getTestQuote();
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
        expect(mockCoverageService.getMultiplePropertiesBusinessLine).toHaveBeenCalled();
        expect(mockBlastZoneHttpService.createBlastZoneReservation).toHaveBeenCalled();
		expect(mockQuoteService.insertQuote).not.toHaveBeenCalled();
	}));

    it("should call save quote if blast zone check returns true", fakeAsync(() => {
		//Arrange
        spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
        spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
        spyOn(mockCoverageService, "getMultiplePropertiesBusinessLine").and.returnValue('MD');
		spyOn(mockBlastZoneHttpService, "createBlastZoneReservation").and.returnValue(of({ blastZoneCheckResult: true, propertyLimits: [] }));

		component.vm = getTestQuote();
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
        expect(mockCoverageService.getMultiplePropertiesBusinessLine).toHaveBeenCalled();
        expect(mockBlastZoneHttpService.createBlastZoneReservation).toHaveBeenCalled();
        expect(mockQuoteService.insertQuote).toHaveBeenCalled();
	}));

	it("should pass binder section and quote currency when creating blast zone reservation", fakeAsync(() => {
		// Arrange
		spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
		spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
		spyOn(mockCoverageService, "getMultiplePropertiesBusinessLine").and.returnValue("MD");
		spyOn(mockBinderValidationService, "getTerrorismBinderSectionId").and.returnValue(1289);
		const createSpy = spyOn(mockBlastZoneHttpService, "createBlastZoneReservation").and.returnValue(of({ blastZoneCheckResult: true, propertyLimits: [] }));

		component.vm = getTestQuote();
		component.vm.currency = { isoCode: "USD" } as any;
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
		flush();

		// Assert
		expect(createSpy).toHaveBeenCalled();
		const request = createSpy.calls.mostRecent().args[0];
		expect(request.binderSectionId).toBe(1289);
		expect(request.quoteCurrencyIsoCode).toBe("USD");
	}));

	it("should pass binder section, quote currency and patch reservation id when updating blast zone reservation", fakeAsync(() => {
		// Arrange
		spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
		spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
		spyOn(mockCoverageService, "getMultiplePropertiesBusinessLine").and.returnValue("MD");
		spyOn(mockBinderValidationService, "getTerrorismBinderSectionId").and.returnValue(1289);
		const updatedPropertyLimits: PropertyLimit[] = [
			{
				propertyLimitId: 1,
				propertyDamageLimit: 2000,
				contentsDamageLimit: 1000,
				actualLossSustainedLimit: 1000,
				increasedCostOfWorkingLimit: 1000,
				lossOfRentLimit: 1000,
				alternativeAccommodationLimit: 1000,
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
				totalInsuredValue: 7000,
				blastZoneReservationId: "BZ-REF-1",
			},
		];

		const updateSpy = spyOn(mockBlastZoneHttpService, "updateBlastZoneReservation").and.returnValue(
			of({ blastZoneCheckResult: true, propertyLimits: updatedPropertyLimits })
		);

		component.vm = getTestQuote();
		component.vm.quoteReference = 100;
		component.vm.hasBlastZoneReservation = true;
		component.vm.blastZoneReferenceId = "BZ-REF-1";
		component.vm.currency = { isoCode: "CAD" } as any;
		component.vm.propertyLimits = [
			{
				propertyLimitId: 1,
				propertyDamageLimit: 1000,
				contentsDamageLimit: 1000,
				actualLossSustainedLimit: 1000,
				increasedCostOfWorkingLimit: 1000,
				lossOfRentLimit: 1000,
				alternativeAccommodationLimit: 1000,
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
				totalInsuredValue: 6000,
			},
		];

		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
		flush();

		// Assert
		expect(updateSpy).toHaveBeenCalled();
		const request = updateSpy.calls.mostRecent().args[0];
		expect(request.binderSectionId).toBe(1289);
		expect(request.quoteCurrencyIsoCode).toBe("CAD");
		expect(request.propertyLimits[0].blastZoneReservationId).toBe("BZ-REF-1");
		expect(component.vm.propertyLimits).toEqual(updatedPropertyLimits);
	}));

    it("should NOT call blast zone check if feature flag is false", fakeAsync(() => {
		//Arrange
        spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
        spyOn(mockUserService, "isFeatureAccessible").and.returnValue(false);
        spyOn(mockCoverageService, "getMultiplePropertiesBusinessLine").and.returnValue('MD');
		spyOn(mockBlastZoneHttpService, "createBlastZoneReservation").and.returnValue(of({ blastZoneCheckResult: false, propertyLimits: [] }));

		component.vm = getTestQuote();
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
        expect(mockCoverageService.getMultiplePropertiesBusinessLine).toHaveBeenCalled();
        expect(mockBlastZoneHttpService.createBlastZoneReservation).not.toHaveBeenCalled();
		expect(mockQuoteService.insertQuote).toHaveBeenCalled();
	}));

    it("should NOT call blast zone check if product is not a multiple property", fakeAsync(() => {
		//Arrange
        spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
        spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
        spyOn(mockCoverageService, "getMultiplePropertiesBusinessLine").and.returnValue('');
		spyOn(mockBlastZoneHttpService, "createBlastZoneReservation").and.returnValue(of({ blastZoneCheckResult: true, propertyLimits: [] }));

		component.vm = getTestQuote();
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
        expect(mockCoverageService.getMultiplePropertiesBusinessLine).toHaveBeenCalled();
        expect(mockBlastZoneHttpService.createBlastZoneReservation).not.toHaveBeenCalled();
		expect(mockQuoteService.insertQuote).toHaveBeenCalled();
	}));

    it("should NOT call blast zone check if feature flag is off", fakeAsync(() => {
		//Arrange
        spyOn(mockCheckClientSanctionsService, "checkClientSanctions").and.returnValue(of(false));
        spyOn(mockUserService, "isFeatureAccessible").and.returnValue(false);
        spyOn(mockCoverageService, "getMultiplePropertiesBusinessLine").and.returnValue('');
		spyOn(mockBlastZoneHttpService, "createBlastZoneReservation").and.returnValue(of({ blastZoneCheckResult: true, propertyLimits: [] }));

		component.vm = getTestQuote();
		component.isValid = () => true;
		component.currentStep = component.stepPricing;

		// Act
		component.insert();
        flush();

		// Assert
        expect(mockCoverageService.getMultiplePropertiesBusinessLine).toHaveBeenCalled();
        expect(mockBlastZoneHttpService.createBlastZoneReservation).not.toHaveBeenCalled();
		expect(mockQuoteService.insertQuote).toHaveBeenCalled();
	}));

	describe("allowUpdate", () => {
		it("Should call the enquiryService getEnquiryById if the heroRedirectUsingEnquiryUid feature is toggled off", () => {
			// Arrange
			spyOn(mockEnquiryService, "getEnquiryById").and.callThrough();
			component.vm = getTestQuote();
			component.vm.draftQuoteId = null;

			// Act
			component.allowUpdate();

			// Assert
			expect(mockEnquiryService.getEnquiryById).toHaveBeenCalled();
		});

		it("Should call the enquiryService getEnquiryByUid if the heroRedirectUsingEnquiryUid feature is toggled on", () => {
			// Arrange
			spyOn(mockUserService, "isFeatureAccessible").and.returnValue(true);
			spyOn(mockEnquiryService, "getEnquiryByUid").and.callThrough();
			component.vm = getTestQuote();
			component.vm.draftQuoteId = null;

			// Act
			component.allowUpdate();

			// Assert
			expect(mockEnquiryService.getEnquiryByUid).toHaveBeenCalled();
		});
	});

	describe("sendEmail", () => {
		it("When emailType is send confrimQuoteSent is called for each quote", () => {
			// Arrange
			const quoteIds = [1234, 2345, 3456];
			const email = {
				mergeFields: {
					["QuoteReferences"]: quoteIds.join(";"),
				} as { [key: string]: string },
				emailType: EmailType.sendQuote,
				isSent: true,
			} as Email;
			component.vm = { state: QuoteState.Saved } as Quote;
			component.user = { initials: "XYZ" } as CfcContact;

			// Act
			component.handleSendEmailOnClose(email);

			// Assert
			quoteIds.forEach((quoteId) => expect(mockQuoteService.confirmQuoteSent).toHaveBeenCalledWith(quoteId, component.user.initials));
		});
	});

	class MockMessageService {
		public clearMessage = jasmine.createSpy();
		public clearAllMessages = jasmine.createSpy();
		public sendMessage = jasmine.createSpy();
		public getMessage = () => { };
		private messages = jasmine.createSpy();
		private initMessages = jasmine.createSpy();
	}
	const mockMessageService = new MockMessageService();

	const mockUserService = {
		isFeatureAccessible(): boolean {
			return false;
		},
	};

    const mockCoverageService = {
        getMultiplePropertiesBusinessLine(): string {
            return 'MD';
        }
    };

    const mockBlastZoneHttpService = {
        createBlastZoneReservation(): { blastZoneCheckResult: boolean; propertyLimits: PropertyLimit[] } | any {
            return {
                blastZoneCheckResult: true,
                propertyLimits: [
                    {
                        propertyLimitId: 1,
                        propertyDamageLimit: 1000,
                        contentsDamageLimit: 1000,
                        actualLossSustainedLimit: 1000,
                        increasedCostOfWorkingLimit: 1000,
                        lossOfRentLimit: 1000,
                        alternativeAccommodationLimit: 1000,
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
                        totalInsuredValue: 6000,
                        blastZoneReservationId: "1234",
                    },
                ],
            };
        },
		updateBlastZoneReservation(): { blastZoneCheckResult: boolean; propertyLimits: PropertyLimit[] } | any {
			return {
				blastZoneCheckResult: true,
				propertyLimits: [],
			};
		},
        deleteBlastZoneReservation(): boolean | any {
            return of(true)
        },
    };

	const mockLogService = {
		startCustomEvent: () => {},
		stopCustomEvent: () => {}
	};

    const mockBrokerContactService = {
		getBrokerGroup: () => {},
	};

	const mockToastrService = {
		get showToast$(): Observable<boolean> {
			return of(false);
		},
	};

	const mockEnquiryService = {
		getEnquiryByUid: () => of(new Enquiry()),
		getEnquiryById: () => of(new Enquiry()),
	};

	const mockCheckClientSanctionsService = {
		checkClientSanctions: of(true),
	};

	const mockInsertQuoteResponse = {
		quoteId: 3163478,
		quoteUid: "6f5ec58f-ddfb-4238-91bd-137df7378f9f",
		state: 4,
		error: {
			message: null,
			code: 0,
		},
	};

	const mockPremiumCalculationsService = {
		updatePremium: of(null),
	};

	const mockLanguageService = {
		getLanguageById(id: number): Language {
			return { isoCode: "en", id: id } as Language;
		},
	};

	const mockWordingVersionService = {
		isPublishableWordingVersion: () => of(null),

		getWordingVersions(): Observable<DropDownItem[] | any> {
			return of(mockWordingVersions);
		},

		getExcessWordingVersions(): Observable<DropDownItem[] | any> {
			return of([
				{
					value: "1",
					text: "Excess 1.0",
				},
				{
					value: "2",
					text: "Excess 1.1",
				},
				{
					value: "3",
					text: "Excess 1.2",
				},
			] as DropDownItem[]);
		},
	};

	const mockWordingVersions: DropDownItem[] = [
		{
			value: "1",
			text: "Wording 1.0",
		},
		{
			value: "2",
			text: "Wording 1.1",
		},
		{
			value: "3",
			text: "Wording 1.2",
		},
	] as DropDownItem[];

	const mockNavigationOverrideService = {
		allowNavigation: null,
	};

	const mockBinderValidationService = {
		getBinderValidationWarningMessages(): void {
			return;
		},
		getTerrorismBinderSectionId(): number {
			return null;
		},
	};

	const mockRouter = {
		navigate: () => null,
	};

	const mockQuoteVMService = {
		updateQuote: jasmine.createSpy(),
		hasQuoteLocationPremiums() {
			return false;
		},
		applyModelDiscountToLocationPremiums() {
			return;
		},
        setPropertyValue(propertyName: string, propertyValue: any){ return;}
	};

	const mockPricingService = {
		getBrokerCommissionRate() {return of(null);}
	};

	const mockModalDialogService = {
		openDialog: () => jasmine.createSpy().and.callFake((_: any, __: any, ___: any, afterClosed: (result: string) => void) => afterClosed("confirm-button")),
	};

	const mockEnquiryValidationService = {
		ValidateHeroEnquiry: () => true,
	};

	const mockActivatedRouteMock = {
		paramMap: () => of({ get: (key) => "value" }),
	};

	const mockPricingInfo = [
		{
			businessLine: {
				name: "CP",
				description: "Cyber & Privacy",
			},
			model: 308,
			suggested: 1350,
			minimumPremium: 300,
			quoted: 1350,
			discount: -338.31,
			isExpanded: true,
			defaultFeePercentage: 10,
			fee: 83.68,
			binder: {
				binderId: 254,
				binderDescription: "SME Cyber",
				isEuBinder: false,
			},
			binderSectionId: 828,
			isSelectedLine: true,
			ratingEngineVersionId: 1167,
			suggestedDiscount: 0,
			currentRateChangePremium: 1200,
			expiringRateChangePremium: 1000,
			expiringQuotedPremium: 2000,
			rateChangePercentage: -43.75,
			filedPremium: 1200,
			filedDiscount: Math.round((1 - 1350 / 1200) * 100) / 100,
			suggestedDiscountPercentage: Math.round((1 - 1350 / 1350) * 100) / 100,
		},
		{
			businessLine: {
				name: "CX",
				description: "Cyber Crime",
			},
			model: 205,
			suggested: 1070,
			minimumPremium: 200,
			quoted: 1070,
			discount: -421.95,
			isExpanded: true,
			defaultFeePercentage: 10,
			fee: 66.32,
			binder: {
				binderId: 254,
				binderDescription: "SME Cyber",
				isEuBinder: false,
			},
			binderSectionId: 828,
			isSelectedLine: true,
			ratingEngineVersionId: 1167,
			suggestedDiscount: 0,
			currentRateChangePremium: 1000,
			expiringRateChangePremium: 2500,
			expiringQuotedPremium: 2000,
			rateChangePercentage: 33.75,
			filedPremium: 1070,
			filedDiscount: Math.round((1 - 1070 / 1070) * 100) / 100,
			suggestedDiscountPercentage: Math.round((1 - 1070 / 1070) * 100) / 100,
		},
	];
});
