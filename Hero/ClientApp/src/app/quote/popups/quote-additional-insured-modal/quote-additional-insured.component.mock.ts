import { AdditionalInsured as AdditionalInsureds } from "@app/models/auto-generated/AdditionalInsured";

export const mockAdditionalInsured: AdditionalInsureds = {
    entityName: "testName",
    contactEmail: "",
    addressLine1: "line1",
    addressLine2: "",
    addressLine3: "",
    city: "city",
    postcode: "",
    county: "",
    stateProvinceIsoCode: "",
    countryIsoCode: ""
}

export const mockAdditionalInsuredConfigBuilder = {
    setConfig: jasmine.createSpy()
};


