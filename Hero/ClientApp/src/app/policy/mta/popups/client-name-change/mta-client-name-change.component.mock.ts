import { Client, ClientLocation, Country, DBOperation, Policy } from "@app/models";
import { NameChangeMtaRequest } from "@app/policy/models/NameChangeMtaRequest";
import { MtaModalModel } from "../mta-modal.model";

export const mockNameChangeRequest: NameChangeMtaRequest = {
    cfcUserId: "1dc86388-2e78-4caf-ab73-be46d9ae6749",
    policyNumber: "ESI0318041410",
    changeType: "PolicyReissue",
    effectiveDate: "2020-06-08T09:57:36.242Z",
    clientName: "Rodrigo Fante test",
};

export const mockMtaModalModel: MtaModalModel = {
    client: new Client(),
    dbOperation: DBOperation.create,
    editLocation: new ClientLocation(),
    modalTitle: "MTA Name Change",
    modalBtnTitle: "Salvar",
    defaultLocation: new Country(),
    locationId: 1,
    policy: new Policy()
};
