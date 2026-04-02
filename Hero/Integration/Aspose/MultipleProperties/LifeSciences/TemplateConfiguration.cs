namespace Hero.Integration.Aspose.MultipleProperties.LifeSciences;

internal static class TemplateConfiguration
{
    private const int InitialRowIndex = 2;

    internal static ExtractorColumnConfiguration GetFloatingValuesColumnConfiguration()
    {
        var columns = new List<ExtractorColumn>
        {
            new(ContentsDamageLimit, ExtractorDataType.Integer),
            new(ActualLossSustainedLimit, ExtractorDataType.Integer),
            new(IncreasedCostOfWorkingLimit, ExtractorDataType.Integer),
            new(LossOfRentLimit, ExtractorDataType.Integer),
            new(AlternativeAccommodationLimit, ExtractorDataType.Integer)
        };

        return new ExtractorColumnConfiguration(columns, InitialRowIndex);
    }

    internal static ExtractorColumnConfiguration GetFirstLossLimitColumnConfiguration()
    {
        var columns = new List<ExtractorColumn>
        {
            new(FirstLossLimit, ExtractorDataType.Integer)
        };

        var firstLossLimitInitialRowIndex = 1;
        return new ExtractorColumnConfiguration(columns, firstLossLimitInitialRowIndex);
    }

    public const string Country = "Country";
    public const string AddressLine1 = "AddressLine1";
    public const string AddressLine2 = "AddressLine2";
    public const string TownOrCity = "TownOrCity";
    public const string StateOrProvince = "StateOrProvince";
    public const string County = "County";
    public const string PostCode = "PostCode";
    public const string Latitude = "Latitude";
    public const string Longitude = "Longitude";
    public const string BuildingUse = "BuildingUse";
    public const string PropertyDamageLimit = "PropertyDamageLimit";
    public const string ContentsDamageLimit = "ContentsDamageLimit";
    public const string ActualLossSustainedLimit = "ActualLossSustainedLimit";
    public const string IncreasedCostOfWorkingLimit = "IncreasedCostOfWorkingLimit";
    public const string LossOfRentLimit = "LossOfRentLimit";
    public const string AlternativeAccommodationLimit = "AlternativeAccommodationLimit";
    public const string FirstLossLimit = "FirstLossLimit";
}
