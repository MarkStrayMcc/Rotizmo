
import { InsuranceBasis, OriginSystem } from "@app/enums";

export class AvailableEndorsementsRequest {
    public productCode: string;
    public countryCode: string;
    public stateCode: string;
    public brokerTeamId: number;
    public brokerId: number;
    public brokerGroupId: number;
    public businessLineCodes: string[];
    public insuringClauseCodes: string[];
    public insuringClauseSectionCodes: string[];
    public activityCodes: string[];
    public languageCode: string;
    public wordingVersionId: number;
    public riskQuestionAnswers: {};
    public documentBasisType: InsuranceBasis.Primary;
    public originSystem: OriginSystem;
    public coverHolder?: string;
}
