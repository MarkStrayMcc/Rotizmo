using System.Threading.Tasks;
using Hero.Integration.CoreApi.SurplusLines;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class SurplusLinesLicenseController : Controller
    {
        private readonly ISurplusLinesLicenseClient _surplusLinesLicenseClient;

        public SurplusLinesLicenseController(ISurplusLinesLicenseClient surplusLinesLicenseClient)
        {
            _surplusLinesLicenseClient = surplusLinesLicenseClient;
        }

        [HttpGet("surplus-lines")]
        public async Task<IActionResult> GetSurplusLines([FromQuery] string licenseStateIsoCode, [FromQuery] string brokerContactEmail)
        {
            SurplusLinesLicenseResponse surplusLinesLicenseResponse;
            try
            {
                surplusLinesLicenseResponse = await _surplusLinesLicenseClient.SurplusLinesLicense_GetSurplusLinesAsync(licenseStateIsoCode, brokerContactEmail);
            }
            catch (Hero.Integration.CoreApi.SurplusLines.SwaggerException<Hero.Integration.CoreApi.SurplusLines.ProblemDetails> problemDetailsException)
            {
                if (problemDetailsException.StatusCode == 404)
                {
                    return NotFound(problemDetailsException.Result);
                }
                else if (problemDetailsException.StatusCode == 400)
                {
                    return BadRequest(problemDetailsException.Result);
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
                }
            }
            return Ok(surplusLinesLicenseResponse);
        }

        [HttpPost("surplus-lines")]
        public async Task<IActionResult> SaveSurplusLine([FromBody] SurplusLinesLicenseRequest surplusLinesLicenseRequest)
        {
            try
            {
                var saveSurplusLinesResponse = await _surplusLinesLicenseClient.SurplusLinesLicense_CreateSurplusLinesAsync(surplusLinesLicenseRequest);
                return Ok(saveSurplusLinesResponse);
            }
            catch (Hero.Integration.CoreApi.SurplusLines.SwaggerException<Hero.Integration.CoreApi.SurplusLines.ProblemDetails> problemDetailsException)
            {
                if (problemDetailsException.StatusCode == 404)
                {
                    return NotFound(problemDetailsException.Result);
                }
                else if (problemDetailsException.StatusCode == 400)
                {
                    return BadRequest(problemDetailsException.Result);
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
                }
            }
            
        }
    }
}