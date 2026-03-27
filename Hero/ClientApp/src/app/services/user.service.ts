import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ReplaySubject } from "rxjs";
import { UserSettingKey } from "@app/constants/UserSettingKey";
import {
    CfcContact,
    UnderwriterRole,
    UnderwriterRoleSetting,
} from "@app/models";
import { CookieService } from "ngx-cookie-service";

@Injectable()
export class UserService {
    constructor(private cookieService: CookieService) {}

    private userSubject = new ReplaySubject<CfcContact>(1);
    private user: CfcContact;
    private _countryIsoCode: string;
    public cfcTeamCoverholder = new BehaviorSubject("");

    public get countryIsoCode() {
        return this._countryIsoCode;
    }

    public set countryIsoCode(value: string) {
        this._countryIsoCode = value;
    }

    public addUser(user: CfcContact) {
        this.user = user;
        this.userSubject.next(user);
    }

    public getUser(): CfcContact {
        return this.user;
    }

    public getData(): Observable<CfcContact> {
        return this.userSubject.asObservable();
    }

    public getInitials(): string {
        if (this.cookieService.check("UserInitials")) {
            return this.cookieService.get("UserInitials");
        }

        return null;
    }

    public getUserFirstRole() {
        return this.user.roles && this.user.roles.length > 0
            ? this.user.roles[0].underwriterRoleId
            : -1;
    }

    public isCountryAllowedToBind(countryCode: string): boolean {
        const user = this.user;

        if (!user || !user.roles || user.roles.length === 0) {
            return false;
        }

        if (
            this.hasAnyRoleSettingValue(
                user.roles,
                UserSettingKey.allowedCountry,
                countryCode
            )
        ) {
            return true;
        }

        const deniedCountries = this.getAllSettings(
            user.roles,
            UserSettingKey.deniedCountry
        );
        if (
            deniedCountries.length === 0 ||
            this.hasSettingValue(
                deniedCountries,
                UserSettingKey.deniedCountry,
                countryCode
            )
        ) {
            return false;
        }

        return true;
    }

    public isStateAllowedToBind(stateProvinceCode: string): boolean {
        const user = this.user;

        if (!user || !user.roles || user.roles.length === 0) {
            return false;
        }

        if (
            this.hasAnyRoleSettingValue(
                user.roles,
                UserSettingKey.allowedState,
                stateProvinceCode
            )
        ) {
            return true;
        }

        const deniedStates = this.getAllSettings(
            user.roles,
            UserSettingKey.deniedState
        );
        if (
            deniedStates.length === 0 ||
            this.hasSettingValue(
                deniedStates,
                UserSettingKey.deniedState,
                stateProvinceCode
            )
        ) {
            return false;
        }

        return true;
    }

    public isLocationAllowedToBind(
        countryCode: string,
        stateProvinceCode: string
    ): boolean {
        const isAuthorisedCountry = this.isCountryAllowedToBind(countryCode);
        if (stateProvinceCode) {
            const isAuthorisedState =
                this.isStateAllowedToBind(stateProvinceCode);
            return isAuthorisedCountry && isAuthorisedState;
        }
        return isAuthorisedCountry;
    }

    private hasAnyRoleSettingValue(
        roles: UnderwriterRole[],
        key: string,
        value: string
    ): boolean {
        if (!roles || roles.length === 0) {
            return false;
        }

        for (const role of roles) {
            if (this.hasSettingValue(role.settings, key, value)) {
                return true;
            }
        }
        return false;
    }

    private hasSettingValue(
        settings: UnderwriterRoleSetting[],
        key: string,
        value: string
    ): boolean {
        if (!settings || settings.length === 0) {
            return false;
        }

        for (const setting of settings) {
            if (setting.key === key && setting.value === value) {
                return true;
            }
        }
        return false;
    }

    private getAllSettings(
        roles: UnderwriterRole[],
        key: string
    ): UnderwriterRoleSetting[] {
        const list = new Array<UnderwriterRoleSetting>();

        if (roles && roles.length > 0) {
            for (const role of roles) {
                for (const setting of role.settings) {
                    if (setting.key === key) {
                        list.push(setting);
                    }
                }
            }
        }

        return list;
    }

    public isFeatureAccessible(feature: string): boolean {
        if (
            this.user.accessibleFeatures &&
            this.user.accessibleFeatures.length > 0
        ) {
            for (const accessibleFeature of this.user.accessibleFeatures) {
                if (accessibleFeature === feature) {
                    return true;
                }
            }
        }
        return false;
    }
}
