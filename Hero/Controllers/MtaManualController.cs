using Hero.Integration.CreatePolicyMtaApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [ApiController]
    [Route("api/policy/{policyNumber}/mta/manual")]
    public class MtaManualController : ControllerBase
    {
        private readonly IManualChangeClient _manualChangeClient;

        public MtaManualController(IManualChangeClient manualChangeClient)
        {
            _manualChangeClient = manualChangeClient;
        }

        [HttpPost]
        public async Task<IActionResult> Post(string policyNumber, [FromBody] Integration.CreatePolicyMtaApi.ManualChangeMtaRequest request)
        {
            try
            {
                var response = await _manualChangeClient.PostAsync(policyNumber, request);
                return Ok(response);
            }
            catch (ManualChangeApiException<Integration.CreatePolicyMtaApi.ValidationProblemDetails> exception)
            {
                return BadRequest(exception.Result);
            }
            catch (ManualChangeApiException<Integration.CreatePolicyMtaApi.ProblemDetails> exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, exception.Result);
            }
        }

        [HttpGet("types")]
        public async Task<IActionResult> GetTypes(string policyNumber)
        {
            try
            {
                var response = await _manualChangeClient.GetTypesAsync(policyNumber);
                return Ok(response);
            }
            catch (ManualChangeApiException<Integration.CreatePolicyMtaApi.ProblemDetails> exception)
            {
                if (exception.StatusCode == 404)
                {
                    return NotFound(exception.Result);
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, exception.Result);
                }
            }
        }
    }
}
