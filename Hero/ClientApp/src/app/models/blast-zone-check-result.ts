import { PropertyLimit } from '@app/quote/models/property-limit.model';

export class BlastZoneCheckResult {
    public propertyLimit: PropertyLimit;
    public blastZoneCapacityResult: BlastZoneCapacityResult;
    public formattedAddress: string;
}

export class BlastZoneCapacityResult {
    hasCapacity: boolean;
    availableLimit: number;
}
