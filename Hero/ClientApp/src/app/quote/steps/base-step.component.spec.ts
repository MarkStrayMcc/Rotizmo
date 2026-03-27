/* tslint:disable:max-classes-per-file */
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ChangeDetectorRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { XHRBackend } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DocumentScopePipe } from "@app/quote/pipes/document-scope.pipe";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { CoveragesStepComponent } from "@app/quote/steps/coverages-step/coverages-step.component";
import { EndorsementsStepComponent } from "@app/quote/steps/endorsements-step/endorsements-step.component";
import { PricingStepComponent } from "@app/quote/steps/pricing-step/pricing-step.component";
import { RiskStepComponent } from "@app/quote/steps/risk-step/risk-step.component";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { BrokerContactHttpService } from "@app/services/broker-contact-http-service";
import { ClientClearanceService } from "@app/services/client-clearance-service";
import { ClientLatestReferenceHttpService } from "@app/services/client-latestreference-http.service";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { CoverageItemService } from "@app/services/coverage-item.service";
import { CoverageService } from "@app/services/coverage.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { EndorsementHttpService } from "@app/quote/services/endorsements/endorsement-http.service";
import { FeeHttpService } from "@app/services/fee-http.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PreviewDocumentModalService } from "@app/services/preview-document-modal.service";
import { PricingHttpService } from "@app/services/pricing-http-service";
import { PricingService } from "@app/quote/services/pricing-service";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";
import { RiskHttpService } from "@app/services/risk-http.service";
import { RiskService } from "@app/services/risk-service";
import { SubjectivityHttpService } from "@app/quote/services/subjectivity/subjectivity-http.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserService } from "@app/services/user.service";
import { WordingVersionHttpService } from "@app/quote/services/wording-version/wording-version-http-service";
import { ErrorModule } from "@app/shared/error.module";
import { getTestQuote } from "@test-helpers/index";
import { MaximumFeeAsyncValidator } from "../../validators/maximum-fee-async.validator";
import { QuoteService } from "../services/quote.service";
import { ActivitiesStepComponent } from "./activities-step/activities-step.component";
import * as baseStepMocks from "./base-step.component.mock";
import { BasicInformationStepComponent } from "./basic-information-step/basic-information-step.component";
import { MockPremiumCalculationsService } from "./pricing-step/pricing-step.component.mock";
import { SubjectivitiesStepComponent } from "./subjectivities-step/subjectivities-step.component";
import { SubjectivityConfigurationStepComponent } from "./subjectivity-configuration-step/subjectivity-configuration-step.component";

enum Step {
    BasicInformation = 1,
    Coverages = 2,
    Activities = 3,
    Risk = 4,
    Subjectivities = 5,
    Endoresements = 6,
    Pricing = 7
}

xdescribe("BaseStepComponent", () => {
    let component: BaseStepComponent;
    let fixture: ComponentFixture<BaseStepComponent>;

    for (let step = Step.BasicInformation; step <= Step.Pricing; step++) {
        const currentStep = step;

        describe(Step[step] + "StepComponent", () => {
            beforeEach(() => setupStepComponent(currentStep));

            describe("destroying the component", () => {
                beforeEach(() => {
                    // Arrange
                    spyOn(component.onValid, "emit");

                    // Act
                    component.ngOnDestroy();
                });

                // Assert
                it("onValid event should have been emitted", () =>
                    expect(component.onValid.emit).toHaveBeenCalled()
                );
            });
        });
    }

    beforeEach(() => TestBed.configureTestingModule({
        declarations: [
            BasicInformationStepComponent,
            CoveragesStepComponent,
            ActivitiesStepComponent,
            RiskStepComponent,
            SubjectivitiesStepComponent,
            SubjectivityConfigurationStepComponent,
            EndorsementsStepComponent,
            PricingStepComponent,
            baseStepMocks.MockAutocompleteDropdown,
            baseStepMocks.MockDatePicker,
            baseStepMocks.MockCoverageComponent,
            baseStepMocks.MockActivityListComponent,
            baseStepMocks.MockCurrencyComponent,
            baseStepMocks.MockCommissionPricing,
            baseStepMocks.MockMatProgressSpinner,
            baseStepMocks.MockBusinessCategoryPricingComponent,
            baseStepMocks.MockValueArray,
            DocumentScopePipe,
            baseStepMocks.MockRiskPanelComponent,
            baseStepMocks.MockSurplusLineSelectorComponent
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            HttpClientTestingModule,
            ErrorModule,
            MatFormFieldModule,
            MatInputModule,
            BrowserAnimationsModule
        ],
        providers: [
            PreviewDocumentModalService,
            ModalDialogService, MaximumFeeAsyncValidator,
            { provide: BrokerContactHttpService, useClass: baseStepMocks.MockBrokerContactHttpService },
            { provide: ModalDialogService, useClass: baseStepMocks.MockModalDialogService },
            { provide: MatDialog, useClass: baseStepMocks.MockMatDialog },
            { provide: NavigationOverrideService, useClass: baseStepMocks.MockNavigationoverride },
            { provide: XHRBackend, useClass: MockBackend },
            { provide: MatDialogRef, useClass: baseStepMocks.MockMatDialogRef },
            { provide: DropdownService, useClass: baseStepMocks.MockDropdownService },
            { provide: UserService, useClass: baseStepMocks.MockUserService },
            { provide: WordingVersionHttpService, useClass: baseStepMocks.MockWordingVersionHttpService },
            { provide: DropDownManagerService, useClass: baseStepMocks.MockDropDownManagerService },
            { provide: ModalDialogService, useClass: baseStepMocks.MockModalDialogService },
            { provide: UnderwriterCoverageAuthorityService, useClass: baseStepMocks.MockCoverageAuthorityService },
            { provide: CoverageHttpService, useClass: baseStepMocks.MockCoverageHttpService },
            { provide: CoverageService, useClass: baseStepMocks.MockCoverageService },
            { provide: CoverageItemService, useClass: baseStepMocks.MockCoverageItemService },
            { provide: PremiumCalculationsService, useClass: baseStepMocks.MockPremiumCalculationsService },
            { provide: PricingHttpService, useClass: baseStepMocks.MockPricingHttpService },
            { provide: PricingService, useClass: baseStepMocks.MockPricingService },
            { provide: RiskHttpService, useClass: baseStepMocks.MockRiskHttpService },
            { provide: SubjectivityHttpService, useClass: baseStepMocks.MockSubjectivitiesHttpService },
            { provide: EndorsementHttpService, useClass: baseStepMocks.MockEndorsementHttpService },
            { provide: QuoteSubjectivityService, useClass: baseStepMocks.MockQuoteSubjectivityService },
            { provide: BinderValidationService, useClass: baseStepMocks.MockBinderValidationService },
            { provide: GoodsAndServicesTaxService, useClass: baseStepMocks.MockTaxService },
            { provide: FeeHttpService, useClass: baseStepMocks.MockFeeHttpService },
            { provide: RiskService, useClass: baseStepMocks.MockRiskService },
            { provide: ClientClearanceService, useClass: baseStepMocks.MockClientClearanceService },
            { provide: CurrencyHttpService, useClass: baseStepMocks.MockCurrencyService },
            { provide: ClientLatestReferenceHttpService, useClass: baseStepMocks.MockClientLatestReferenceHttpService },
            { provide: QuoteService, useClass: baseStepMocks.MockQuoteService },
            {
                provide: PremiumCalculationsService,
                useClass: MockPremiumCalculationsService
            },
            {
                provide: FeeHttpService,
                useClass: baseStepMocks.MockFeeHttpService
            },
            UnderwriterActivityValidationService,
            UnderwriterRiskValidationService,
            MessageService,
            ChangeDetectorRef,
            FeeHttpService
        ]
    }));

    function setupStepComponent(step: Step) {
        fixture = getFixture(step);
        component = fixture.componentInstance;
        component.vm = getTestQuote();
        component.originalQuote = getTestQuote();
        fixture.detectChanges();
    }

    function getFixture(step: Step): ComponentFixture<BaseStepComponent> {
        switch (step) {
            case Step.BasicInformation: return TestBed.createComponent(BasicInformationStepComponent);
            case Step.Coverages: return TestBed.createComponent(CoveragesStepComponent);
            case Step.Activities: return TestBed.createComponent(ActivitiesStepComponent);
            case Step.Risk: return TestBed.createComponent(RiskStepComponent);
            case Step.Subjectivities: return TestBed.createComponent(SubjectivitiesStepComponent);
            case Step.Endoresements: return TestBed.createComponent(EndorsementsStepComponent);
            case Step.Pricing: return TestBed.createComponent(PricingStepComponent);
            default: return null;
        }
    }
});
