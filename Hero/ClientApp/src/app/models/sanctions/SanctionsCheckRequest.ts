import { SanctionStage } from "@app/enums/SanctionStage";

export interface SanctionsCheckRequest {
    clientName: string;
    clientUid: string;
    clientId: number;
    countryIsoCode: string;
    stage: SanctionStage;
    isSendEmail: boolean;
    onGoingScreening?: boolean;
}
