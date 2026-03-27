import { Client, ClientLocation, Country, DBOperation, Policy } from "@app/models";
import { MtaModalModel } from "../mta-modal.model";
import { AdditionalInsuredMtaRequest } from "@app/policy/models/AdditionalInsuredMtaRequest";
import { AdditionalInsured } from "@app/models/auto-generated/AdditionalInsured";

export const mockAdditionalInsured: AdditionalInsured = {
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

export const mockAdditionalInsuredApiResponse = {
    EntityName: "testName",
    ContactEmail: "",
    AddressLine1: "line1",
    AddressLine2: "",
    AddressLine3: "",
    City: "city",
    Postcode: "",
    County: "",
    StateProvinceIsoCode: "",
    CountryIsoCode: ""
}

export const mockAdditionalInsuredRequest: AdditionalInsuredMtaRequest = {
    cfcUserId: "1dc86388-2e78-4caf-ab73-be46d9ae6749",
    effectiveDate: "2020-06-08T09:57:36.242Z",
    additionalInsureds: [ mockAdditionalInsured ]
};

export const mockPolicy: Policy = {
    reference: "test",
    companyName: "companyName",
    brokerName: "brokerName",
    productName: "CPM",
    nerdVersion: 3,
    policyType: "",
    expirationDate: "2020-06-08T09:57:36.242Z",
    companyGuid: "",
    policyUid: "",
    inceptionDate: "2020-06-08T09:57:36.242Z"
}

export const mockMtaModalModel: MtaModalModel = {
    client: new Client(),
    dbOperation: DBOperation.create,
    editLocation: new ClientLocation(),
    modalTitle: "MTA Additional Insured",
    modalBtnTitle: "Salvar",
    defaultLocation: new Country(),
    locationId: 1,
    policy: mockPolicy
};

