using Hero.Models.BlastZone;

namespace Hero.Integration.BlastZoneApi;

public interface IBlastZoneService
{
    Task<List<BlastZoneWithPropertyLimitResult>> GetBatchBlastZoneCapacitiesWithPropertyLimits(PropertyLimitBlastZoneCapacityRequest request);

    Task<PropertyLimitBlastZoneCapacityResponse> UpdateBatchBlastZoneReservations(PropertyLimitBlastZoneCapacityRequest request);

    Task<PropertyLimitBlastZoneCapacityResponse> CreateBatchBlastZoneReservations(PropertyLimitBlastZoneCapacityRequest request);

    Task<BlastZoneReservationGetResponse> GetBlastZoneReservations(Guid blastZoneReservationGroupId);

    Task<bool> DeleteBlastZoneReservations(Guid blastZoneReservationGroupId);
}
