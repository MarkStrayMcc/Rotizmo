import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormGroup } from "@angular/forms";

import * as moment from "moment";
import { from } from "rxjs";

import { RiskService } from "@app/services/risk-service";
import { getTestQuote } from "../../../../../test-helpers/index";
import { BindQuoteBasicStepComponent } from "./bind-quote-basic-step.component";
import { UserService } from "@app/services/user.service";

describe("BindQuoteBasicStepComponent", () => {
    let component: BindQuoteBasicStepComponent;
    let fixture: ComponentFixture<BindQuoteBasicStepComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BindQuoteBasicStepComponent],
            providers: [
                { provide: RiskService, useClass: MockRiskService },
                { provide: UserService, useValue: { isFeatureAccessible: () => true } },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BindQuoteBasicStepComponent);
        component = fixture.componentInstance;
        component.quote = getTestQuote();
        component.form = new FormGroup({
            inceptionDate: new FormControl(),
            expiryDate: new FormControl(),
            receivedDate: new FormControl()
        });
        fixture.detectChanges();
    });

    it("Should create component", () => {
        expect(component).toBeTruthy();
    });

    it("Should update the expiry date if the inception date is updated.", () => {
        const targetDate = moment("2018-02-02");
        const originalDate = moment("2018-02-02");
        const policyPeriod = component.quote.policyPeriod;

        // act
        targetDate.add(policyPeriod, "M");
        component.form.controls.inceptionDate.setValue(originalDate);
        expect(moment(component.form.controls.expiryDate.value).date()).toBe(targetDate.date());
    });

    describe("isLocalBrokerVisible", () => {
        beforeEach(() => {
            component.quote.brokerTeam.broker.country.isoCode = "UK";
        });

        it("should return true when Canadian broker is visible", () => {
            // Arrange
            component.quote.insuredLocation.country.isoCode = "CA";

            // Act
            const isLocalBrokerVisible = component.isLocalBrokerVisible;
    
            // Assert
            expect(isLocalBrokerVisible).toBe(true);
        });

        it("should return true when EEA broker is visible", () => {
            // Arrange
            component.quote.insuredLocation.country.isoCode = "FR";

            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;
    
            // Assert
            expect(isCanadianBrokerVisible).toBe(false);
        });

        it("should return false when EEA and Canadian broker is not visible", () => {
            // Arrange
            component.quote.insuredLocation.country.isoCode = "UK";

            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;
    
            // Assert
            expect(isCanadianBrokerVisible).toBe(false);
        });
    });

    describe("isCanadianBrokerVisible", () => {
        beforeEach(() => {
            component.quote.insuredLocation.country.isoCode = "CA";
            component.quote.brokerTeam.broker.country.isoCode = "UK";
        });

        it("should return true when insured location licence region is Canada and broker is not Canadian", () => {
            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;
    
            // Assert
            expect(isCanadianBrokerVisible).toBe(true);
        });

        it("should return false when insured location licence region is Canada and broker is Canadian", () => {
            // Arrange
            component.quote.brokerTeam.broker.country.isoCode = "CA";

            // Act
            const isCanadianBrokerVisible = component.isCanadianBrokerVisible;
    
            // Assert
            expect(isCanadianBrokerVisible).toBe(false);
        });

        it("should return false when insured location licence region is not Canada", () => {
            // Arrange
            component.quote.insuredLocation.country.isoCode = "UK";

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

            component.quote.insuredLocation.country.isoCode = "FR";
            component.quote.brokerTeam.broker.country.isoCode = "UK";
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
            component.quote.brokerTeam.broker.country.isoCode = "FR";

            // Act
            const isEeaBrokerVisible = component.isEeaBrokerVisible;
    
            // Assert
            expect(isEeaBrokerVisible).toBe(false);
        });

        it("should return false when insured location licence region is not EEA", () => {
            // Arrange
            component.quote.insuredLocation.country.isoCode = "UK";

            // Act
            const isEeaBrokerVisible = component.isEeaBrokerVisible;
    
            // Assert
            expect(isEeaBrokerVisible).toBe(false);
        });
    });
});

class MockRiskService {
    public updateRiskQuestions = () => from([[]]);
    public getRiskQuestions = () => [];
    public updateRiskQuestionAnswers(): void {}
}
