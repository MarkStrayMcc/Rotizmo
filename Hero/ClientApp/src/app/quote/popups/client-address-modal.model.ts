import { DBOperation } from "@app/enums/DBOperations";
import { Client, ClientLocation, Country } from "@app/models";

export class AddressClientLocationModal {
    public client: Client;
    public dbOperation: DBOperation;
    public editLocation: ClientLocation;
    public modalTitle: string;
    public modalBtnTitle: string;
    public defaultLocation: Country;
    public locationId: number;
}

type Action = () => void;
