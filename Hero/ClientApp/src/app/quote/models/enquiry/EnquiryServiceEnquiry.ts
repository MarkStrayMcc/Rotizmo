import { Guid } from "guid-typescript";

export class EnquiryServiceEnquiry {
    public id: Guid;
    public enquiryReference: number;
    public riskData: object;
    public metaData: object;
    public expiringPolicyNumber: string;
}
