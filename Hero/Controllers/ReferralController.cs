using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WebApiDto.Dto.UnderwritingReferral;

namespace Hero.Controllers
{
    public class ReferralController : Controller
    {
        private readonly IReferralApi _referralApi;

        public ReferralController(IReferralApi referralApi)
        {
            _referralApi = referralApi;
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> Refer([FromBody] ReferralRequest referral)
        {
            try
            {
                await _referralApi.ReferAsync(referral);
                return Ok(true);
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
        }
    }
}
