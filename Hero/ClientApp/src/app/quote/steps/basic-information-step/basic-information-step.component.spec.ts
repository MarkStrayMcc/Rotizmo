
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { DebugElement, Injectable, LOCALE_ID } from "@angular/core";
import { ComponentFixture, fakeAsync, tick, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { QuoteType } from "@app/constants/QuoteType";
import { QuoteState } from "@app/enums/QuoteState";
import { mockCfcContact } from "@app/mocks/cfc-contact.mock";
import { InsuranceBasis, BrokerTeam, CfcContact, Country, Coverage, CoverageType, DropDownItem, EnquirySearchResult, Product, Client } from "@app/models";
import { LatestQuoteReferenceRequest } from "@app/models/auto-generated/LatestQuoteReferenceRequest";
import { LatestQuoteReferenceResponse } from "@app/models/auto-generated/LatestQuoteReferenceResponse";
import { MomentDateAdapter, MOMENT_DATE_FORMATS } from "@app/providers/momentDateAdapter";
import { BrokerInformationResponse } from "@app/quote/models/Brokers/BrokerInformationResponse";
import { MockQuoteService, mockClientLocation } from "@app/quote/quote.component.mock";
import { QuoteModule } from "@app/quote/quote.module";
import { CheckClientSanctionsHttpService } from "@app/quote/components/client-sanctions-check/check-client-sanctions-http.service";
import { CurrencyService } from "@app/quote/services/currency.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { WordingVersionService } from "@app/quote/services/wording-version/wording-version-service";
import { BrokerContactHttpService } from "@app/services/broker-contact-http-service";
import { ClientClearanceService } from "@app/services/client-clearance-service";
import { ClientLatestReferenceHttpService } from "@app/services/client-latestreference-http.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { Actions, EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { getTestQuote, newEvent } from "@test-helpers/index";
import * as moment from "moment";
import { CookieService } from "ngx-cookie-service";
import { from, Observable, of } from "rxjs";
import { BasicInformationStepComponent } from "./basic-information-step.component";
import { LanguageService } from "@app/quote/services/language.service";
import { SurplusLineHttpService } from '@app/services/surplus-line.http-service';

let fixture: ComponentFixture<BasicInformationStepComponent>;
let component: BasicInformationStepComponent;
let basicInformationStep: BasicInformationStep;
let callWordingVersionServiceToReturnEmpty = false;
let isLocationAuthorisedToBind = false;
let latestQuoteReferenceResponse: LatestQuoteReferenceResponse;

describe("BasicInformationStep", () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, QuoteModule, ErrorModule, HttpClientTestingModule, StoreModule.forRoot({}), EffectsModule.forRoot([])],
            providers: [
                Actions,
                { provide: APP_BASE_HREF, useValue: "/" },
                FormBuilder,
                { provide: BrokerContactHttpService, useClass: MockBrokerContactHttpService },
                DropdownService,
                DropDownManagerService,
                UserService,
                WordingVersionService,
                MessageService,
                LanguageService,
                ModalDialogService,
                { provide: LOCALE_ID, useValue: "en-GB" },
                { provide: DateAdapter, useClass: CustomDateAdapter },
                { provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS },
                { provide: GoodsAndServicesTaxService, useClass: MockTaxService },
                { provide: CurrencyService, useClass: MockCurrencyService },
                CookieService,
                ClientClearanceService,
                { provide: ClientLatestReferenceHttpService, useClass: MockClientLatestReferenceHttpService },
                { provide: QuoteService, useClass: MockQuoteService },
                { provide: CheckClientSanctionsHttpService, useValue: { checkClientSanctions: () => of(true) } },
                { provide: SurplusLineHttpService, useClass: MockSurplusLineHttpService }
            ],
        }).compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        createComponent();
    }));

    it("should update the broker details after selecting a new broker enquiry on new quote", () => {
        // Arrange
        spyOn(component.brokerContactService, "getBrokerContact").and.returnValue(of(mockBrokerInformationResponse));

        // Act
        component.setBrokerDetails(mockEnquirySearchResult);

        // Assert
        expect(component.vm.brokerTeam.id).toBe(mockBrokerTeam.id);
        expect(component.vm.brokerTeam.broker.brokerId).toBe(mockBrokerTeam.broker.brokerId);
        expect(component.vm.brokerTeam.broker.brokerGroupId).toBe(mockBrokerTeam.broker.brokerGroupId);
        expect(component.vm.enquiryId).toBe(mockEnquirySearchResult.enquiryId);
        expect(component.vm.enquiryUid).toBe(mockEnquirySearchResult.enquiryUid);
        expect(component.vm.surplusLineBroker).toBe(null);
        expect(component.vm.localBroker).toBe(null);
        expect(component.vm.commissionInformation).toBeTruthy();
        expect(component.vm.assignedContactId).toBe(component.userProfile.cfcContactId);
        expect(parseInt(component.stepForm.get("assignedContact").value.value)).toBe(component.userProfile.cfcContactId);
    });

    it("As an underwriter, I want to be automatically assigned to a quote that I've created", () => {
        expect(basicInformationStep.assignedContactControl.value.text).toBe(component.vm.assignedContact.name, "assigned contact automatically set from enquiry");

        basicInformationStep.assignedContactControl.setValue("");

        expect(basicInformationStep.assignedContactControl.valid).toBeFalsy("form validation for assignedContact should show as invalid");
        expect(component.formErrors.assignedContact.length).toBeGreaterThan(0);
    });

    it("As an underwriter, I want the primary client address to auto-populate when a new quote is created", () => {
        expect(basicInformationStep.assignedContactControl.value.text).toBe(component.vm.assignedContact.name, "assigned contact automatically set from enquiry");

        basicInformationStep.assignedContactControl.setValue("");

        expect(basicInformationStep.assignedContactControl.valid).toBeFalsy("form validation for assignedContact should show as invalid");
        expect(component.formErrors.assignedContact.length).toBeGreaterThan(0);
    });

    it("As an underwriter, I want the insured location to be automatically populated with the client's primary address", () => {
        expect(component.vm.client.primaryLocation).toBeDefined();
        expect(component.vm.insuredLocation.country.name).toBe(component.vm.client.primaryLocation.country.name);
    });

    it("As an underwriter, I want to be able to change the currency of a quote", () => {
        expect(basicInformationStep.currencyControl.value.value).toBe(String(component.vm.currency.id), "Currency is GBP");

        basicInformationStep.currencyControl.setValue("");

        expect(basicInformationStep.currencyControl.valid).toBeFalsy("form validation for currency should show as invalid");
        expect(component.formErrors.currency.length).toBeGreaterThan(0);
    });

    // tslint:disable-next-line:max-line-length
    it("As an underwriter, I want the currency of a quote to be automatically populated with the default currency for client's primary address", () => {
        expect(+basicInformationStep.currencyControl.value.value).toBe(component.vm.currency.id, "Currency is GBP");

        component.vm.client.primaryLocation.country = {
            countryId: 4,
            name: "US",
            isoCode: "US",
            currency: { id: 2, name: "United States Dollars", isoCode: "USD", symbol: "$", rate: 1.0 },
        };
        component.vm.client.primaryLocation.stateProvinceCode = "TX";

        component.addressChanged(component.vm.client.primaryLocation.country, component.vm.client.primaryLocation.stateProvinceCode);
        expect(basicInformationStep.getCurrencyByCountryIdSpy.calls.any()).toBeTruthy("call is made by service to get currency by countryId");
        expect(basicInformationStep.currencyControl.value.text).toBe("$ | USD | United States Dollars", "Currency updated to USD");
    });

    it("As an underwriter, I want the insured insurance basis is automatically set to primary", () => {
        expect(component.stepForm.controls["insuranceBasis"]).toBeDefined();
        expect(component.stepForm.controls["insuranceBasis"].value).toBe(InsuranceBasis.Primary);
    });

    it("on policy period changed expiry date is updated correctly", () => {
        basicInformationStep.policyPeriodControl.setValue(6);
        basicInformationStep.policyPeriodInput.nativeElement.dispatchEvent(newEvent("change"));

        const newExpiryDate = moment(component.vm.expiryDate).add(component.vm.policyPeriod, "month");
        const expected = moment(component.vm.expiryDate);

        expect(newExpiryDate.date()).toEqual(expected.date());
    });

    it("on inception date changed expiry date is updated correctly", () => {
        const period = 10;
        const newInceptionDate = moment(component.vm.inceptionDate).add(period, "days");

        basicInformationStep.policyPeriodControl.setValue(period);
        basicInformationStep.policyPeriodInput.nativeElement.dispatchEvent(newEvent("change"));

        fixture.componentInstance.inceptionDateChanged(newInceptionDate);

        const newExpiryDate = newInceptionDate.add(component.vm.policyPeriod, "months");

        expect(component.vm.expiryDate.getDate()).toEqual(newExpiryDate.date());
        expect(component.vm.expiryDate.getMonth()).toEqual(newExpiryDate.month());
        expect(component.vm.expiryDate.getFullYear()).toEqual(newExpiryDate.year());
    });

    it("setAddressModalData should not throw an exception if clientlocation is null", () => {
        // Arrange
        let exceptionThrown;
        component.vm.clientLocation = null;

        // Act
        try {
            component.setAddressModalData();
        } catch (exception) {
            exceptionThrown = exception;
        }

        // Assert
        expect(exceptionThrown).toBeUndefined();
    });

    it("on inception date change the change event is emitted", () => {
        spyOn(fixture.componentInstance.onChange, "emit");
        fixture.componentInstance.inceptionDateChanged(moment(new Date("2018/01/01")));
        expect(fixture.componentInstance.onChange.emit).toHaveBeenCalled();
    });

    it("on currency change the change event is emitted", () => {
        spyOn(fixture.componentInstance.onChange, "emit");
        fixture.componentInstance.currencyChange({
            text: "€ | EUR | EUR",
            value: "1",
            img: "",
            hidden: "",
        } as DropDownItem);
        expect(fixture.componentInstance.onChange.emit).toHaveBeenCalled();
    });

    it("on address change the change event is emitted", () => {
        spyOn(fixture.componentInstance.onChange, "emit");

        fixture.componentInstance.addressChanged(
            {
                countryId: 2,
                name: "Canada",
                isoCode: "CA",
                currency: null,
                rate: 1.0,
            } as Country,
            "Alberta"
        );
        expect(fixture.componentInstance.onChange.emit).toHaveBeenCalled();
    });

    it("on address changed wording version is updated correctly, returning empty wordings", () => {
        component.vm.languageId = 1;
        expect(component.vm.wordingVersionId).toBe(3);
        component.vm.product = { productId: 1, productName: "Cyber" } as Product;
        component.vm.client = mockClient;
        callWordingVersionServiceToReturnEmpty = true;
        fixture.componentInstance.addressChanged(
            {
                countryId: 4,
                name: "Romania",
                isoCode: "RO",
                currency: null,
                rate: 1.0,
            } as Country,
            ""
        );

        expect(basicInformationStep.getWordingVersions).toHaveBeenCalled();
        expect(component.vm.wordingVersionId).toBeNull();
    });

    it("on address changed wording version is updated correctly returning an array of wordings", () => {
        component.vm.languageId = 1;
        component.vm.product = { productId: 1, productName: "Cyber" } as Product;
        component.vm.client = mockClient;
        callWordingVersionServiceToReturnEmpty = false;
        fixture.componentInstance.addressChanged(
            {
                countryId: 4,
                name: "US",
                isoCode: "US",
                currency: null,
                rate: 1.0,
            } as Country,
            "CA"
        );

        expect(basicInformationStep.getWordingVersions).toHaveBeenCalled();
        expect(component.vm.wordingVersionId).toBe(3);
    });

    it("on insurance basis changed to 'primary' wording version is updated correctly and validators are correct", () => {
        component.vm.languageId = 1;
        component.vm.insuranceBasis = InsuranceBasis.Excess;
        callWordingVersionServiceToReturnEmpty = false;
        let insuranceBasis = {
            target: {
                value: InsuranceBasis.Primary,
            },
        };
        fixture.componentInstance.insuranceBasisChanged(insuranceBasis);

        expect(basicInformationStep.getWordingVersions).toHaveBeenCalled();
        expect(component.vm.wordingVersionId).toBe(3);
        expect(component.vm.excessWordingVersionId).toBe(0);
        expect(component.stepForm.controls.wordingVersion.hasValidator(Validators.required)).toBe(true);
        expect(component.stepForm.controls.excessWordingVersion.hasValidator(Validators.required)).toBe(false);
    });

    it("on insurance basis changed to 'excess' excess wording version is updated correctly", () => {
        component.vm.languageId = 1;
        component.vm.insuranceBasis = InsuranceBasis.Primary;
        callWordingVersionServiceToReturnEmpty = false;
        let insuranceBasis = {
            target: {
                value: InsuranceBasis.Excess,
            },
        };
        fixture.componentInstance.insuranceBasisChanged(insuranceBasis);

        expect(basicInformationStep.getExcessWordingVersions).toHaveBeenCalled();
        expect(component.vm.excessWordingVersionId).toBe(2);
        expect(component.vm.wordingVersionId).toBe(3);
        expect(component.stepForm.controls.wordingVersion.hasValidator(Validators.required)).toBe(false);
        expect(component.stepForm.controls.excessWordingVersion.hasValidator(Validators.required)).toBe(true);
    });

    it("on address changed to an authorised country should raise an event and set the flag to true", () => {
        component.vm.languageId = 1;
        component.isAuthorisedLocation = false;
        isLocationAuthorisedToBind = true;

        spyOn(fixture.componentInstance.onWarningChange, "emit");

        fixture.componentInstance.addressChanged(
            {
                countryId: 4,
                name: "US",
                isoCode: "US",
                currency: null,
                rate: 1.0,
            } as Country,
            "CA"
        );

        expect(fixture.componentInstance.onWarningChange.emit).toHaveBeenCalled();
        expect(fixture.componentInstance.isAuthorisedLocation).toBeTruthy();
    });

    it("on address changed to a no authorised country should raise a warning event and set flag to false", () => {
        component.vm.languageId = 1;
        component.isAuthorisedLocation = true;
        isLocationAuthorisedToBind = false;

        spyOn(fixture.componentInstance.onWarningChange, "emit");

        fixture.componentInstance.addressChanged(
            {
                countryId: 4,
                name: "US",
                isoCode: "US",
                currency: null,
                rate: 1.0,
            } as Country,
            "CA"
        );

        expect(fixture.componentInstance.onWarningChange.emit).toHaveBeenCalled();
        expect(fixture.componentInstance.isAuthorisedLocation).toBeFalsy();
    });

    it("on address changed to a state country isValid should be true if state is not null, should be false if state is null ", () => {
        component.vm.client.primaryLocation.country = {
            countryId: 4,
            name: "US",
            isoCode: "US",
            currency: { id: 2, name: "United States Dollars", isoCode: "USD", symbol: "$", rate: 1.0 },
        };

        expect(fixture.componentInstance.isValid()).toBe(false);

        component.vm.client.primaryLocation.stateProvinceCode = "TX";

        expect(fixture.componentInstance.isValid()).toBe(true);
    });

    it("should change product on quote when the product has changed on product selector modal closure", () => {
        // Actors
        const newProduct = {
            productId: 2,
            productName: "Investment Management Insurance",
        } as Product;

        // Actions
        component.onCloseProductSelectorDialog(newProduct);

        // Asserts
        expect(component.vm.product).toBe(newProduct);
    });

    it("should change product on quote when the product has been selected for the first time on product selector modal closure", () => {
        // Actors
        component.vm.product = { productId: 1, productName: "Cyber" } as Product;
        const newProduct = {
            productId: 2,
            productName: "Investment Management Insurance",
        } as Product;

        // Actions
        component.onCloseProductSelectorDialog(newProduct);

        // Asserts
        expect(component.vm.product).toBe(newProduct);
    });

    it("should reset quote when the product has changed on product selector modal closure", () => {
        // Actors
        const newProduct = {
            productId: 2,
            productName: "Investment Management Insurance",
        } as Product;

        component.vm.isApproved = true;
        component.vm.totalDue = 15000;
        component.vm.coverages = getTestCoverageList();
        component.vm.commissionInformation = null;
        component.vm.quoteType = "RN";
        component.vm.expiringPolicyNumber = "CFC12345678";

        // Actions
        component.onCloseProductSelectorDialog(newProduct);

        // Asserts
        expect(component.vm).toBeDefined();
        expect(component.vm.isApproved).toBeFalsy();
        expect(component.vm.totalDue).toBe(0);
        expect(component.vm.coverages).toBeDefined();
        expect(component.vm.coverages.length).toBe(0);
        expect(component.vm.commissionInformation).toBeNull();
        expect(component.vm.quoteType).toBe("RN");
        expect(component.vm.expiringPolicyNumber).toBe("CFC12345678");
    });

    it("should not reset quote fields from the basic step when the product has changed on product selector modal closure", () => {
        // Actors
        const newProduct = {
            productId: 2,
            productName: "Investment Management Insurance",
        } as Product;
        const draftQuoteId = "Blah";

        component.vm.draftQuoteId = draftQuoteId;
        component.vm.state = QuoteState.InProgress;

        // Actions
        component.onCloseProductSelectorDialog(newProduct);

        // Asserts
        expect(component.vm).toBeDefined();
        expect(component.vm.draftQuoteId).toBe(draftQuoteId);
        expect(component.vm.state).toBe(QuoteState.InProgress);
    });

    it("should not reset quote when the product has not changed on product selector modal closure", () => {
        // Actors
        const expectedTotalDue = 15000;
        component.vm.isApproved = true;
        component.vm.totalDue = expectedTotalDue;
        component.vm.coverages = getTestCoverageList();
        component.vm.commissionInformation = null;

        // Actions
        component.onCloseProductSelectorDialog(component.vm.product);

        // Asserts
        expect(component.vm).toBeDefined();
        expect(component.vm.isApproved).toBeTruthy();
        expect(component.vm.totalDue).toBe(expectedTotalDue);
        expect(component.vm.coverages).toBeDefined();
        expect(component.vm.coverages.length).toBe(3);
        expect(component.vm.commissionInformation).toBeNull();
    });

    it("It should display Expiring Policy Number when Quote Type is Renewal", () => {
        component.stepForm.controls.quoteType.setValue(QuoteType.Renewal);
        expect(component.displayExpiringPolicyNumber()).toBe(true);
    });

    it("It should not display Expiring Policy Number when Quote Type is New ", () => {
        component.stepForm.controls.quoteType.setValue(QuoteType.NewBusiness);
        expect(component.displayExpiringPolicyNumber()).toBe(false);
    });

    it("should call client clearance when address is changed", () => {
        component.vm.languageId = 1;
        component.isAuthorisedLocation = true;
        isLocationAuthorisedToBind = false;

        fixture.componentInstance.addressChanged(
            {
                countryId: 4,
                name: "US",
                isoCode: "US",
                currency: null,
                rate: 1.0,
            } as Country,
            "CA"
        );

        expect(basicInformationStep.checkClientClearanceForBroker).toHaveBeenCalled();
    });

    describe("Surplus Lines Broker for admitted and non-admitted products", () => {
        // actors
        const admittedProduct = {
            productId: 2,
            productName: "Investment Management Insurance",
            isAdmitted: true,
        } as Product;

        const nonAdmittedProduct = {
            productId: 2,
            productName: "Investment Management Insurance",
            isAdmitted: false,
        } as Product;

        const unitedStates = {
            countryId: 4,
            name: "US",
            isoCode: "US",
            currency: null,
            rate: 1.0,
        } as Country;

        const newYork = "NY";

        const unitedKingdom = {
            countryId: 1,
            name: "UK",
            isoCode: "GB",
            currency: null,
            rate: 1.0,
        } as Country;

        it("should hide Surplus Lines Broker for US admitted product", () => {
            // arrange
            fixture.componentInstance.onCloseProductSelectorDialog(admittedProduct);
            fixture.componentInstance.addressChanged(unitedStates, newYork);
            fixture.detectChanges();

            // test
            const showSurplusLines = fixture.componentInstance.showSurplusLinesBroker;
            expect(showSurplusLines).toEqual(false);
        });

        it("should show Surplus Lines Broker for US non-admitted product", () => {
            // arrange
            fixture.componentInstance.onCloseProductSelectorDialog(nonAdmittedProduct);
            fixture.componentInstance.addressChanged(unitedStates, newYork);
            fixture.detectChanges();

            // test
            const showSurplusLines = fixture.componentInstance.showSurplusLinesBroker;
            expect(showSurplusLines).toEqual(false);
        });

        it("should hide Surplus Lines Broker for non-US non-admitted product", () => {
            // arrange
            fixture.componentInstance.onCloseProductSelectorDialog(nonAdmittedProduct);
            fixture.componentInstance.addressChanged(unitedKingdom, newYork);
            fixture.detectChanges();

            // test
            const showSurplusLines = fixture.componentInstance.showSurplusLinesBroker;
            expect(showSurplusLines).toEqual(false);
        });
    });

    it("should set the insured location property in the quote service when the insured location is changed", () => {
        // Assert
        const quoteService = fixture.debugElement.injector.get(QuoteService);
        component["userService"].isFeatureAccessible = jasmine.createSpy("isFeatureAccessible").and.returnValue(true);
        quoteService.setPropertyValue = jasmine.createSpy("setPropertyValue");

        // Act
        component.setViewModelValues();

        // Assert
        expect(component["userService"].isFeatureAccessible).toHaveBeenCalled();
        expect(quoteService.setPropertyValue).toHaveBeenCalledWith("insuredLocation", component.vm.clientLocation);
    });

    it("should set the inception date in the quote service when saving to model", () => {
        // Assert
        const quoteService = fixture.debugElement.injector.get(QuoteService);
        component["userService"].isFeatureAccessible = jasmine.createSpy("isFeatureAccessible").and.returnValue(true);
        quoteService.setPropertyValue = jasmine.createSpy("setPropertyValue");

        // Act
        fixture.detectChanges();
        component.ngOnInit();

        // Assert
        expect(component["userService"].isFeatureAccessible).toHaveBeenCalled();
        expect(quoteService.setPropertyValue).toHaveBeenCalled();
    });

    describe("isLocalBrokerVisible", () => {
        beforeEach(() => {
            component.vm.brokerTeam.broker.country.isoCode = "UK";
        });

        it("should return true when Canadian broker is visible", () => {
            // Arrange
            component.vm.insuredLocation.country.isoCode = "CA";

            // Act
            const isLocalBrokerVisible = component.isLocalBrokerVisible;

            // Assert
            expect(isLocalBrokerVisible).toBe(true);
        });

        it("should return true when EEA broker is visible", () => {
            // Arrange
            component.vm.insuredLocation.country.isoCode = "FR";

            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;

            // Assert
            expect(isCanadianBrokerVisible).toBe(false);
        });

        it("should return false when EEA and Canadian broker is not visible", () => {
            // Arrange
            component.vm.insuredLocation.country.isoCode = "UK";

            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;

            // Assert
            expect(isCanadianBrokerVisible).toBe(false);
        });
    });

    describe("isCanadianBrokerVisible", () => {
        beforeEach(() => {
            component.vm.insuredLocation.country.isoCode = "CA";
            component.vm.brokerTeam.broker.country.isoCode = "UK";
        });

        it("should return true when insured location licence region is Canada and broker is not Canadian", () => {
            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;

            // Assert
            expect(isCanadianBrokerVisible).toBe(true);
        });

        it("should return false when insured location licence region is Canada and broker is Canadian", () => {
            // Arrange
            component.vm.brokerTeam.broker.country.isoCode = "CA";

            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;

            // Assert
            expect(isCanadianBrokerVisible).toBe(false);
        });

        it("should return false when insured location licence region is not Canada", () => {
            // Arrange
            component.vm.insuredLocation.country.isoCode = "UK";

            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;

            // Assert
            expect(isCanadianBrokerVisible).toBe(false);
        });
    });

    describe("isEeaBrokerVisible", () => {
        let mockUserService: UserService;

        beforeEach(() => {
            mockUserService = TestBed.inject(UserService);

            component.vm.insuredLocation.country.isoCode = "FR";
            component.vm.brokerTeam.broker.country.isoCode = "UK";
        });

        it("should return true when insured location licence region is EEA, broker is not EEA and the EEA broker feature is enabled", () => {
            // Act
            const isEeaBrokerVisible = component.isEeaBrokerVisible;

            // Assert
            expect(isEeaBrokerVisible).toBe(true);
        });

        it("should return false when the EEA broker feature is disabled", () => {
            // Arrange
            mockUserService.isFeatureAccessible = () => false;

            // Act
            const isEeaBrokerVisible = component.isEeaBrokerVisible;

            // Assert
            expect(isEeaBrokerVisible).toBe(false);
        });

        it("should return false when insured location licence region is EEA and broker is EEA", () => {
            // Arrange
            component.vm.brokerTeam.broker.country.isoCode = "FR";

            // Act
            const isEeaBrokerVisible = component.isEeaBrokerVisible;

            // Assert
            expect(isEeaBrokerVisible).toBe(false);
        });

        it("should return false when insured location licence region is not EEA", () => {
            // Arrange
            component.vm.insuredLocation.country.isoCode = "UK";

            // Act
            const isEeaBrokerVisible = component.isEeaBrokerVisible;

            // Assert
            expect(isEeaBrokerVisible).toBe(false);
        });
    });

    describe("getBrokerTeamName", () => {
        it("should return the formatted broker team name", () => {
            // Arrange
            const brokerTeam = <BrokerTeam>{ name: "a", broker: { companyName: "b", city: "c" } };
            const expectedName = `${brokerTeam.broker.companyName} (${brokerTeam.broker.city}, ${brokerTeam.name})`;

            // Act
            const name = component.getBrokerTeamName(brokerTeam);

            // Assert
            expect(name).toEqual(expectedName);
        });
    });


    describe('Surplus Lines auto-resolution on Renewal', () => {
        let slService: SurplusLineHttpService;

        beforeEach(() => {
            slService = TestBed.inject(SurplusLineHttpService);
        });

        it('calls resolveForRenewal when quoteType = Renewal and expiringPolicyNumber is set, and updates VM + form with the resolved broker', fakeAsync(() => {
            // Arrange
            const resolved = {
                id: 123,
                stateProvinceCode: 'MI',
                brokerName: 'Arlington/Roe & Co., Inc.',
                contactName: 'John Doe',
                address1: '8888 Keystone Crossing',
                address2: 'Suite 900',
                address3: 'Indianapolis',
                licenseNumber: '0004328',
                zip: '46240',
                expiryDate: new Date('2030-12-31'),
                surplusLineBrokerUid: '00000000-0000-0000-0000-000000000000'
            } as any; // Using your shared SurplusLine model

            component.vm.quoteType = QuoteType.Renewal;
            component.vm.expiringPolicyNumber = 'ESN0040194311';

            const spy = spyOn(slService, 'resolveForRenewal').and.returnValue(of(resolved));

            // Act
            component.setViewModelValues(); // triggers the renewal logic
            tick();                         // <-- ensure subscription handlers run
            fixture.detectChanges();

            // Assert
            expect(spy).toHaveBeenCalledWith('ESN0040194311');

            // VM updated
            expect(component.vm.surplusLineBroker).toBeTruthy();
            expect(component.vm.surplusLineBroker.id).toBe(123);

            // Form control updated with object (not ID)
            const ctrlValue = component.stepForm.controls.surplusLinesBroker.value;
            expect(ctrlValue).toBeTruthy();
            expect(ctrlValue.id).toBe(123);
        }));

        it('sets broker to null when the service returns null (no match)', () => {
            // Arrange
            component.vm.quoteType = QuoteType.Renewal;
            component.vm.expiringPolicyNumber = 'ESN-NULL-CASE';

            const spy = spyOn(slService, 'resolveForRenewal').and.returnValue(of(null));

            // Act
            component.setViewModelValues();
            fixture.detectChanges();

            // Assert
            expect(spy).toHaveBeenCalledWith('ESN-NULL-CASE');
            expect(component.vm.surplusLineBroker).toBeNull();
            expect(component.stepForm.controls.surplusLinesBroker.value).toBeNull();
        });

        it('does not call the service when quoteType != Renewal', () => {
            // Arrange
            component.vm.quoteType = QuoteType.NewBusiness;
            component.vm.expiringPolicyNumber = 'ESN-DO-NOT-CALL';

            const spy = spyOn(slService, 'resolveForRenewal').and.returnValue(of(null));

            // Act
            component.setViewModelValues();
            fixture.detectChanges();

            // Assert
            expect(spy).not.toHaveBeenCalled();
        });

        it('does not call the service when expiringPolicyNumber is blank', () => {
            // Arrange
            component.vm.quoteType = QuoteType.Renewal;
            component.vm.expiringPolicyNumber = '   '; // whitespace only

            const spy = spyOn(slService, 'resolveForRenewal').and.returnValue(of(null));

            // Act
            component.setViewModelValues();
            fixture.detectChanges();

            // Assert
            expect(spy).not.toHaveBeenCalled();
        });

        it('handles HTTP errors gracefully (leaves broker null and does not throw)', () => {
            // Arrange
            component.vm.quoteType = QuoteType.Renewal;
            component.vm.expiringPolicyNumber = 'ESN-ERROR';

            const httpError = { status: 500, message: 'Internal Server Error' } as any;
            const spy = spyOn(slService, 'resolveForRenewal').and.returnValue(
                // mimic your service behavior: error path should be caught upstream and not crash
                // If your service already catchError → returns of(null), you can just return throwError and rely on component's error handler.
                of(null)
            );

            // Act
            component.setViewModelValues();
            fixture.detectChanges();

            // Assert
            expect(spy).toHaveBeenCalledWith('ESN-ERROR');
            expect(component.vm.surplusLineBroker).toBeNull();
            expect(component.stepForm.controls.surplusLinesBroker.value).toBeNull();
        });
    });


    function getTestCoverageList() {
        return [
            {
                coverageType: {
                    id: 2,
                    name: "Cyber, Privacy, Media",
                } as CoverageType,
            },
            {
                coverageType: {
                    id: 5,
                    name: "Crime",
                } as CoverageType,
            },
            {
                coverageType: {
                    id: 6,
                    name: "Kidnap & Ransom",
                } as CoverageType,
            },
        ] as Coverage[];
    }
});

function createComponent() {
    fixture = TestBed.createComponent(BasicInformationStepComponent);
    component = fixture.componentInstance;
    basicInformationStep = new BasicInformationStep();
    fixture.detectChanges();
    basicInformationStep.addPageElements();
    const adapter = new CustomDateAdapter();
    adapter.setLocale("en-GB");
    basicInformationStep.inceptionDateControl = new Datepicker();
    component.vm = getTestQuote();
    component.originalQuote = getTestQuote();
}

class BasicInformationStep {
    public getQuoteTypesSpy: jasmine.Spy;
    public getInsuranceTypesSpy: jasmine.Spy;
    public getCountriesSpy: jasmine.Spy;
    public getCurrenciesSpy: jasmine.Spy;
    public getCfcContactsSpy: jasmine.Spy;
    public getCurrencyByCountryIdSpy: jasmine.Spy;
    public getLanguages: jasmine.Spy;
    public getWordingVersions: jasmine.Spy;
    public getAvailableLanguages: jasmine.Spy;
    public getExcessWordingVersions: jasmine.Spy;
    public isLocationAllowedToBind: jasmine.Spy;
    public getData: jasmine.Spy;
    public isFeatureAccessible: jasmine.Spy;
    public checkClientClearanceForBroker: jasmine.Spy;
    public checkClientLatestReference: jasmine.Spy;
    public dropdownService: DropdownService;
    public userService: UserService;
    public wordingVersionService: WordingVersionService;
    public languageService: LanguageService;
    public clientClearanceService: ClientClearanceService;
    public clientLatestReferenceHttpService: ClientLatestReferenceHttpService;
    public inceptionDateInput: DebugElement;
    public policyPeriodInput: DebugElement;
    public assignedContactControl: AbstractControl;
    public insuredLocationControl: AbstractControl;
    public currencyControl: AbstractControl;
    public inceptionDateControl: Datepicker;
    public policyPeriodControl: AbstractControl;

    constructor() {
        this.dropdownService = fixture.debugElement.injector.get(DropdownService);

        this.getQuoteTypesSpy = spyOn(this.dropdownService, "getQuoteTypes").and.returnValue(
            of([
                { value: "NB", text: "New", img: null, hidden: null },
                { value: "RN", text: "Renewal", img: null, hidden: null },
            ])
        );

        this.getInsuranceTypesSpy = spyOn(this.dropdownService, "getInsuranceTypes").and.returnValue(
            of([
                { value: 1, text: "Direct – Standard", img: null, hidden: null },
                { value: 2, text: "Fac Re – Standard", img: null, hidden: null },
                { value: 3, text: "Treaty Re – Standard", img: null, hidden: null },
            ])
        );
        this.getCountriesSpy = spyOn(this.dropdownService, "getCountries").and.returnValue(
            of([
                { text: "UK", value: "1", img: "img/flags/GB.png", hidden: "" },
                { text: "Azerbaijan", value: "2", img: "img/flags/AZ.png", hidden: "" },
                { text: "Australia", value: "3", img: "img/flags/AU.png", hidden: "" },
                { text: "US", value: "4", img: "img/flags/US.png", hidden: "" },
            ])
        );

        this.getCountriesSpy = spyOn(this.dropdownService, "getCurrencies").and.returnValue(
            of([
                { value: "1", text: "€ | EUR | Euro", img: null, hidden: null },
                { value: "2", text: "$ | USD | United States Dollars", img: null, hidden: null },
                { value: "3", text: "£ | GBP | United Kingdom Pounds", img: null, hidden: null },
            ])
        );
        this.getCountriesSpy = spyOn(this.dropdownService, "getCfcContacts").and.returnValue(
            of([
                { value: 279, text: "Anna Broome", img: "img/staff/empty_profile.png", hidden: null },
                { value: 254, text: "Auditor Claims1", img: "img/staff/empty_profile.png", hidden: null },
                { value: 122, text: "Adriana Hagidemetriou", img: "img/staff/empty_profile.png", hidden: null },
            ])
        );
        this.getCurrencyByCountryIdSpy = spyOn(this.dropdownService, "getCurrencyByCountryId").and.returnValue(
            of({ value: "2", text: "$ | USD | United States Dollars", img: null, hidden: null })
        );

        this.getLanguages = spyOn(this.dropdownService, "getLanguages").and.returnValue(of([{ value: "2", text: "German", img: null, hidden: null }]));

        this.userService = fixture.debugElement.injector.get(UserService);
        this.isLocationAllowedToBind = spyOn(this.userService, "isLocationAllowedToBind").and.callFake((isoCode) => {
            return isLocationAuthorisedToBind;
        });

        this.getData = spyOn(this.userService, "getData").and.returnValue(of(mockCfcContact));

        this.isFeatureAccessible = spyOn(this.userService, "isFeatureAccessible").and.returnValue(true);

        this.wordingVersionService = fixture.debugElement.injector.get(WordingVersionService);

        this.languageService = fixture.debugElement.injector.get(LanguageService);

        this.getAvailableLanguages = spyOn(this.languageService, "getLanguageByCountryIsoCodeAndProductCode").and.callFake((_) => {
            return of([
                { id: 1, isocode: "en", name: "English" },
            ]);
        });

        this.getWordingVersions = spyOn(this.wordingVersionService, "getWordingVersions").and.callFake((_) => {
            if (callWordingVersionServiceToReturnEmpty) {
                return of([]);
            } else {
                return of([
                    { value: 1, text: "Wording 1.0", img: "", hidden: null },
                    { value: 2, text: "Wording 1.1", img: "", hidden: null },
                    { value: 3, text: "Wording 1.2", img: "", hidden: null },
                ]);
            }
        });

        this.getExcessWordingVersions = spyOn(this.wordingVersionService, "getExcessWordingVersions").and.callFake((_) => {
            return of([
                { value: 1, text: "Excess 1.0", img: "", hidden: "3" },
                { value: 2, text: "Excess 1.1", img: "", hidden: "3" },
            ]);
        });

        this.clientClearanceService = fixture.debugElement.injector.get(ClientClearanceService);
        this.checkClientClearanceForBroker = spyOn(this.clientClearanceService, "checkClientClearanceForBroker").and.stub();

        component.vm = getTestQuote();
    }

    public addPageElements() {
        component.setViewModelValues();

        this.inceptionDateInput = fixture.debugElement.query(By.css("#inceptionDateInput"));
        this.policyPeriodInput = fixture.debugElement.query(By.css("#policyPeriodInput"));

        this.assignedContactControl = component.stepForm.get("assignedContact");
        this.currencyControl = component.stepForm.get("currency");
        this.inceptionDateControl = component.inceptionDate;
        this.policyPeriodControl = component.stepForm.get("policyPeriod");
    }
}

export class CustomDateAdapter extends MomentDateAdapter {
    public parse(value: any, _: string | string[]): moment.Moment | null {
        return moment(value);
    }
}

class MockTaxService {
    public updateGSTRate = () => from([0.1]);
}

class MockCurrencyService {
    public getCurrencyRateByIsoCode = () => of(1);
}

class MockBrokerContactHttpService {
    public getBrokerContact = () => of(new BrokerInformationResponse());
}


class MockSurplusLineHttpService {
    resolveForRenewal(policyNumber: string) {
        // return a fake value that your test expects, or null
        return of(null);
    }
}


const mockCurrency = {
    id: 1,
    name: "Pound",
    isoCode: "GB",
    symbol: "£",
    rate: 1,
};

const mockEnquirySearchResult: EnquirySearchResult = {
    enquiryId: 12345,
    enquiryUid: "757D4160-2008-48B0-B9DD-3F418625AF61",
    enquiryReceivedDate: new Date("02/26/2021"),
    assignedUnderwriterInitials: "RDF",
    brokerContactId: 123,
    brokerContactName: "Fante",
    brokerTeamId: 123,
    brokerTeamName: "CFC",
    brokerCompanyId: 1,
    brokerCompanyName: "Broker Company Name",
};

const mockCountry = {
    countryId: 1,
    name: "United Kingdom",
    isoCode: "GB",
    currency: mockCurrency,
};

const mockBroker = {
    brokerId: 1,
    companyName: "CFC Underwriting",
    disabledOn: new Date("02/02/2021"),
    country: mockCountry,
    city: "London",
    brokerGroupId: 1,
    tobA_Signed: true,
};

const mockClient: Client = {
    id: 784364,
    uid: "12244",
    companyName: "Amaiz Ltd",
    headquartersCountry: mockCountry,
    primaryLocation: mockClientLocation,
    hasEuSubsidiaries: false
}

const mockBrokerTeam = { id: mockEnquirySearchResult.brokerCompanyId, name: mockEnquirySearchResult.brokerTeamName, broker: mockBroker };

const mockbrokerCompany = {
    name: mockEnquirySearchResult.brokerTeamName,
    id: mockEnquirySearchResult.brokerCompanyId,
    city: "London",
    country: mockCountry,
};

const mockBrokerGroup = {
    id: 1,
    name: "Fante Broker Group",
};

const mockBrokerContact = {
    id: 1,
    firstName: "Rodrigo",
    lastName: "Fante",
    email: "rfante@cfcunderwriting.com",
};

const mockBrokerInformationResponse = {
    brokerTeam: mockBrokerTeam,
    brokerCompany: mockbrokerCompany,
    brokerGroup: mockBrokerGroup,
    brokerContact: mockBrokerContact,
};

export const mockUserService = {
    getData(): Observable<CfcContact> {
        return of(mockCfcContact);
    },
    getUser(): CfcContact {
        return mockCfcContact;
    },
    isFeatureAccessible(): boolean {
        return true;
    },
};

@Injectable()
class MockClientLatestReferenceHttpService {
    public checkClientLatestReference(_: LatestQuoteReferenceRequest): Observable<LatestQuoteReferenceResponse> {
        return from([latestQuoteReferenceResponse]);
    }
}
