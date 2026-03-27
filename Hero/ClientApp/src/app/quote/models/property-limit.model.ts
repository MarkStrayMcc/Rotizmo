import * as Models from "@app/models/auto-generated";
import { QuoteLocationPremium } from "../steps/endorsements-step/modals/multiple-property/property-limit/quote-location-premium.model";

export class PropertyLimit {
	public propertyLimitId?: number;
	public propertyDamageLimit?: number;
	public contentsDamageLimit?: number;
	public stockDamageLimit?: number;
	public actualLossSustainedLimit?: number;
	public additionalIncreasedCostOfWorkingLimit?: number;
	public grossRentalLimit?: number;
	public increasedCostOfWorkingLimit?: number;
	public lossOfRentLimit?: number;
	public alternativeAccommodationLimit?: number;

	public isPropertyDamageLimitSelected?: boolean;
	public isContentsDamageLimitSelected?: boolean;
	public isStockDamageLimitSelected?: boolean;
	public isActualLossSustainedLimitSelected?: boolean;
	public isAdditionalIncreasedCostOfWorkingLimitSelected?: boolean;
	public isGrossRentalLimitSelected?: boolean;

    public insuredAddress: Models.ClientLocation;
    public ratingReference?: string;
	public formattedAddress?: string;
	public priorCarrierApprovalRequired?: boolean;
	public carrierApprovedAt?: string;
	public carrierApprovedBy?: string;
	public rowNumber?: number;
	public totalInsuredValue: number;
	public quoteLocationPremiums?: QuoteLocationPremium[];
    public blastZoneReservationId?:string;
}

