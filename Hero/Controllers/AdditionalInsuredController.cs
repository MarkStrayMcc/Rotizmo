using Hero.Integration.CreatePolicyMtaApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [ApiController]
    [Route("api/policy/{policyNumber}/additional-insured")]
    public class AdditionalInsuredController : Controller
    {
        private readonly IAdditionalInsuredClient _additionalInsuredClient;

        public AdditionalInsuredController(IAdditionalInsuredClient additionalInsuredClient)
        {
            _additionalInsuredClient = additionalInsuredClient;
        }

        [HttpPost]
        public async Task<IActionResult> Post(string policyNumber, [FromBody] AdditionalInsuredMtaRequest request)
        {
            try
            {
                var response = await _additionalInsuredClient.PostAsync(policyNumber, request);
                return Ok(response);
            }
            catch (AdditionalInsuredApiException<Integration.CreatePolicyMtaApi.ValidationProblemDetails> exception)
            {
                return BadRequest(exception.Result);
            }
            catch (AdditionalInsuredApiException<Integration.CreatePolicyMtaApi.ProblemDetails> exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, exception.Result);
            }
        }

        [HttpGet]
        public async Task<IActionResult> Get(string policyNumber)
        {
            var additionalInsured = await _additionalInsuredClient.GetAsync(policyNumber);
            return Ok(additionalInsured);
        }
    }
}
