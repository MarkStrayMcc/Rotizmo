import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Injectable } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import {
    PricingInformation,
    Quote,
    RiskQuestionDraftRequest,
    RiskQuestionRequest,
    Tag
} from "@app/models";
import { ModelMappingsHelper } from "@app/models/Mappings/ModelMappingsHelper";
import { CommissionInformation } from "@app/quote/models/pricing/CommissionInformation";
import { QuoteService } from "@app/quote/services/quote.service";
import { mockUserService } from "@app/quote/steps/basic-information-step/basic-information-step.component.spec";
import { FeeHttpService } from "@app/services/fee-http.service";
import { RiskHttpService } from "@app/services/risk-http.service";
import { TriaService } from "@app/services/tria.service";
import { UserService } from "@app/services/user.service";
import { from, of } from "rxjs";
import { first } from "rxjs/operators";
import { getTestQuote } from "../../../test-helpers/index";
import { GoodsAndServicesTaxService } from "./goods-and-services-tax.service";
import { PremiumCalculationsService } from "./premium-calculations.service";

describe("PremiumCalculationsService", () => {
    let quote: Quote;
    let premiumCalculationsService: PremiumCalculationsService;
    let quoteService: QuoteService;
    let maxFeeServiceSpy: jasmine.Spy;
    let defaultFeeServiceSpy: jasmine.Spy;
    let mockTriaService: TriaService = jasmine.createSpyObj(["updateTriaPremium"]);

    let businessLine1: Tag;
    let businessLine2: Tag;
    let businessLine3: Tag;
    let pricingInfo1: PricingInformation;
    let pricingInfo2: PricingInformation;
    let pricingInfo3: PricingInformation;
    let pricingInfo4: PricingInformation;
    let pricingInfo5: PricingInformation;
    let pricingInfo6: PricingInformation;

    beforeEach(() => TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
            PremiumCalculationsService,
            FeeHttpService,
            { provide: GoodsAndServicesTaxService, useClass: MockTaxService },
            { provide: TriaService, useValue: mockTriaService },
            { provide: RiskHttpService, useClass: MockRiskHttpService },
            { provide: UserService, useValue: mockUserService },
            { provide: QuoteService, useClass: MockQuoteService }
        ]
    }));

    beforeEach(() => {
        setupTestData();
        const feeHttpService = TestBed.inject(FeeHttpService);
        maxFeeServiceSpy = spyOn(feeHttpService, "getMaximumFee");
        defaultFeeServiceSpy = spyOn(feeHttpService, "getDefaultFee");
    });

    beforeEach(inject([PremiumCalculationsService, QuoteService], (pcs, qs) => {
        premiumCalculationsService = pcs;
        quoteService = qs;
    }));

    describe("calling the updatePremium method", () => {
        beforeEach(() => {
            // Arrange
            quote = getTestQuote();
            quote.commissionInformation = new CommissionInformation();
            quote.commissionInformation.fee = 20;
            quote.pricingInformation = [
                pricingInfo1,
                pricingInfo2
            ];
            quote.taxRate = 0.15;
            quoteService.getQuote = jasmine.createSpy("getQuote").and.returnValue(quote);

            // Act
            premiumCalculationsService.updatePremium();
        });

        // Assert
        it("should correctly set the premium", () =>

            expect(quote.premium).toBe(380)
        );

        it("Should correctly calculate the premium", () => {
            // Actors
            quote.commissionInformation.originalGrossCommission = 25;
            quote.commissionInformation.actualGrossCommission = 20;
            spyOn(quoteService, "setPropertyValue");

            // Actions
            premiumCalculationsService.updatePremium();

            // Asserts
            expect(quote.premium).toBe(380);
            expect(quoteService["setPropertyValue"]).toHaveBeenCalled();
        });

        it("should correctly set the totalDue", () =>
            expect(quote.totalDue).toBe(457)
        );

        it("Should not change the totalDue when applying actual Gross Comission ", () => {
            // Actors
            quote.commissionInformation.originalGrossCommission = 25;
            quote.commissionInformation.actualGrossCommission = 20;
            spyOn(quoteService, "setPropertyValue");

            // Actions
            premiumCalculationsService.updatePremium();

            // Asserts
            expect(quote.totalDue).toBe(457);
            expect(quoteService["setPropertyValue"]).toHaveBeenCalled();
        });

        it("Should correctly set the totalDue when there is no commission information", () => {
            // Actors
            quote.commissionInformation = undefined;

            // Actions
            premiumCalculationsService.updatePremium();

            // Asserts
            expect(quote.totalDue).toBe(437);
            expect(quote.commissionInformation).toBeUndefined();
        });

        // Assert
        it("Should call updateTriaPremium from TriaService", () =>
            expect(mockTriaService.updateTriaPremium).toHaveBeenCalled()
        );
    });

    describe("calling the calculateTotalFee method", () => {

        beforeEach(() => {

            // Arrange
            quote.commissionInformation = new CommissionInformation();
            quote.pricingInformation = [pricingInfo1, pricingInfo2];
        });

        // Assert
        it("should correctly set the fee", () => {
            // assemble
            defaultFeeServiceSpy.and.returnValue(of(150));
            maxFeeServiceSpy.and.returnValue(of(1000));

            // Act
            premiumCalculationsService.calculateTotalFee(quote).pipe(first())
                .subscribe(() => {
                    // assert
                    expect(quote.commissionInformation.fee).toBe(150);
                });
        });

        // Assert
        it("should correctly set the fee if there is no default fee", () => {
            // assemble
            defaultFeeServiceSpy.and.returnValue(of(null));
            maxFeeServiceSpy.and.returnValue(of(1000));

            // Act
            premiumCalculationsService.calculateTotalFee(quote).pipe(first())
                .subscribe(() => {
                    // assert
                    expect(quote.commissionInformation.fee).toBe(38);
                });
        });

        it("should return the default fee from the service", () => {
            // assemble
            defaultFeeServiceSpy.and.returnValue(of(150));
            const defaultFeeRequest = ModelMappingsHelper.getQuoteFeeRequest(quote);
            defaultFeeRequest.premium = 380;

            maxFeeServiceSpy.and.returnValue(of(1000));

            // act
            premiumCalculationsService.calculateTotalFee(quote).pipe(first())
                .subscribe(() => {
                    // assert
                    //expect(quote.commissionInformation.fee).toBe(150);
                    expect(defaultFeeServiceSpy).toHaveBeenCalledWith(defaultFeeRequest);
                });
        });

        it("should return the max fee from the service", () => {
            // Arrange
            defaultFeeServiceSpy.and.returnValue(of(150));

            maxFeeServiceSpy.and.returnValue(of(1000));
            const maxFeeRequest = ModelMappingsHelper.getFeeRequest(quote);

            // Act
            expect(maxFeeRequest.brokerGroupId).toBe(quote.brokerTeam.broker.brokerGroupId);
            premiumCalculationsService.calculateTotalFee(quote).pipe(first())
                .subscribe(() => {
                    // Assert
                    //expect(quote.commissionInformation.fee).toBe(150);
                    expect(maxFeeServiceSpy).toHaveBeenCalledWith(maxFeeRequest);
                });         
        });
    });

    describe("calling the calculateFeeSplit method", () => {
        beforeEach(() => {
            // Arrange
            quote.commissionInformation = new CommissionInformation();
            quote.pricingInformation = [pricingInfo4, pricingInfo5, pricingInfo6];
            quote.commissionInformation.fee = 100;

            // Act
            premiumCalculationsService.calculateFeeSplit(quote);
        });

        // Assert
        it("should correctly set the fee of the first business category", () => {
            expect(quote.pricingInformation[0].fee).toBe(33.34);
        });

        it("should correctly set the fee of the second business category", () => {
            expect(quote.pricingInformation[1].fee).toBe(33.33);
        });

        it("should correctly set the fee of the third business category", () => {
            expect(quote.pricingInformation[2].fee).toBe(33.33);
        });
    });

    function setupTestData() {
        quote = getTestQuote();

        businessLine1 = {
            name: "XX",
            description: "Test Business Line 1"
        };

        businessLine2 = {
            name: "YY",
            description: "Test Business Line 2"
        };

        businessLine3 = {
            name: "ZZ",
            description: "Test Business Line 3"
        };

        pricingInfo1 = new PricingInformation();
        pricingInfo1.businessLine = businessLine1;
        pricingInfo1.model = 100;
        pricingInfo1.suggested = 100;
        pricingInfo1.quoted = 200;
        pricingInfo1.discount = 0;
        pricingInfo1.isExpanded = false;
        pricingInfo1.defaultFeePercentage = 10;
        pricingInfo1.fee = 20;

        pricingInfo2 = new PricingInformation();
        pricingInfo2.businessLine = businessLine2;
        pricingInfo2.model = 200;
        pricingInfo2.suggested = 180;
        pricingInfo2.quoted = 180;
        pricingInfo2.discount = 10;
        pricingInfo2.isExpanded = false;
        pricingInfo2.defaultFeePercentage = 10;
        pricingInfo2.fee = 18;

        pricingInfo3 = new PricingInformation();
        pricingInfo3.businessLine = businessLine2;
        pricingInfo3.model = 200;
        pricingInfo3.suggested = 180;
        pricingInfo3.quoted = 180;
        pricingInfo3.discount = 10;
        pricingInfo3.isExpanded = false;
        pricingInfo3.defaultFeePercentage = 10;
        pricingInfo3.fee = 20;

        pricingInfo4 = new PricingInformation();
        pricingInfo4.businessLine = businessLine2;
        pricingInfo4.model = 200;
        pricingInfo4.suggested = 180;
        pricingInfo4.quoted = 100;
        pricingInfo4.discount = 10;
        pricingInfo4.isExpanded = false;
        pricingInfo4.defaultFeePercentage = 10;
        pricingInfo4.fee = 10;

        pricingInfo5 = new PricingInformation();
        pricingInfo5.businessLine = businessLine2;
        pricingInfo5.model = 200;
        pricingInfo5.suggested = 180;
        pricingInfo5.quoted = 100;
        pricingInfo5.discount = 10;
        pricingInfo5.isExpanded = false;
        pricingInfo5.defaultFeePercentage = 10;
        pricingInfo5.fee = 10;

        pricingInfo6 = new PricingInformation();
        pricingInfo6.businessLine = businessLine2;
        pricingInfo6.model = 200;
        pricingInfo6.suggested = 180;
        pricingInfo6.quoted = 100;
        pricingInfo6.discount = 10;
        pricingInfo6.isExpanded = false;
        pricingInfo6.defaultFeePercentage = 10;
        pricingInfo6.fee = 10;
    }
});

@Injectable()
class MockTaxService {
    public isGSTRateAvailable = () => true;
    public useGST = () => false;
    public getGST = () => 0.1;
}

// tslint:disable-next-line:max-classes-per-file
@Injectable()
class MockRiskHttpService {
    public getRiskQuestions = (request: RiskQuestionRequest) => from([]);

    public getRiskQuestionsForDraft = (request: RiskQuestionDraftRequest) => from([]);

}

@Injectable()
class MockQuoteService {
    public updateQuote = () => { }
    public setPropertyValue = () => { }
    public getQuote = () => getTestQuote()
}
