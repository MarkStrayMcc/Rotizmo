import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class CountryService {
    public static eeaCountryIsoCodes: Array<string> = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IS", "IT", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK"];

    public isEeaCountry(countryIsoCode: string): boolean {
        return CountryService.eeaCountryIsoCodes.includes(countryIsoCode);
    }
}
