import { PropertyLimit } from '@app/quote/models/property-limit.model';

export class PropertyLimitBlastZoneCapacityResponse {
    public propertyLimits: PropertyLimit[];
    public blastZoneCheckResult: boolean;
}
