using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.DDPTApi.Interfaces;
using Hero.Models;

namespace Hero.Controllers
{
    public class EndorsementController: Controller
    {
        private readonly IEndorsementApi _endorsementApi;

        public EndorsementController(IEndorsementApi endorsementApi)
        {
            this._endorsementApi = endorsementApi;
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> GetAvailableEndorsements([FromBody]AvailableEndorsementsRequest request)
        {
            var response = await _endorsementApi.GetAvailable(request);
            return Ok(response.Endorsements);
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> GetAutoAttachingEndorsements([FromBody]AutoAttachingEndorsementsRequest request)
        {
            var response = await _endorsementApi.GetAutoAttaching(request);
            return Ok(response.Endorsements);
        }
    }
}
