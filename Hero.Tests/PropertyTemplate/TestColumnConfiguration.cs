using System.Collections.Immutable;
using Hero.Integration.Aspose;
using Hero.Integration.Aspose.MultipleProperties.Terrorism;

namespace Hero.Tests.PropertyTemplate;

internal static class TestColumnConfiguration
{
    internal static IReadOnlyList<ExtractorColumn> Columns { get; } = new List<ExtractorColumn>
    {
        new(TemplateConfiguration.Country, ExtractorDataType.String),
        new(TemplateConfiguration.AddressLine1, ExtractorDataType.String),
        new(TemplateConfiguration.AddressLine2, ExtractorDataType.String),
        new(TemplateConfiguration.TownOrCity, ExtractorDataType.String),
        new(TemplateConfiguration.StateOrProvince, ExtractorDataType.String),
        new(TemplateConfiguration.County, ExtractorDataType.String),
        new(TemplateConfiguration.PostCode, ExtractorDataType.String),
        new(TemplateConfiguration.Latitude, ExtractorDataType.Double),
        new(TemplateConfiguration.Longitude, ExtractorDataType.Double),
        new(TemplateConfiguration.BuildingUse, ExtractorDataType.String),
        new(TemplateConfiguration.PropertyDamageLimit, ExtractorDataType.Integer),
        new(TemplateConfiguration.ContentsDamageLimit, ExtractorDataType.Integer),
        new(TemplateConfiguration.ActualLossSustainedLimit, ExtractorDataType.Integer),
        new(TemplateConfiguration.IncreasedCostOfWorkingLimit, ExtractorDataType.Integer),
        new(TemplateConfiguration.LossOfRentLimit, ExtractorDataType.Integer),
        new(TemplateConfiguration.AlternativeAccommodationLimit, ExtractorDataType.Integer),
    }.ToImmutableList();

    internal static ExtractorColumnConfiguration ColumnConfiguration { get; } = new(Columns, 2);
}
