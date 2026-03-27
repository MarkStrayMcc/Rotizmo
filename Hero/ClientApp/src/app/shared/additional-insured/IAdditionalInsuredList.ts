import { IAdditionalInsuredDetailsList } from "@app/shared/additional-insured/IAdditionalInsuredDetailsList";

export interface IAdditionalInsuredList {
    effectiveDate: string;
    additionalInsureds: IAdditionalInsuredDetailsList[];
}
