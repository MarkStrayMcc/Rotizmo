import { LossPayee } from "@app/models/auto-generated/LossPayee";

export class LossPayeeMtaRequest { 
    public effectiveDate: string;
    public lossPayees: LossPayee[];
    public cfcUserId: string;
}
