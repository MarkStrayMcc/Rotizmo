/* tslint:disable:max-classes-per-file */

import { FormControl, FormGroup } from "@angular/forms";
import { SurplusLine } from "../models/SurplusLine";
import { SurplusLinesLicense } from "../models/SurplusLinesLicense";
import { SurplusLinesLicenseService } from "./surplus-lines-license.service";
import { FakeSurplusLinesLicenseHttpService } from "./surplus-lines-license.service.mock";

describe('SurplusLinesLicenseService', () => {
    let surplusLinesLicenseService: SurplusLinesLicenseService;
    let surplusLinesLicenseHttpService = new FakeSurplusLinesLicenseHttpService(null);

    beforeEach(() => {
        surplusLinesLicenseService = new SurplusLinesLicenseService(surplusLinesLicenseHttpService);
    });

    it('should create SurplusLinesLicenseService', () => {
        expect(surplusLinesLicenseService).toBeTruthy();
    });

    it('should get surplus lines by broker team id and state isocode', () => {
        // Arrange
        const spyHttpService = spyOn(surplusLinesLicenseHttpService, "getSurplusLinesByBrokerTeamIdAndStateIsoCode");

        // Act
        surplusLinesLicenseHttpService.getSurplusLinesByBrokerTeamIdAndStateIsoCode(1, "US");

        // Assert
        expect(spyHttpService).toHaveBeenCalledTimes(1);
        expect(spyHttpService).toHaveBeenCalledWith(1, "US");
    });

    it('should save the surplus line and map back to a surplus lines license object', () => {
        // Arrange
        const date = new Date();
        let surplusLinesLicense = new SurplusLinesLicense();
        surplusLinesLicense.id = 24;
        surplusLinesLicense.stateProvinceIsoCode = "CA";
        surplusLinesLicense.brokerName = "Test Surplus Lines License";
        surplusLinesLicense.contactName = "Test Contact";
        surplusLinesLicense.address1 = "Test Address 1";
        surplusLinesLicense.address2 = "Test Address 2";
        surplusLinesLicense.address3 = "Test Address 3";
        surplusLinesLicense.licenseNumber = "12";
        surplusLinesLicense.zipCode = "HA";
        surplusLinesLicense.expiryDate = date;
        surplusLinesLicense.surplusLinesLicenseUid = "H3H3";
        surplusLinesLicense.licenseStateIsoCode = "CA";

        const form = new FormGroup({
            name: new FormControl(surplusLinesLicense.contactName),
            company: new FormControl(surplusLinesLicense.brokerName),
            licenceState: new FormControl(surplusLinesLicense.licenseStateIsoCode),
            licence: new FormControl(surplusLinesLicense.licenseNumber),
            expiry: new FormControl(surplusLinesLicense.expiryDate),
            address1: new FormControl(surplusLinesLicense.address1),
            address2: new FormControl(surplusLinesLicense.address2),
            address3: new FormControl(surplusLinesLicense.address3),
            state: new FormControl(surplusLinesLicense.stateProvinceIsoCode),
            zip: new FormControl(surplusLinesLicense.zipCode)
        });

        spyOn<any>(surplusLinesLicenseService, "mapSurplusLineResponse").and.returnValue(surplusLinesLicense);

        // Act
        const saveResponse = surplusLinesLicenseService.saveSurplusLinesLicense(form);

        // Assert
        saveResponse.subscribe(surplusLineResponse => {
            expect(surplusLineResponse).toEqual(surplusLinesLicense);
        });
    });

    it('should map surplus lines license to suplus line', () => {
        // Arrange
        const date = new Date();

        let surplusLinesLicense = new SurplusLinesLicense();
        surplusLinesLicense.id = 24;
        surplusLinesLicense.stateProvinceIsoCode = "CA";
        surplusLinesLicense.brokerName = "Test Surplus Lines License";
        surplusLinesLicense.contactName = "Test Contact";
        surplusLinesLicense.address1 = "Test Address 1";
        surplusLinesLicense.address2 = "Test Address 2";
        surplusLinesLicense.address3 = "Test Address 3";
        surplusLinesLicense.licenseNumber = "12";
        surplusLinesLicense.zipCode = "HA";
        surplusLinesLicense.expiryDate = date;
        surplusLinesLicense.surplusLinesLicenseUid = "H3H3";
        surplusLinesLicense.licenseStateIsoCode = "CA";

        let surplusLine = new SurplusLine();
        surplusLine.id = 24;
        surplusLine.stateProvinceCode = "CA";
        surplusLine.brokerName = "Test Surplus Lines License";
        surplusLine.contactName = "Test Contact";
        surplusLine.address1 = "Test Address 1";
        surplusLine.address2 = "Test Address 2";
        surplusLine.address3 = "Test Address 3";
        surplusLine.licenseNumber = "12";
        surplusLine.zip = "HA";
        surplusLine.expiryDate = date;
        surplusLine.surplusLineBrokerUid = "H3H3";

        // Act
        const mappedSurplusLine = surplusLinesLicenseService.mapSurplusLinesLicenseToSuplusLine(surplusLinesLicense);

        // Assert
        expect(mappedSurplusLine).toEqual(surplusLine);
    });
});
