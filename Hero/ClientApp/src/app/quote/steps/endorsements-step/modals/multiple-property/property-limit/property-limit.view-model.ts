import { Guid } from "guid-typescript";

export interface PropertyLimitViewModel {
    id: Guid;
    isNew: boolean;
    isEditing: boolean;
}
