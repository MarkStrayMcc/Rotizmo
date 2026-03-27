using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [Route("[controller]/[action]")]
    public class FeaturesController : Controller
    {
        private readonly IFeaturesApi _featuresApi;

        public FeaturesController(IFeaturesApi featuresApi)
        {
            _featuresApi = featuresApi;
        }

        [HttpGet]
        public async Task<IActionResult> IsFeatureActive([FromQuery] string featureName, [FromQuery] int brokerContactId)
        {
            var userIdentityName = HttpContext.User.Identity.Name;
            try
            {
                return Ok(await _featuresApi.IsFeatureActive(featureName, userIdentityName, brokerContactId));
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }
    }
}
