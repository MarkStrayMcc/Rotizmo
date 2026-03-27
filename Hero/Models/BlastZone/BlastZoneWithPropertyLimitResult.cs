namespace Hero.Models.BlastZone;

public sealed class BlastZoneWithPropertyLimitResult
{
    public PropertyLimit PropertyLimit { get; init; }

    public BlastZoneReservation BlastZoneCapacityResult { get; init; }

    public string FormattedAddress { get; init; }

    public decimal ConversionRate { get; init; }
}
