import { LocationOutput } from "./LocationOutput";
import { PricingInformation } from "./PricingInformation";

export class PricingResult {
    public pricingInformations: PricingInformation[];
    public locationOutputs: LocationOutput[];
}