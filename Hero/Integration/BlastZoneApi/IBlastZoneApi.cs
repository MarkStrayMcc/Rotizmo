using Hero.Models;
using Hero.Models.BlastZone;

namespace Hero.Integration.BlastZoneApi;

public interface IBlastZoneApi
{
    Task<List<BlastZoneWithPropertyLimitResult>> GetBatchBlastZoneCapacityCheck(
        BatchBlastZoneCapacityCheck request,
        IReadOnlyList<PropertyLimit> propertyLimits,
        decimal exchangeRate);

    Task<BatchBlastZoneCreateResult> UpdateBatchBlastZoneReservations(BatchBlastZoneCapacityCreate request);

    Task<BatchBlastZoneCreateResult> CreateBatchBlastZoneReservations(BatchBlastZoneCapacityCreate request);

    Task<BlastZoneReservationGetResponse> GetBlastZoneReservations(Guid blastZoneReservationGroupId);

    Task<bool> DeleteBlastZoneReservations(Guid blastZoneReservationGroupId);
}
