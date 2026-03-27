import { Guid } from "guid-typescript";

export class Enquiry {
    public id: Guid;
    public enquiryReference: number;
    public nerdVersion: number;
    public riskData: object;
    public metaData: object;
    public expiringPolicyNumber: string;
}
