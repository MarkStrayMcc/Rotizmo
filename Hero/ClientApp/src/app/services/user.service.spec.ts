import { async, TestBed, inject } from "@angular/core/testing";
import { UserService } from "@app/services/user.service";
import { CfcContact, UnderwriterRole } from "@app/models/auto-generated";
import { UserSettingKey } from "@app/constants/UserSettingKey";
import { CookieService } from 'ngx-cookie-service';

/**
 * Tests for UserService.
 */
describe("UserService", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                UserService,
                CookieService
            ]
        }).compileComponents();
    }));

    it("isCountryAllowedToBind returns false when there is no roles",
        inject([UserService], (userService: UserService) => {

            const user: CfcContact = getCfcContact();

            userService.addUser(user);

            // Act
            const isAllowed = userService.isCountryAllowedToBind("US");

            // Assert
            expect(isAllowed).toBeFalsy();
        }));

    it("isCountryAllowedToBind returns false when there is no settings",
        inject([UserService], (userService: UserService) => {

            const user: CfcContact = getCfcContact();
            const role1: UnderwriterRole = getRole(1);
            const role2: UnderwriterRole = getRole(2);
            user.roles.push(role1);
            user.roles.push(role2);

            userService.addUser(user);

            // Act
            const isAllowed = userService.isCountryAllowedToBind("US");

            // Assert
            expect(isAllowed).toBeFalsy();
        }));


    it("isCountryAllowedToBind returns the correct value following the allow/deny logic for each country/role",
        inject([UserService], (userService: UserService) => {

            const user: CfcContact = getCfcContact();
            const role1: UnderwriterRole = getRole(1);
            role1.settings.push({ key: UserSettingKey.allowedCountry, value: "GB" });
            const role2: UnderwriterRole = getRole(2);
            role2.settings.push({ key: UserSettingKey.allowedCountry, value: "US" });
            const role3: UnderwriterRole = getRole(3);
            role3.settings.push({ key: UserSettingKey.deniedCountry, value: "US" });
            role3.settings.push({ key: UserSettingKey.deniedCountry, value: "CA" });

            user.roles.push(role1);
            user.roles.push(role2);
            user.roles.push(role3);
            userService.addUser(user);

            // Act
            const isGbAllowed = userService.isCountryAllowedToBind("GB");
            const isUsAllowed = userService.isCountryAllowedToBind("US");
            const isCaAllowed = userService.isCountryAllowedToBind("CA");
            const isItAllowed = userService.isCountryAllowedToBind("IT");

            // Assert
            expect(isGbAllowed).toBeTruthy();
            expect(isUsAllowed).toBeTruthy();
            expect(isCaAllowed).toBeFalsy();
            expect(isItAllowed).toBeTruthy();
        }));

    it("isLocationAllowedToBind Authorises country, if role says country is allowed for user and stateProvinceCode is empty/undefined",
      inject([UserService], (userService: UserService) => {

        const user: CfcContact = getCfcContact();
        const role1: UnderwriterRole = getRole(1);
        role1.settings.push({ key: UserSettingKey.allowedCountry, value: "GB" });

        user.roles.push(role1);
        // user.roles.push(role2);
        // user.roles.push(role3);
        userService.addUser(user);

        // Act
        const isGbAllowed = userService.isLocationAllowedToBind("GB", "");

        // Assert
        expect(isGbAllowed).toBe(true, "GB must be allowed as there is no state validation to be done when country does not have state!");
      }));

    it("should deny authority in country, if role has only AllowedCountry and no DeniedCountry for user but insuredLocation country is different",
      inject([UserService], (userService: UserService) => {

        const user: CfcContact = getCfcContact();
        const role1: UnderwriterRole = getRole(1);
        role1.settings.push({ key: UserSettingKey.allowedCountry, value: "GB" });

        user.roles.push(role1);
        userService.addUser(user);

        // Act
        const isSaAllowed = userService.isLocationAllowedToBind("SA", "");

        // Assert
        expect(isSaAllowed).toBe(false, "SA must be denied as it is not an AllowedCountry. No state validation to be done.");
      }));

    it("should authorise location, if role has only DeniedCountry for user but insuredLocation country is different",
      inject([UserService], (userService: UserService) => {

        const user: CfcContact = getCfcContact();
        const role1: UnderwriterRole = getRole(1);
        role1.settings.push({ key: UserSettingKey.deniedCountry, value: "ZZ" });

        user.roles.push(role1);
        userService.addUser(user);

        // Act
        const isGbAllowed = userService.isLocationAllowedToBind("GB", "");

        // Assert
        expect(isGbAllowed).toBe(true, "GB must be allowed as there is only a DeniedCountry that's not GB which implies all other countries are authorised.");
      }));

    it("should authorise location, if role has only DeniedCountry and DeniedState for user but insuredLocation location (with state) is different",
      inject([UserService], (userService: UserService) => {

        const user: CfcContact = getCfcContact();
        const role1: UnderwriterRole = getRole(1);
        role1.settings.push({ key: UserSettingKey.deniedCountry, value: "ZZ" });
        role1.settings.push({ key: UserSettingKey.deniedState, value: "ZZ" });

        user.roles.push(role1);
        userService.addUser(user);

        // Act
        const isUsIlAllowed = userService.isLocationAllowedToBind("US", "IL");

        // Assert
        expect(isUsIlAllowed).toBe(true, "US-IL must be allowed as there is [DeniedCountry and DeniedState] which implies all other locations are authorised.");
      }));

    it("should deny location, if role has only DeniedCountry and DeniedState for user and insuredLocation location (with state) is the same",
      inject([UserService], (userService: UserService) => {

        const user: CfcContact = getCfcContact();
        const role1: UnderwriterRole = getRole(1);
        role1.settings.push({ key: UserSettingKey.deniedCountry, value: "US" });
        role1.settings.push({ key: UserSettingKey.deniedState, value: "IL" });

        user.roles.push(role1);
        userService.addUser(user);

        // Act
        const isUsIlAllowed = userService.isLocationAllowedToBind("US", "IL");

        // Assert
        expect(isUsIlAllowed).toBe(false, "US-IL must be denied as it is DeniedCountry/State.");
      }));

    it("should authorise location, if role has AllowedCountry and DeniedState for user and insuredLocation location (with state) is different",
      inject([UserService], (userService: UserService) => {

        const user: CfcContact = getCfcContact();
        const role1: UnderwriterRole = getRole(1);
        role1.settings.push({ key: UserSettingKey.allowedCountry, value: "US" });
        role1.settings.push({ key: UserSettingKey.deniedState, value: "IL" });

        user.roles.push(role1);
        userService.addUser(user);

        // Act
        const isUsNyAllowed = userService.isLocationAllowedToBind("US", "NY");

        // Assert
        expect(isUsNyAllowed).toBe(true, "US-NY must be authorised as NY is not a DeniedState.");
      }));

    function getCfcContact(): CfcContact {
        return {
            cfcContactUid: "4e73f08b-6466-4699-826c-e0ad71196d4a",
            cfcContactId: 1,
            firstName: "Test",
            lastName: "User",
            initials: "TUD",
            email: "tuser@cfcunderwriting.com",
            active: true,
            name: "Test User",
            profileImageUrl: null,
            cfcTeamName: "Healthcare US",
            accessLevel: 1,
            roles: [],
            position: "",
            linkedInUrl: "",
            telephone: "",
            accessibleFeatures: [],
            cfcTeamCoverholder: "CFC Underwriting"
        };
    }

    function getRole(id: number): UnderwriterRole {
        return {
            underwriterRoleId: id,
            name: "Role" + id,
            settings: [],
            limitValidationRules: [],
            activityValidations: [],
            riskQuestionValidations: []
        };
    }

});
