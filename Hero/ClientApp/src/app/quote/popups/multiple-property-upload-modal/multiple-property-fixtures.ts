import { ClientLocation, Country } from '@app/models';
import { BlastZoneCapacityResult, BlastZoneCheckResult } from '@app/models/blast-zone-check-result';
import { InvalidBlastZoneChecks } from '@app/models/invalid-blast-zone-checks';
import { TemplateUploadResult } from '@app/models/template-upload-result';

function createUkAddress(): ClientLocation {
    const address = new ClientLocation();
    address.country = new Country();
    address.country.isoCode = "GB";
    address.country.countryId = 1;

    return address;
}

const mockTemplateUploadInvalidResult: TemplateUploadResult = {
    propertyLimits: [
        {
            insuredAddress: createUkAddress(),
            totalInsuredValue: 1000,
        }
    ],
    validationResults: [
        {
            validationAddress: "123 Fake Street",
            locationIdentifier: "Row 1",
            isValid: false,
            errors: [
                {
                    errorCode: "123",
                    errorMessage: "Address line 1 is required",
                }
            ],
        }
    ],
}

const mockTemplateUploadValidResult: TemplateUploadResult = {
    propertyLimits: [
        {
            insuredAddress: createUkAddress(),
            totalInsuredValue: 1000,
        }
    ],
    validationResults: [],
}

const mockTemplateUploadValidationFailedForTemplate: TemplateUploadResult = {
    propertyLimits: [],
    validationResults: [],
    templateValidationError: "test"
}

const blastZoneCapacityResult: BlastZoneCapacityResult = {
    hasCapacity: true,
    availableLimit: 10000000
}

const blastZoneCheckResult: BlastZoneCheckResult = {
    blastZoneCapacityResult: blastZoneCapacityResult,
    formattedAddress: "123 Fake Street",
    propertyLimit: {
        insuredAddress: createUkAddress(),
        totalInsuredValue: 1000
    }
};

const mockInvalidBlastZoneChecks : InvalidBlastZoneChecks[] = [
    {
        blastZoneCheckResult: blastZoneCheckResult,
        isPropertyLimitVisible: true
    }
];

export class MultiplePropertyFixtures {
    public static createUkAddress(): ClientLocation {
        return createUkAddress();
    }

    public static getTemplateUploadInvalidResult(): TemplateUploadResult {
        return mockTemplateUploadInvalidResult;
    }

    public static getBlastZoneCheckResult(): BlastZoneCheckResult {
        return blastZoneCheckResult;
    }

    public static getInvalidBlastZoneChecks(): InvalidBlastZoneChecks[] {
        return mockInvalidBlastZoneChecks;
    }

    public static getTemplateUploadValidResult(): TemplateUploadResult {
        return mockTemplateUploadValidResult;
    }

    public static getTemplateUploadValidationFailedForTemplate(): TemplateUploadResult {
        return mockTemplateUploadValidationFailedForTemplate;
    }

}
