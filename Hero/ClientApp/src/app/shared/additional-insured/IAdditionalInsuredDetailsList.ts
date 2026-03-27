import { AdditionalInsured } from "@app/models/auto-generated/AdditionalInsured";
import { Guid } from 'guid-typescript';

export interface IAdditionalInsuredDetailsList {
    id: Guid;
    isVisible: boolean;
    additionalInsured: AdditionalInsured;
}
