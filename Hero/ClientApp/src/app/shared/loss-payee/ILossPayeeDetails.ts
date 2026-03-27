import { LossPayee } from "@app/models/auto-generated/LossPayee";
import { Guid } from "guid-typescript";

export interface ILossPayeeDetails {
    id: Guid;
    isVisible: boolean;
    lossPayee: LossPayee;
}
