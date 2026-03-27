import { CountryService } from "./country.service";

describe('CountryService', () => {
    const countryService = new CountryService();

    it('should create service', () => {
        expect(countryService).toBeTruthy();
    });

    it('should return true if a country is part of EEA', () => {
        // Act
        let result = countryService.isEeaCountry("FR");

        // Assert
        expect(result).toBeTruthy();
    });

    it('should return false if a country is NOT part of EEA', () => {
        // Act
        let result = countryService.isEeaCountry("BR");

        // Assert
        expect(result).toBeFalsy();
    });
});
