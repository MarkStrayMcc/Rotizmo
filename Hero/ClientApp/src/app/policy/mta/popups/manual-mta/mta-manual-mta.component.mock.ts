import { Client, ClientLocation, Country, DBOperation, Policy } from "@app/models";
import { MtaModalModel } from "../mta-modal.model";

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
