namespace Hero.Models.BlastZone;

public sealed class PropertyLimitBlastZoneCapacityRequest
{
    public DateTime InceptionDate { get; init; }

    public DateTime ExpiryDate { get; init; }

    public DateTime? ReservationExpiryDate { get; init; }

    public List<PropertyLimit> PropertyLimits { get; init; }

    public long FloatingValue { get; init; }

    public long? FirstLossLimitValue { get; init; }

    public Guid? ClientId { get; init; }

    public bool IsRenewable { get; init; }

    public Guid? OriginalGroupId { get; init; }

    public int BinderSectionId { get; init; }

    public string QuoteCurrencyIsoCode { get; init; }
}
