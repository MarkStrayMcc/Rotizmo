import { PropertyLimit } from '@app/quote/models/property-limit.model';

export class PropertyLimitBlastZoneCapacityRequest {
    public propertyLimits: PropertyLimit[];
    public inceptionDate: Date;
    public expiryDate: Date;
    public reservationExpiryDate?: Date;
    public firstLossLimitValue?: number;
    public floatingValue?: number;
    public clientId?: string;
    public isRenewable?: boolean;
    public originalGroupId?: string;
    public binderSectionId?: number;
    public quoteCurrencyIsoCode?: string;
}
