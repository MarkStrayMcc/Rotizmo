import { Client, ClientLocation, Country, DBOperation, Policy } from "@app/models";
import { MtaModalModel } from "../mta-modal.model";
import { LossPayee } from "@app/models/auto-generated/LossPayee";
import { LossPayeeMtaRequest } from "@app/models/auto-generated/LossPayeeMtaRequest";
import { InterestOfEntity } from "@app/models/InterestOfEntity";

export const mockLossPayee: LossPayee = {
    entityName: "testName",
    interestOfEntity: InterestOfEntity.Landlord,
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

export const mockLossPayeeApiResponse = {
    EntityName: "testName",
    InterestOfEntity: InterestOfEntity.Landlord,
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

export const mockLossPayeeRequest: LossPayeeMtaRequest = {
    cfcUserId: "1dc86388-2e78-4caf-ab73-be46d9ae6749",
    effectiveDate: "2020-06-08T09:57:36.242Z",
    lossPayees: [mockLossPayee ]
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
    modalTitle: "MTA Loss Payee",
    modalBtnTitle: "Salvar",
    defaultLocation: new Country(),
    locationId: 1,
    policy: mockPolicy
};
