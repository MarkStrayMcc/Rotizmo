import { AdditionalInsured } from "@app/models/auto-generated/AdditionalInsured";

export class AdditionalInsuredMtaRequest { 
    public effectiveDate: string;
    public additionalInsureds: AdditionalInsured[];
    public cfcUserId: string;
}
