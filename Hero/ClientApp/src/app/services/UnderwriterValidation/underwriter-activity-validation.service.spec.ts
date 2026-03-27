import { inject, TestBed } from "@angular/core/testing";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { UserService } from "@app/services/user.service";
import {
  CfcContact,
  UnderwriterRole,
  UnderwriterRoleActivityValidation,
  ActivityDetail,
  ActivityMap
} from "@app/models";
import { CookieService } from 'ngx-cookie-service';

describe("UnderwriterActivityValidationService", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UnderwriterActivityValidationService,
                UserService,
                CookieService
            ]
        });
    });

    it("Should be created",
        inject([UnderwriterActivityValidationService, UserService],
            (service: UnderwriterActivityValidationService,
                userService: UserService) => {
        expect(service).toBeTruthy();
    }));

    it("Should get the user when getting maximum percentage",
        inject([UnderwriterActivityValidationService, UserService],
            (service: UnderwriterActivityValidationService,
                userService: UserService) => {
                // arrange
                let userSpy = spyOn(userService, "getUser").and.returnValue(getMockUserWithActivities());

                // ACT
                service.getMaximumActivityPercentage("A");

                // Assert
                expect(userSpy).toHaveBeenCalled();
            }));

    it("Should get the maximum percentage for a given activity code",
        inject([UnderwriterActivityValidationService, UserService],
        (service: UnderwriterActivityValidationService,
            userService: UserService) => {
            // arrange
            spyOn(userService, "getUser").and.returnValue(getMockUserWithActivities());

            // ACT
            let percentage: number = service.getMaximumActivityPercentage("A");

            // Assert
            expect(percentage).toBe(50);
    }));

    it("Should return maximum of 100 if given activity isn't present",
        inject([UnderwriterActivityValidationService, UserService],
            (service: UnderwriterActivityValidationService,
                userService: UserService) => {
                // arrange
                spyOn(userService, "getUser").and.returnValue(getMockUserWithActivities());

                // ACT
                let percentage: number = service.getMaximumActivityPercentage("C");

                // Assert
                expect(percentage).toBe(100);
            }));

    it("Should return true for a warning if an existing quote had activity percentages greater than allowed",
        inject([UnderwriterActivityValidationService, UserService],
            (service: UnderwriterActivityValidationService,
                userService: UserService) => {
                // arrange
                let userSpy = spyOn(userService, "getUser").and.returnValue(getMockUserWithActivities());

                // ACT
                let hasWarning: boolean = service.doActivityDetailsHaveWarning(getMockQuoteActivities());

                // Assert
                expect(hasWarning).toBeTruthy();
                expect(userSpy).toHaveBeenCalled();
            }));
    /**
     * 
     * @returns contact with two roles, each having activities A and B
     *  * with the second roles max for A being 50%, and B being 60%
     */
    function getMockUserWithActivities(): CfcContact {
        let mockUser = new CfcContact();
        let primaryRole = new UnderwriterRole();
        let secondaryRole = new UnderwriterRole();

        // activities setup
        let firstActivity = new UnderwriterRoleActivityValidation();
        firstActivity.activityCode = "A";
        firstActivity.maximumActivityPercentage = 10;

        let secondActivity = new UnderwriterRoleActivityValidation();
        secondActivity.activityCode = "B";
        secondActivity.maximumActivityPercentage = 20;

        primaryRole.activityValidations = [firstActivity, secondActivity];

        let thirdActivity = new UnderwriterRoleActivityValidation();
        thirdActivity.activityCode = "A";
        thirdActivity.maximumActivityPercentage = 50;

        let fourthActivity = new UnderwriterRoleActivityValidation();
        fourthActivity.activityCode = "B";
        fourthActivity.maximumActivityPercentage = 60;

        secondaryRole.activityValidations = [fourthActivity, thirdActivity];
        mockUser.roles = [primaryRole, secondaryRole];

        return mockUser;
    }

    function getMockQuoteActivities(): ActivityDetail[] {
        let firstActivity = new ActivityDetail();
        let firstActivityMap = new ActivityMap();
        firstActivityMap.code = "A";
        firstActivity.percent = 5;
        let secondActivity = new ActivityDetail();
        let secondActivityMap = new ActivityMap();
        secondActivityMap.code = "B";
        secondActivity.percent = 80;

        firstActivity.activityMaps = [firstActivityMap]
        secondActivity.activityMaps = [secondActivityMap]

        return [firstActivity, secondActivity];
    }
});
