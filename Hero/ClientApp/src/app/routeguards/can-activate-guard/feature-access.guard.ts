import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { FeatureAccess } from "@app/models";
import { FeaturesHttpService } from "@app/services/features-http.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class FeatureAccessGuard implements CanActivate {

    public constructor(private router: Router, private featureHttpService: FeaturesHttpService) { }

    public canActivate(
        route: ActivatedRouteSnapshot, // current route information
        state: RouterStateSnapshot // route state information
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.featureHttpService.isFeatureActive(route.data.featureName)
            .pipe(
                map((featureAccess: FeatureAccess) => {
                if (!featureAccess.hasAccess) {
                    this.router.navigate(["unauthorised"]);
                }
                return featureAccess.hasAccess;
            }));
    }
}
