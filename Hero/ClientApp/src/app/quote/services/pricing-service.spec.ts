/* tslint:disable:max-classes-per-file */
import { inject, TestBed } from "@angular/core/testing";
import { PricingInformation, Tag } from "@app/models";
import { MockQuoteService } from "@app/quote/quote.component.mock";
import { QuoteService } from "@app/quote/services/quote.service";
import { CombineDiscountPricingService } from "@app/services/combine-discount-pricing.service";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { MessageService } from "@app/services/message.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PricingHttpService } from "@app/services/pricing-http-service";
import { PricingService } from "@app/quote/services/pricing-service";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";
import * as pricingServiceMocks from "./pricing-service.mock";
import { DiscountInformation } from "@app/quote/models/pricing/DiscountInformation";
import { RateChangeInformation } from "@app/quote/models/pricing/RateChangeInformation";
import { FiledDiscountInformation } from "@app/quote/models/pricing/FiledDiscountInformation";
import { PricingResult } from "../models/pricing/PricingResult";
import { not } from "@angular/compiler/src/output/output_ast";

describe("PricingService", () => {

    let pricingService: PricingService;
    let pricingHttpService: PricingHttpService;
    let coverageHttpService: CoverageHttpService;
    let combineDiscountPricingService: CombineDiscountPricingService;
    let getDefaultPricingInformationForSavedQuoteSpy: jasmine.Spy;

    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            {
                provide: PricingHttpService,
                useClass: pricingServiceMocks.MockPricingHttpService
            },
            {
                provide: CoverageHttpService,
                useClass: pricingServiceMocks.MockCoverageHttpService
            },
            {
                provide: PremiumCalculationsService,
                useClass: pricingServiceMocks.MockPremiumCalculationsService
            },
            { provide: QuoteService, useClass: MockQuoteService },
            PricingService,
            MessageService,
            CombineDiscountPricingService
        ]
    }));

    beforeEach(() => pricingServiceMocks.setupTestData());

    beforeEach(inject([PricingService, PricingHttpService, CoverageHttpService],
        (ps: PricingService, phs: PricingHttpService, chs: CoverageHttpService, cdps: CombineDiscountPricingService) => {
            pricingService = ps;
            pricingHttpService = phs;
            coverageHttpService = chs;
            combineDiscountPricingService = cdps;

            spyOn(pricingHttpService, "getDefaultPricingInformation").and.callThrough();
            getDefaultPricingInformationForSavedQuoteSpy = spyOn(pricingHttpService, "getDefaultPricingInformationForSavedQuote").and.callThrough();
            spyOn(coverageHttpService, "getAvailable").and.callThrough();
        }
    ));

    describe("getBusinessLines", () => {
        describe("calling getBusinessLines without AdditionalCoverages", () => {
            let result: Tag[];

            beforeEach(() => {
                // Arrange
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage1);
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage2);
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage3);
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage4);

                // Act
                result = pricingService.getBusinessLines(pricingServiceMocks.quote);
            });

            // Assert
            it("should return a result", () =>
                expect(result).toBeDefined()
            );

            // Assert
            it("should return a result with the correct number of businessCategories without AdditionalCoverages", () =>
                expect(result.length).toBe(2)
            );

            // Assert
            it("should return the correct first result", () =>
                expect(result[0].name).toBe(pricingServiceMocks.businessLine1.name)
            );

            // Assert
            it("should return the correct second result", () =>
                expect(result[1].name).toBe(pricingServiceMocks.businessLine2.name)
            );
        });

        describe("calling getBusinessLines with AdditionalCoverages", () => {
            let result: Tag[];

            beforeEach(() => {
                // Arrange
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage1);
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage2);
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage3);
                pricingServiceMocks.quote.coverages.push(pricingServiceMocks.coverage4);

                // Act
                result = pricingService.getBusinessLines(pricingServiceMocks.quote, true);
            });

            // Assert
            it("should return a result", () =>
                expect(result).toBeDefined()
            );

            // Assert
            it("should return a result with the correct number of businessCategories with AdditionalCoverages", () =>
                expect(result.length).toBe(3)
            );

            // Assert
            it("should return the correct first result", () =>
                expect(result[0].name).toBe(pricingServiceMocks.businessLine1.name)
            );

            // Assert
            it("should return the correct second result", () =>
                expect(result[1].name).toBe(pricingServiceMocks.businessLine2.name)
            );
        });
    });

    // Assert
    describe("Executing getPricingInformation", () => {
        let result: PricingResult;

        beforeEach(async () => {
            result = await pricingService.getPricingInformation(pricingServiceMocks.quote).pipe(first()).toPromise();
        });

        // Assert
        it("Should get coverage types", () => {
            expect(coverageHttpService.getAvailable).toHaveBeenCalled();
        });

        it("Should return a pricing result", () => {
            expect(result).toBeDefined();
        });

        it("Should return a pricing result with the correct number of pricing informations", () => {
            expect(result.pricingInformations.length).toBe(4);
            expect(result.pricingInformations[0].businessLine.name).toBe("XX");
        });

        it("Should return a pricing result with the correct number of location outputs", () => {
            expect(result.locationOutputs.length).toBe(3);
            expect(result.locationOutputs[0].id).toBe("1");        
        });
    });

    describe("updating pricing information", () => {
        let quoteService: QuoteService;

        beforeEach(() => {
            quoteService = TestBed.inject(QuoteService);
        });

        it("should update all pricing information properties but the fee with pro rated data", () => {
            // Arrange
            var proRatedPricing = getMockPricingInformation();

            proRatedPricing[0].quoted = cpQuoted - 500;
            proRatedPricing[1].quoted = cxQuoted - 500;
            proRatedPricing[0].fee = cpFee - 30;
            proRatedPricing[1].fee = cxFee - 30;

            let expectedPricing = getMockPricingInformation();
            expectedPricing[0].quoted = proRatedPricing[0].quoted;
            expectedPricing[1].quoted = proRatedPricing[1].quoted;

            spyOn(quoteService, "setPropertyValue");

            // Act
            pricingService.updateProRatedPricingInformationWithFullFee(getMockPricingInformation(), proRatedPricing);

            // Assert
            expect(quoteService.setPropertyValue).toHaveBeenCalledWith("pricingInformation", expectedPricing);
        });
    });

    describe("when calling calculateDiscountFromQuotedPremium", () => {
        it("should return the correct result", () => {
            // Arrange
            const discountInformation = {
                quotedPremium: 1259,
                model: 1250,
                businessLine: { name: "CP" }
            } as DiscountInformation;

            // Act
            var discount = pricingService.calculateDiscountFromQuotedPremium(discountInformation);

            // Assert
            expect(discount).toBe(-0.72);

        });
    });

    describe("when calling calculateQuotedPremiumFromDiscount", () => {
        it("should return the correct result", () => {
            // Arrange
            const discountInformation = {
                model: 2000,
                discount: -0.72,
                businessLine: { name: "CP" }
            } as DiscountInformation;

            //Act
            var quotedPremium = pricingService.calculateQuotedPremiumFromDiscount(discountInformation);

            // Assert
            expect(quotedPremium).toBe(2014.4);

        });
    });

    describe("when calling calculateQuotedPremiumFromRateChangePercentage", () => {
        it("should return the correct result", () => {
            // Arrange
            const rateChangeInformation = {
                quotedPremium: 1289,
                currentRateChangePremium: 100,
                expiringQuotedPremium: 1290,
                expiringRateChangePremium: 100,
                rateChangePercentage: 2
            } as RateChangeInformation;

            // Act
            var quotedPremium = pricingService.calculateQuotedPremiumFromRateChangePercentage(rateChangeInformation);

            // Assert
            expect(quotedPremium).toBe(1315.8);

        });
    });

    describe("when calling calculateRateChangePercentageFromQuotedPremium", () => {
        it("should return the correct result", () => {
            // Arrange
            const rateChangeInformation = {
                quotedPremium: 1289,
                currentRateChangePremium: 120,
                expiringQuotedPremium: 3200,
                expiringRateChangePremium: 100,
                rateChangePercentage: 2
            } as RateChangeInformation;

            // Act
            var rateChangePercentage = pricingService.calculateRateChangePercentageFromQuotedPremium(rateChangeInformation);

            // Assert
            expect(rateChangePercentage).toBe(-66.432);

        });
    });

    describe("when calling calculateFiledDiscountFromQuotedPremium", () => {
        it("should return the correct result", () => {
            // Arrange
            const filedDiscountInformation = {
                quotedPremium: 1289,
                filedPremium: 1200,
            } as FiledDiscountInformation;

            // Act
            var filedDiscount = pricingService.calculateFiledDiscountFromQuotedPremium(filedDiscountInformation);

            // Assert
            expect(filedDiscount).toBe(-7.42);

        });
    });

    describe("when calling calculateQuotedPremiumFromFiledDiscount", () => {
        it("should return the correct result", () => {
            // Arrange
            const filedDiscountInformation = {
                filedPremium: 1200,
                filedDiscount: -0.23
            } as FiledDiscountInformation;

            // Act
            var quotedPremium = pricingService.calculateQuotedPremiumFromFiledDiscount(filedDiscountInformation);

            // Assert
            expect(quotedPremium).toBe(1202.76);

        });
    });

});

const cpQuoted = 1350;
const cpFee = 90;
const cxQuoted = 800;
const cxFee = 50;

function getMockPricingInformation() {
    return [
        getPricingInformation("CP", cpQuoted, cpFee),
        getPricingInformation("CX", cxQuoted, cxFee)
    ];
}

function getBinder() {
    return {
        binderId: 254,
        binderDescription: "SME Cyber",
        isEuBinder: false
    };
}

function getBusinessLine(businessLineName: string) {
    return {
        name: businessLineName,
        description: "Cyber & Privacy"
    }
}

function getPricingInformation(businessLineName: string, quoteValue: number, feeValue: number) {
    const currentRateChangePremium = 1200;
    const expiringRateChangePremium = 1000;
    const expiringQuotedPremium = 1350;
    const filedPremium = 1300;
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
        rateChangePercentage: (((quoteValue / currentRateChangePremium) / (expiringQuotedPremium / expiringRateChangePremium) - 1) * 100),
        filedPremium: filedPremium,
        filedDiscount: Math.round((1 - (quoteValue / filedPremium)) * 100) / 100,
        suggestedDiscountPercentage: Math.round((1 - (quoteValue / suggested)) * 100) / 100
    }
}
