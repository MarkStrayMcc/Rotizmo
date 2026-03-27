export class PropertyLimitConfig {
    static readonly LimitMapper = new Map<string, string[]>([
        ["TRPDPDL2", ["propertyDamageLimit", "contentsDamageLimit"]],
        ["TRBIALL1", ["actualLossSustainedLimit", "increasedCostOfWorkingLimit"]],
        ["TRBIGRL1", ["lossOfRentLimit", "alternativeAccommodationLimit"]],
    ]);

    static readonly TotalInsuredLimitCode:string = "TRPDPDL1";
}
