import { Binder } from "@app/quote/models/pricing/Binder";
import { PricingInformation } from "@app/quote/models/pricing/PricingInformation";
import { LocationOutput } from "./LocationOutput";

export class BinderRatingEngineOutput {  
    public binder: Binder;
    public internalError: string;
    public ratingEngineMessage: string;
    public ratingEngineMessageType: string;
    public pricingInformation: PricingInformation[]; 
    public locationOutputs: LocationOutput[];
}