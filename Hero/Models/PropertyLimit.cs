using System;
using WebApiDto.Attributes;

namespace Hero.Models;

[ExportToTypeScript]
public class PropertyLimit : WebApiDto.Dto.PropertyLimit
{
    public PropertyLimit() 
    {
        RatingReference = Guid.NewGuid();
    }

    public int TotalInsuredValue =>
        ContentsDamageLimit +
        PropertyDamageLimit +
        ActualLossSustainedLimit.GetValueOrDefault() +
        IncreasedCostOfWorkingLimit.GetValueOrDefault() +
        LossOfRentLimit.GetValueOrDefault() +
        AlternativeAccommodationLimit.GetValueOrDefault();
    public int RowNumber { get; set; }
    public string FormattedAddress { get; set; }
}
