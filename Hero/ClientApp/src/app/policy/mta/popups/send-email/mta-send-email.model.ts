import { Guid } from "guid-typescript";
import { Policy } from "@app/models";

export class MtaSendEmailModel {
    public mtaId: Guid;
    public policy: Policy;
}
