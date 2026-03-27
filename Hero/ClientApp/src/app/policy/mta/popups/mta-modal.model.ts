import { DBOperation } from "@app/enums/DBOperations";
import { Client, ClientLocation, Country, Policy } from "@app/models";

export class MtaModalModel {
    public client: Client;
    public dbOperation: DBOperation;
    public editLocation: ClientLocation;
    public modalTitle: string;
    public modalBtnTitle: string;
    public defaultLocation: Country;
    public locationId: number;
    public policy: Policy;
}
