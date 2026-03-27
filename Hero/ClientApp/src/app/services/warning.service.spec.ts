/// <reference path="../../../node_modules/@types/jasmine/index.d.ts" />
import { Injectable } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { Client, ClientLocation, Country, Quote, QuoteState } from "@app/models";
import { Currency } from "@app/models/auto-generated/Currency";
import { QuoteService } from "@app/quote/services/quote.service";
import { MockQuoteService } from "@app/quote/steps/base-step.component.mock";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserService } from "@app/services/user.service";
import { WarningService } from "@app/services/warning.service";
import { CookieService } from "ngx-cookie-service";
import { of } from "rxjs";
import { UserAuthorityHttpService } from "./user-authority-http.service";

describe("warning service", () => {
    let service: WarningService;
    let activityValidationSpy: jasmine.Spy;
    let coverageValidationSpy: jasmine.Spy;
    let riskValidationSpy: jasmine.Spy;
    let discountValidationSpy: jasmine.Spy;
    let userLocationSpy: jasmine.Spy;

    beforeEach(async(() => {
        let tester = TestBed.configureTestingModule({
            providers: [
                WarningService,
                UnderwriterActivityValidationService,
                UnderwriterCoverageAuthorityService,
                UnderwriterDiscountAuthorityService,
                UnderwriterRiskValidationService,
                UserService,
                CookieService,
                { provide: UserAuthorityHttpService, useClass: MockUserAuthorityHttpService },
                { provide: QuoteService, useClass: MockQuoteService }
            ]
        });
        service = tester.get(WarningService);
        activityValidationSpy = spyOn(tester.get(UnderwriterActivityValidationService), "doActivityDetailsHaveWarning");
        coverageValidationSpy = spyOn(tester.get(UnderwriterCoverageAuthorityService), "hasValidCoveragesLimitAuthority");
        discountValidationSpy = spyOn(tester.get(UnderwriterDiscountAuthorityService), "hasPricingDiscountWarning");
        riskValidationSpy = spyOn(tester.get(UnderwriterRiskValidationService), "hasValidRiskAnswers");
        userLocationSpy = spyOn(tester.get(UserService), "isLocationAllowedToBind");
    }));

    it("should not have warnings if in approved state", async(() => {
        // Assemble
        let quote = new Quote();
        quote.state = QuoteState.Approved;
        activityValidationSpy.and.returnValue(true); // should cause warning normally
        coverageValidationSpy.and.returnValue(true);
        riskValidationSpy.and.returnValue(true);
        discountValidationSpy.and.returnValue(false);
        userLocationSpy.and.returnValue(true);

        // ACT
        let hasWarning = service.hasWarning(quote);

        // Assert
        expect(hasWarning).toBeFalsy();
    }));

    it("should not have warnings if in bound state", async(() => {
        // Assemble
        let quote = new Quote();
        quote.state = QuoteState.Bound;
        activityValidationSpy.and.returnValue(true); // should cause warning normally
        coverageValidationSpy.and.returnValue(true);
        riskValidationSpy.and.returnValue(true);
        discountValidationSpy.and.returnValue(false);
        userLocationSpy.and.returnValue(true);

        // ACT
        let hasWarning = service.hasWarning(quote);

        // Assert
        expect(hasWarning).toBeFalsy();
    }));

    it("should have warnings if in progress state and activities are warned", async(() => {
        // Assemble
        let quote = new Quote();
        quote.state = QuoteState.InProgress;
        activityValidationSpy.and.returnValue(true); // should cause warning normally
        coverageValidationSpy.and.returnValue(true);
        riskValidationSpy.and.returnValue(true);
        discountValidationSpy.and.returnValue(false);
        userLocationSpy.and.returnValue(true);

        // ACT
        let hasWarning = service.hasWarning(quote);

        // Assert
        expect(hasWarning).toBeTruthy();
    }));

    it("should check each of the validation services when quote state is in progress", async(() => {
        // Assemble
        let quote = new Quote();
        quote.client = new Client();
        quote.client.primaryLocation = new ClientLocation();
        quote.client.primaryLocation.country = new Country();
        quote.client.primaryLocation.country.isoCode = "UK";
        quote.client.primaryLocation.stateProvinceCode = "CA";
        quote.currency = new Currency();
        quote.currency.isoCode = "USD";

        quote.state = QuoteState.InProgress;
        activityValidationSpy.and.returnValue(false);
        coverageValidationSpy.and.returnValue(true);
        riskValidationSpy.and.returnValue(true);
        discountValidationSpy.and.returnValue(false);
        userLocationSpy.and.returnValue(true);

        // ACT
        let hasWarning = service.hasWarning(quote);

        // Assert
        expect(hasWarning).toBeFalsy();
        expect(activityValidationSpy).toHaveBeenCalled();
        expect(coverageValidationSpy).toHaveBeenCalled();
        expect(riskValidationSpy).toHaveBeenCalled();
        expect(discountValidationSpy).toHaveBeenCalled();
        expect(userLocationSpy).toHaveBeenCalledWith("UK", "CA");
    }));

    @Injectable()
    class MockUserAuthorityHttpService {
        public getRiskQuestionValidationRulesByActivities() {
            return of([]);
        }
    }
});
