import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from "@angular/router";
import { IUnsavedChanges } from "@app/routeguards/deactivate-guard/IUnsavedChanges";
import { NavigationOverrideService } from "@app/services/navigation-override.service";

@Injectable()
export default class DeactivateGuard implements CanDeactivate<IUnsavedChanges> {
    // Handles case when user navigates away within Angular
    // To use, component should implement IUnsavedChanges, then add canDeactivate: [DeactivateGuard] to route

    constructor(private navigationOverrideService: NavigationOverrideService) {
    }

    public canDeactivate(
        component: IUnsavedChanges,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot): boolean {

        if (!this.navigationOverrideService.allowNavigation && component && component.hasUnsavedData) {
            return confirm("You have unsaved changes! If you leave, your changes will be lost.");
        }

        return true;
    }
}