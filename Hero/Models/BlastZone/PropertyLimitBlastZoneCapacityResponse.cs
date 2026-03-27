namespace Hero.Models.BlastZone;

public sealed class PropertyLimitBlastZoneCapacityResponse
{
    public bool BlastZoneCheckResult { get; init; }

    public List<PropertyLimit> PropertyLimits { get; init; }
}
