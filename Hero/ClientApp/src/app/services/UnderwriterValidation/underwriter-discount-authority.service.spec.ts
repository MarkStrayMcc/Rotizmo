import { inject, TestBed } from "@angular/core/testing";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { UserService } from "@app/services/user.service";
import { CfcContact, UnderwriterRole, UnderwriterRoleSetting, PricingInformation } from "@app/models";
import { CookieService } from "ngx-cookie-service";

describe("UnderwriterDiscountAuthorityService", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [UnderwriterDiscountAuthorityService, UserService, CookieService],
		});
	});

	it("Should be created", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			expect(service).toBeTruthy();
		}
	));

	it("Should get user when getting max discount", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let userServiceSpy = spyOn(userService, "getUser").and.returnValue(getMockUserWithSettings());

			// Act
			let maxDiscount: number = service.getMaxDiscountPercentage();

			// Assert
			expect(userServiceSpy).toHaveBeenCalled();
		}
	));

	it("Should return the discount if present from role settings", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let userServiceSpy = spyOn(userService, "getUser").and.returnValue(getMockUserWithSettings());

			// Act
			let maxDiscount: number = service.getMaxDiscountPercentage();

			// Assert
			expect(maxDiscount).toBe(45);
		}
	));

	it("Should return the biggest discount if present in many roles", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let userServiceSpy = spyOn(userService, "getUser").and.returnValue(getMockUserWithSettings());

			// Act
			let maxDiscount: number = service.getMaxDiscountPercentage();

			// Assert
			expect(maxDiscount).toBe(45);
		}
	));

	it("Should return the max discount of 0 if no settings present for role", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let userServiceSpy = spyOn(userService, "getUser").and.returnValue(getMockUserWithoutSettings());

			// Act
			let maxDiscount: number = service.getMaxDiscountPercentage();

			// Assert
			expect(maxDiscount).toBe(0);
		}
	));
	it("Should return the role setting based on the discount key", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let mockSettings = [
				{
					key: "MAX_PERCENTAGE_DISCOUNT",
					value: "23",
				},
				{
					key: "someOtherKey",
					value: "hello",
				},
			];

			// Act
			let setting: UnderwriterRoleSetting = service.getDiscountSetting(mockSettings, "MAX_PERCENTAGE_DISCOUNT");

			// Assert
			expect(setting.value).toBe("23");
		}
	));

	it("Should return null if the discount role setting is not present", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let mockSettings = [
				{
					key: "test2",
					value: "23",
				},
				{
					key: "someOtherKey",
					value: "hello",
				},
			];

			// Act
			let setting: UnderwriterRoleSetting = service.getDiscountSetting(mockSettings, "MAX_PERCENTAGE_DISCOUNT");

			// Assert
			expect(setting).toBeNull();
		}
	));

	it("Should return true if one of the existing discounts is greater than max discount", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let pricingInfo1 = new PricingInformation();
			pricingInfo1.discount = 10;
			let pricingInfo2 = new PricingInformation();
			pricingInfo2.discount = 50;

			spyOn(userService, "getUser").and.returnValue(getMockUserWithSettings());

			// Act
			let hasWarning = service.hasPricingDiscountWarning([pricingInfo1, pricingInfo2]);

			// Assert
			expect(hasWarning).toBeTruthy();
		}
	));

	it("Should return false if all of the existing discounts are less than max discount", inject(
		[UnderwriterDiscountAuthorityService, UserService],
		(service: UnderwriterDiscountAuthorityService, userService: UserService) => {
			// Arrange
			let pricingInfo1 = new PricingInformation();
			pricingInfo1.discount = 10;
			let pricingInfo2 = new PricingInformation();
			pricingInfo2.discount = 20;

			spyOn(userService, "getUser").and.returnValue(getMockUserWithSettings());

			// Act
			let hasWarning = service.hasPricingDiscountWarning([pricingInfo1, pricingInfo2]);

			// Assert
			expect(hasWarning).toBeFalsy();
		}
	));
	function getMockUserWithSettings(): CfcContact {
		let mockUser = new CfcContact();
		let primaryRole = new UnderwriterRole();
		let discountSetting = new UnderwriterRoleSetting();
		discountSetting.key = "MAX_PERCENTAGE_DISCOUNT";
		discountSetting.value = "25";

		primaryRole.settings = [discountSetting];

		let secondaryRole = new UnderwriterRole();
		let secondDiscountSetting = new UnderwriterRoleSetting();
		secondDiscountSetting.key = "MAX_PERCENTAGE_DISCOUNT";
		secondDiscountSetting.value = "45";

		secondaryRole.settings = [secondDiscountSetting];
		mockUser.roles = [primaryRole, secondaryRole];

		return mockUser;
	}

	function getMockUserWithoutSettings(): CfcContact {
		let mockUser = new CfcContact();
		let primaryRole = new UnderwriterRole();

		primaryRole.settings = [];

		mockUser.roles = [primaryRole];

		return mockUser;
	}
});
