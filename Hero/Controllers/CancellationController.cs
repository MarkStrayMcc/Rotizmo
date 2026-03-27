using Hero.Integration.CreatePolicyMtaApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [ApiController]
    [Route("api/policy/{policyNumber}/cancellation")]
    public class CancellationController : Controller
    {
        private readonly ICancellationClient _cancellationClient;

        public CancellationController(ICancellationClient cancellationClient)
        {
            _cancellationClient = cancellationClient;
        }

        [HttpPost]
        public async Task<IActionResult> Post(string policyNumber, [FromBody]CancellationRequest request)
        {
            try
            {
                var response = await _cancellationClient.PostAsync(policyNumber, request);
                return Ok(response);
            }
            catch (CancellationApiException<Integration.CreatePolicyMtaApi.ValidationProblemDetails2> exception)
            {
                return BadRequest(exception.Result);
            }
            catch (CancellationApiException<Integration.CreatePolicyMtaApi.ProblemDetails> exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, exception.Result);
            }
        }

        [HttpGet("premium")]
        public async Task<IActionResult> Get(string policyNumber, [FromQuery] DateTime effectiveDate)
        {
            try
            {
                var response = await _cancellationClient.GetAsync(policyNumber, effectiveDate);
                return Ok(response);
            }
            catch (CancellationApiException<Integration.CreatePolicyMtaApi.ProblemDetails> exception)
            {
                if (exception.StatusCode == 404)
                {
                    return NotFound(exception.Result);
                }

                return StatusCode(StatusCodes.Status500InternalServerError, exception);
            }
        }
    }
}
