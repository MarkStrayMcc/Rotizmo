import { Injectable } from '@angular/core';
import { ActivityDetail, UnderwriterRole, UnderwriterRoleActivityValidation } from '@app/models';
import { UserService } from '@app/services/user.service';

@Injectable()
export class UnderwriterActivityValidationService {
    constructor(private userService: UserService) {

    }

    /**
     * 
     * @param {string} activityCode
     * @returns maximum percentage for the user based on the activity code
     */
    public getMaximumActivityPercentage(activityCode: string): number {
        const user = this.userService.getUser();
        const defaultValue = 100;
        let maxPercentage = -1;
        if (user && user.roles) {
            for (const role of user.roles) {
                const activityValidation = this.getActivityValidationForRoleAndCode(role, activityCode);
                if (activityValidation && activityValidation.maximumActivityPercentage > maxPercentage) {
                    maxPercentage = activityValidation.maximumActivityPercentage;
                }
            }
        }
        return maxPercentage !== -1 ? maxPercentage : defaultValue;
    }

    public doActivityDetailsHaveWarning(activities: ActivityDetail[]): boolean {
        for (const activity of activities) {
            for (const activityMap of activity.activityMaps) {
                const maxPercent = this.getMaximumActivityPercentage(activityMap.code);
                if (maxPercent < activity.percent) {
                    return true;
                }
            }
        }

        return false;
    }

    private getActivityValidationForRoleAndCode(role: UnderwriterRole, activityCode: string)
        : UnderwriterRoleActivityValidation {
        const activities = role.activityValidations.filter(act => act.activityCode === activityCode);
        if (activities && activities.length > 0) {
            return activities[0];
        }

        return null;
    }
}
