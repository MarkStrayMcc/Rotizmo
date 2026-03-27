/* tslint:disable:max-classes-per-file */
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import {
    Message,
    MessageType,
    Quote
} from "@app/models";
import { ModelMappingsHelper } from "@app/models/Mappings/ModelMappingsHelper";
import { CommissionPricing } from "@app/quote/components/pricing/commission-pricing/commission-pricing.component";
import { CommissionInformation } from "@app/quote/models/pricing/CommissionInformation";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { FeeHttpService } from "@app/services/fee-http.service";
import { MessageService } from "@app/services/message.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PricingHttpService } from "@app/services/pricing-http-service";
import { PricingService } from "@app/quote/services/pricing-service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { MockMatSpinner } from "@app/test/matProgressSpinner.mock";
import { MaximumFeeAsyncValidator } from "@app/validators/maximum-fee-async.validator";
import { of } from "rxjs";
import { getTestQuote } from "../../../../test-helpers/index";
import { QuoteService } from "../../services/quote.service";
import * as baseStepMocks from "../base-step.component.mock";
import { PricingStepComponent } from "./pricing-step.component";
import { MockBusinessCategoryPricingComponent, MockCoverageHttpService, MockCurrencyComponent, MockFeaturesHttpService, MockFeeHttpService, MockLargeNumberMask, MockNumberOnly, MockPercentageInputComponent, MockPremiumCalculationsService, MockPricingHttpService, MockPricingService, mockUserService } from "./pricing-step.component.mock";
import { FeaturesHttpService } from "@app/services/features-http.service";

describe("PricingStepComponent", () => {
    let component: PricingStepComponent;
    let fixture: ComponentFixture<PricingStepComponent>;

    let quote: Quote = getTestQuote();
    let premiumCalculationsService: PremiumCalculationsService;
    let messageService: MessageService;
    let userService: UserService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                PricingStepComponent,
                MockBusinessCategoryPricingComponent,
                MockPercentageInputComponent,
                MockCurrencyComponent,
                MockLargeNumberMask,
                MockNumberOnly,
                MockMatSpinner,
                CommissionPricing,
            ],
            imports: [
                FormsModule,
                ErrorModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
            ],
            providers: [
                MessageService,
                MaximumFeeAsyncValidator,
                {
                    provide: PremiumCalculationsService,
                    useClass: MockPremiumCalculationsService,
                },
                {
                    provide: PricingHttpService,
                    useClass: MockPricingHttpService,
                },
                {
                    provide: PricingService,
                    useClass: MockPricingService,
                },
                {
                    provide: CoverageHttpService,
                    useClass: MockCoverageHttpService,
                },
                {
                    provide: FeeHttpService,
                    useClass: MockFeeHttpService,
                },
                {
                    provide: UserService,
                    useClass: mockUserService,
                },
                {
                    provide: FeaturesHttpService,
                    useClass: MockFeaturesHttpService,
                },
                {
                    provide: QuoteService,
                    useClass: baseStepMocks.MockQuoteService,
                },
                {
                    provide: FeeHttpService,
                    useClass: baseStepMocks.MockFeeHttpService,
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PricingStepComponent);
        premiumCalculationsService = TestBed.inject(PremiumCalculationsService);
        userService = TestBed.inject(UserService);
        messageService = TestBed.inject(MessageService);
        component = fixture.componentInstance;
        quote.taxRate = 0.19;
        component.vm = getTestQuote();
        component.originalQuote = getTestQuote();
        component.vm.commissionInformation = { originalGrossCommission: null, actualGrossCommission: null, cfcShare: null, fee: 36, brokerFee: 123 } as CommissionInformation;
        component.isFirstLoad = false;
        component.isNewQuote = false;
        component["pricingService"].pricingInformationChanges = of(true);
        fixture.detectChanges();
    });

    it("creates the component", () => {
        expect(component).not.toBeUndefined();
    });

    it("Should have a setForm and a commission form on Init", () => {
        // Act
        component.ngOnInit();

        // Assert
        expect(component.stepForm).toBeDefined();
        expect(component.commissionForm).toBeDefined();
    });

    it("Should display a custom fee error when the error is different from max and min fee", () => {
        // Arrange
        const clearMessageSpy = spyOn(messageService, "clearMessage");
        const sendMessageSpy = spyOn(messageService, "sendMessage");
        const errorMessage = "Generic fee message";

        const msg = new Message();
        msg.type = MessageType.Error;
        msg.text = errorMessage;

        // Act
        premiumCalculationsService.feeCalculationError.next(
            "Generic fee message"
        );
        fixture.detectChanges();

        // Assert
        expect(clearMessageSpy).toHaveBeenCalled();
        expect(sendMessageSpy).toHaveBeenCalledWith(msg);
    });

    it("Should return an error for a fee above the max limit and excelFeeCalculation feature is disabled", () => {
        // Arrange
        userService.isFeatureAccessible = jasmine
            .createSpy("isFeatureAccessible")
            .and.returnValue(false);
        component["getMaxFee"] = jasmine
            .createSpy("maxFee")
            .and.returnValue(of(250));

        // Act
        component.setValidatorsForFee();
        component.commissionForm.get("fee").setValue(300);
        fixture.detectChanges();

        // Assert
        expect(component.commissionForm.get("fee").errors).toEqual({
            max: Object({ max: 250, actual: 300 }),
        });
    });

    it("Should set a warning", () => {
        // Arrange
        let formBuilder = new FormBuilder();

        const mockBusinessLine = {
            name: "CX",
            description: "Cyber Crime",
        };

        const mockForm = formBuilder.group({
            businessLine: [mockBusinessLine, [Validators.required]],
        });
        const setWarningSpy = spyOn(component, "setWarning");

        // Act
        fixture.detectChanges();
        component.handleWarnings(mockForm, true);

        // Assert
        expect(setWarningSpy).toHaveBeenCalledWith(true);
    });

    it("Should have vm commissionInformation property with the same value as commissionInformation form", () => {
        // Arrange
        component.vm.insuredLocation.country.isoCode = "US";
        component.vm.insuredLocation.stateProvinceCode = "MI"; // max of 58

        component.ngOnChanges({
            vm: {
                currentValue: component.vm,
                previousValue: {},
                firstChange: false,
                isFirstChange: () => {
                    return false;
                },
            },
        });

        const request = ModelMappingsHelper.getQuoteFeeRequest(quote);
        request.premium = 345;

        // Act
        const feeControl = component.commissionForm.get("fee");
        feeControl.setValue(36);

        // Assert
        expect(component.vm.commissionInformation.actualGrossCommission).toEqual(component.commissionForm.value.actualGrossCommission);
        expect(component.vm.commissionInformation.cfcShare).toEqual(component.commissionForm.value.cfcShare);
        expect(component.vm.commissionInformation.fee).toEqual(component.commissionForm.value.fee);
        expect(component.vm.commissionInformation.originalGrossCommission).toEqual(component.commissionForm.value.originalGrossCommission);
    });

    it("should emit event when effective commission is changed", () => {
        // Arrange
        const spyOnActualGrossCommissionChange = spyOn(
            component.onActualGrossCommissionChange,
            "emit"
        );
        component.ngOnChanges({
            vm: {
                currentValue: component.vm,
                previousValue: {},
                firstChange: false,
                isFirstChange: () => {
                    return false;
                },
            },
        });
        component.ngOnInit();
        component.ngAfterViewInit();
        fixture.detectChanges();

        //Act
        const actualGrossCommissionControl = component.commissionForm.get(
            "actualGrossCommission"
        );
        actualGrossCommissionControl.markAsDirty();
        actualGrossCommissionControl.setValue(36);

        // Assert
        expect(spyOnActualGrossCommissionChange).toHaveBeenCalled();
        expect(component.buttonStatus.canSaveAfterRecalculate).toBeTruthy();
        expect(component.buttonStatus.allowRecalculate).toBeTruthy();
    });
});
