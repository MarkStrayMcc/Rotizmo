import { inject, TestBed } from "@angular/core/testing";
import { Binder, PricingInformation } from "@app/models";
import { CombineDiscountPricingService } from "@app/services/combine-discount-pricing.service";

describe("Combine and Discount Pricing Service", () => {
    let originalPricingInformation: PricingInformation;
    let newPricingInformation: PricingInformation;
    let combineDiscountPricingService: CombineDiscountPricingService;

    const discountThatWillPass = 40;
    const discountThatWillFail = 61;

    beforeEach(() => TestBed.configureTestingModule({
        providers: [CombineDiscountPricingService]
    }));
    beforeEach(() => setupTestData());
    beforeEach(inject([CombineDiscountPricingService],
        (cdps: CombineDiscountPricingService) => {
            combineDiscountPricingService = cdps;
        }
    ));

    describe("calculateQuotedAndDiscountClampedToPricingFloor", () => {
        it("Should return the new quoted price and discount if the pricing minimum is not breached", () => {
            // Assemble

            // Act
            originalPricingInformation.discount = discountThatWillPass;
            const combinedPricing = combineDiscountPricingService.combineNewPricingWithDiscounts([originalPricingInformation], [newPricingInformation]);
            // Assert
            expect(combinedPricing[0].discount).toBe(discountThatWillPass);
            expect(combinedPricing[0].quoted).toBe(originalPricingInformation.quoted);
        });

        it("Should return the minimum price and newly caluclated discount if the pricing minimum is breached", () => {
            // Assemble

            // Act
            originalPricingInformation.discount = discountThatWillFail;
            const combinedPricing = combineDiscountPricingService.combineNewPricingWithDiscounts([originalPricingInformation], [newPricingInformation]);
            // Assert
            expect(combinedPricing[0].discount).toBeLessThan(originalPricingInformation.discount);
            expect(combinedPricing[0].quoted).toBeGreaterThanOrEqual(originalPricingInformation.minimumPremium);
        });
    });

    function setupTestData() {
        const binder = new Binder();
        binder.binderId = 1;
        binder.binderDescription = "Binder Test 1";

        const businessLine1 = {
            name: "XX",
            description: "Test Business Line 1"
        };

        originalPricingInformation = new PricingInformation();
        originalPricingInformation.businessLine = businessLine1;
        originalPricingInformation.model = 500;
        originalPricingInformation.quoted = 300;
        originalPricingInformation.discount = 40;
        originalPricingInformation.minimumPremium = 200;

        newPricingInformation = new PricingInformation();
        newPricingInformation.businessLine = businessLine1;
        newPricingInformation.model = 500;
        newPricingInformation.quoted = 500;
        newPricingInformation.discount = 0;
        newPricingInformation.minimumPremium = 200;
    }
});
