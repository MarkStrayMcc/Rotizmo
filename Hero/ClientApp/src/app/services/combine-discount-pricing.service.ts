import { Injectable } from "@angular/core";
import { PricingInformation } from "@app/models";

@Injectable()
export class CombineDiscountPricingService {

    public combineNewPricingWithDiscounts(previousPricing: PricingInformation[], newPricing: PricingInformation[]): PricingInformation[] {
        const combinedPricing = JSON.parse(JSON.stringify(newPricing)) as PricingInformation[];

        for (const newPricingItem of combinedPricing) {
            const oldPricingItem = previousPricing.find(item => item.businessLine.name === newPricingItem.businessLine.name);
            if (oldPricingItem) {
                this.calculateQuotedAndDiscountClampedToPricingFloor(oldPricingItem, newPricingItem);
            }
        }
        return combinedPricing;
    }

    private calculateQuotedAndDiscountClampedToPricingFloor(oldPricingItem: PricingInformation, newPricingItem: PricingInformation) {
        if (!newPricingItem.model || newPricingItem.model === 0) {
            newPricingItem.discount = 0;
            newPricingItem.quoted = 0;
            return;
        }

        let proposedNewPriceWithDiscount = 0;

        if (oldPricingItem.suggestedDiscount !== 0) {
            newPricingItem.discount = isNaN(oldPricingItem.discount) ? 0 : oldPricingItem.discount;

            proposedNewPriceWithDiscount =
                newPricingItem.model - (newPricingItem.model * newPricingItem.discount) / 100;

            newPricingItem.quoted = proposedNewPriceWithDiscount;
        } else {
            newPricingItem.discount =
                this.roundToTwoDecimals((newPricingItem.model - newPricingItem.quoted) / newPricingItem.model * 100);
            proposedNewPriceWithDiscount = newPricingItem.quoted;
        }

        if (proposedNewPriceWithDiscount < newPricingItem.minimumPremium) {
            proposedNewPriceWithDiscount = newPricingItem.minimumPremium;
            newPricingItem.discount = 100 * (newPricingItem.model - proposedNewPriceWithDiscount) / newPricingItem.model ;
        }

        newPricingItem.quoted = Math.round(proposedNewPriceWithDiscount);
    }

    private roundToTwoDecimals(value: number) {
        const factor = 100;
        return Math.round(value * factor) / factor;
    }
}
