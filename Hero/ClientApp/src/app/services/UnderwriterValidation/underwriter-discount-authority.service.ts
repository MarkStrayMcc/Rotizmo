import { Injectable } from "@angular/core";
import { UserService } from "@app/services/user.service";
import { UnderwriterRoleSetting, PricingInformation } from "@app/models";
import { coerceNumberProperty } from "@angular/cdk/coercion";

@Injectable()
export class UnderwriterDiscountAuthorityService {
	private discountKey: string = "MAX_PERCENTAGE_DISCOUNT";
	private suggestedDiscountKey: string = "MAX_PERCENTAGE_SUGGESTED_DISCOUNT";

	constructor(private userService: UserService) {}

	public getMaxDiscountPercentage(): number {
		return this.getDiscountValue(this.discountKey);
	}

	public getMaxSuggestedDiscountPercentage(): number {
		return this.getDiscountValue(this.suggestedDiscountKey);
	}

	public getDiscountSetting(roleSettings: UnderwriterRoleSetting[], key: string): UnderwriterRoleSetting {
		for (const setting of roleSettings) {
			if (setting.key === key) {
				return setting;
			}
		}

		return null;
	}

	public hasPricingDiscountWarning(pricingInformations: PricingInformation[]): boolean {
		const maxDiscount = this.getMaxDiscountPercentage();
		const maxSuggestedDiscountPercentage = this.getMaxSuggestedDiscountPercentage();

		for (const pricingInfo of pricingInformations) {
			if (pricingInfo.discount > maxDiscount || pricingInfo.suggestedDiscountPercentage > maxSuggestedDiscountPercentage) {
				return true;
			}
		}

		return false;
	}

	public getDiscountValue(key: string): number {
		const user = this.userService.getUser();
		let currentMaxDiscount = 0;
		if (user && user.roles) {
			for (const role of user.roles) {
				const discountSetting = this.getDiscountSetting(role.settings, key);
				if (discountSetting) {
					const discount = coerceNumberProperty(discountSetting.value);
					if (discount > currentMaxDiscount) {
						currentMaxDiscount = discount;
					}
				}
			}
		}

		return currentMaxDiscount;
	}
}
