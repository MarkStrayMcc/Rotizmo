namespace Hero.Models.BlastZone;

public sealed class BatchBlastZoneCapacityCreate
{
    public Guid? Id { get; init; }

    public Guid ClientId { get; init; }

    public bool IsRenewable { get; init; }

    public string ReservationExpiryDate { get; init; }

    public string CapacityStartDate { get; init; }

    public string CapacityEndDate { get; init; }

    public long FloatingValue { get; init; }

    public long FirstLossLimit { get; init; }

    public List<BlastZoneCapacityRequest> Reservations { get; init; }
}
