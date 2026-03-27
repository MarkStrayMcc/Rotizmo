using Hero.Integration.BlastZoneApi;
using Hero.Models.BlastZone;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers;

[Route("blast-zone")]
public sealed class BlastZoneController : ControllerBase
{
    private readonly IBlastZoneService _blastZoneService;

    public BlastZoneController(IBlastZoneService blastZoneService)
    {
        _blastZoneService = blastZoneService;
    }

    [HttpPost("capacity-result")]
    public async Task<IActionResult> GetBlastZoneCapacityResult([FromBody] PropertyLimitBlastZoneCapacityRequest request)
    {
        return Ok(await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(request));
    }

    [HttpPost("create-reservation")]
    public async Task<IActionResult> CreateBlastZoneReservation([FromBody] PropertyLimitBlastZoneCapacityRequest request)
    {
        var blastZoneCapacities = await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(request);

        if (blastZoneCapacities.Count > 0 && blastZoneCapacities.All(x => x.BlastZoneCapacityResult.HasCapacity))
        {
            return Ok(await _blastZoneService.CreateBatchBlastZoneReservations(request));
        }

        return Ok(new PropertyLimitBlastZoneCapacityResponse
        {
            BlastZoneCheckResult = false,
            PropertyLimits = request.PropertyLimits
        });
    }

    [HttpPut("update-reservation")]
    public async Task<IActionResult> UpdateBlastZoneReservation([FromBody] PropertyLimitBlastZoneCapacityRequest request)
    {
        return Ok(await _blastZoneService.UpdateBatchBlastZoneReservations(request));
    }

    [HttpGet("get-blast-zone-reservation/{blastZoneReservationGroupId}")]
    public async Task<IActionResult> GetBlastZoneReservation(Guid blastZoneReservationGroupId)
    {
        return Ok(await _blastZoneService.GetBlastZoneReservations(blastZoneReservationGroupId));
    }

    [HttpDelete("delete-blast-zone-reservation/{blastZoneReservationGroupId}")]
    public async Task<IActionResult> DeleteBlastZoneReservations(Guid blastZoneReservationGroupId)
    {
        return Ok(await _blastZoneService.DeleteBlastZoneReservations(blastZoneReservationGroupId));
    }
}
