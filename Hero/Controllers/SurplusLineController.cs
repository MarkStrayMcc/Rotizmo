using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    [Route("[controller]")]
    public class SurplusLineController : Controller
    {
        private readonly ISurplusLineApi _surplusLineApi;

        public SurplusLineController(ISurplusLineApi surplusLineApi)
        {
            _surplusLineApi = surplusLineApi;
        }

        [HttpGet]
        public async Task<IActionResult> GetSurplusLines([FromQuery]string state, [FromQuery]int brokerTeamId)
        {
            var surplusLines = await _surplusLineApi.GetSurplusLines(state, brokerTeamId);

            return Ok(surplusLines);
        }

        /// <summary>
        /// Resolve a valid Surplus Line broker for an expiring policy number.
        /// Just returns null when no match is found (404 is not treated as an error).
        /// </summary>
        [HttpGet("resolve-for-renewal")]
        public async Task<IActionResult> ResolveForRenewal(
            [FromQuery] string expiringPolicyNumber)
        {
            if (string.IsNullOrWhiteSpace(expiringPolicyNumber))
                return BadRequest("expiringPolicyNumber is required.");

            var surplusLine = await _surplusLineApi.ResolveForExpiringPolicy(expiringPolicyNumber);

            // surplusLine is null when:
            //  - policy not found
            //  - Core API returned 404
            //  - no valid alternative matched
            return Ok(surplusLine);
        }
    }
}