using Hero.Integration.CoreApi;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using AdditionalInsuredMtaRequest = Hero.Integration.CoreApi.AdditionalInsuredMtaRequest;
using MtaEmailTemplate = Hero.Integration.CoreApi.MtaEmailTemplate;
using MtaResult = Hero.Integration.CoreApi.MtaResult;
using ProblemDetails = Hero.Integration.CoreApi.ProblemDetails;
using ValidationProblemDetails = Hero.Integration.CoreApi.ValidationProblemDetails;

namespace Hero.Controllers
{
    public class MtaController : Controller
    {
        private readonly ICoreMtaClient _coreMtaClient;

        private static Guid _mostRecentTemplateMtaId = Guid.Empty;
        private static MtaEmailTemplate _mostRecentTemplate;

        public MtaController(ICoreMtaClient coreMtaClient)
        {
            _coreMtaClient = coreMtaClient;
        }

        /// <summary>
        /// Request an policy cancellation
        /// </summary>
        [HttpPost("[controller]/[action]/{policyId}")]
        public async Task<IActionResult> Cancellation([FromBody] AbInitioCancellationRequest cancellationRequest, [FromRoute] string policyId)
        {
            MtaResult mtaResponse;
            try
            {
                mtaResponse = await _coreMtaClient.AbInitioCancellationAsync(policyId, cancellationRequest);
            }
            catch (SwaggerException<ValidationProblemDetails> validationProblemException)
            {
                return BadRequest(validationProblemException.Result);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                var problem = problemDetailsException.Result;
                return new ActionResult<ProblemDetails>(new ProblemDetails
                {
                    Detail = problem.Detail,
                    Status = problem.Status,
                    Title = problem.Title,
                    Type = problem.Type,
                    Instance = problem.Instance
                }).Result;
            }

            return Ok(mtaResponse);
        }

        /// <summary>
        /// Retrieves the list of Manual MTA change types for a policy
        /// </summary>
        [Obsolete("Feature toggled off, moved to MTA service, once soak tested this can be removed")]
        [HttpGet("[controller]/[action]/{policyId}")]
        public async Task<IActionResult> GetManualChangeMtaTypes([FromRoute] string policyId)
        {
            try
            {
                var response = await _coreMtaClient.ManualChangeTypesAsync(policyId);
                return Ok(response);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                if (problemDetailsException.StatusCode == 404)
                {
                    return NotFound(problemDetailsException.Result);
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
                }

            }
        }

        /// <summary>
        /// Get policy cancellation premium
        /// </summary>
        [HttpGet("[controller]/[action]/{policyId}")]
        public async Task<IActionResult> CancellationPremium([FromRoute] string policyId)
        {
            CancellationPremiumResponse cancellationPremiumResponse;
            try
            {
                cancellationPremiumResponse = await _coreMtaClient.CancellationPremiumAsync(policyId);
            }
            catch (SwaggerException<ValidationProblemDetails> validationProblemException)
            {
                return BadRequest(validationProblemException.Result);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                var problem = problemDetailsException.Result;
                return new ActionResult<ProblemDetails>(new ProblemDetails
                {
                    Detail = problem.Detail,
                    Status = problem.Status,
                    Title = problem.Title,
                    Type = problem.Type,
                    Instance = problem.Instance
                }).Result;
            }

            return Ok(cancellationPremiumResponse);
        }

        /// <summary>
        /// Request an address change
        /// </summary>
        [HttpPost("[controller]/[action]/{policyId}")]
        public async Task<IActionResult> AddressChange([FromBody] AddressChangeMtaRequest addressChangeRequest, [FromRoute] string policyId)
        {
            AddressChangeMtaResult mtaResponse;
            try
            {
                mtaResponse = await _coreMtaClient.ChangeAddressAsync(policyId, addressChangeRequest);
            }
            catch (SwaggerException<ValidationProblemDetails> validationProblemException)
            {
                return BadRequest(validationProblemException.Result);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                var problem = problemDetailsException.Result;
                return new ActionResult<ProblemDetails>(new ProblemDetails
                {
                    Detail = problem.Detail,
                    Status = problem.Status,
                    Title = problem.Title,
                    Type = problem.Type,
                    Instance = problem.Instance
                }).Result;
            }

            return Ok(mtaResponse);
        }

        /// <summary>
        /// Request a name change
        /// </summary>
        [HttpPost("[controller]/[action]/{policyId}")]
        public async Task<IActionResult> NameChange([FromBody] NameChangeMtaRequest nameChangeRequest, [FromRoute] string policyId)
        {
            NameChangeMtaResult mtaResponse;
            try
            {
                mtaResponse = await _coreMtaClient.ChangeNameAsync(policyId, nameChangeRequest);
            }
            catch (SwaggerException<ValidationProblemDetails> validationProblemException)
            {
                return BadRequest(validationProblemException.Result);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
            }

            return Ok(mtaResponse);
        }

        /// <summary>
        /// Request a manual change
        /// </summary>
        [Obsolete("Feature toggled off, moved to MTA service, once soak tested this can be removed")]
        [HttpPost("[controller]/[action]/{policyNumber}")]
        public async Task<IActionResult> ManualChangeMta(string policyNumber, [FromBody] Integration.CoreApi.ManualChangeMtaRequest request)
        {
            try
            {
                var response = await _coreMtaClient.RegisterManualChangeAsync(policyNumber, request);
                return Ok(response);
            }
            catch (SwaggerException<ValidationProblemDetails> validationProblemException)
            {
                return BadRequest(validationProblemException.Result);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
            }
        }

        /// <summary>
        /// Request an additional insured
        /// </summary>
        [Obsolete("Feature toggled off, moved to MTA service, once soak tested this can be removed")]
        [HttpPost("[controller]/[action]/{policyId}")]
        public async Task<IActionResult> AdditionalInsured([FromBody] AdditionalInsuredMtaRequest additionalInsuredRequest, [FromRoute] string policyId)
        {
            AdditionalInsuredMtaResult mtaResponse;
            try
            {
                mtaResponse = await _coreMtaClient.AdditionalInsuredAsync(policyId, additionalInsuredRequest);
            }
            catch (SwaggerException<ValidationProblemDetails> validationProblemException)
            {
                return BadRequest(validationProblemException.Result);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
            }

            return Ok(mtaResponse);
        }

        /// <summary>
        /// Request a loss payee
        /// </summary>
        [HttpPost("[controller]/[action]/{policyId}")]
        public async Task<IActionResult> LossPayee([FromBody] LossPayeeMtaRequest lossPayeeRequest, [FromRoute] string policyId)
        {
            LossPayeeMtaResult mtaResponse;
            try
            {
                mtaResponse = await _coreMtaClient.LossPayeeAsync(policyId, lossPayeeRequest);
            }
            catch (SwaggerException<ValidationProblemDetails> validationProblemException)
            {
                return BadRequest(validationProblemException.Result);
            }
            catch (SwaggerException<ProblemDetails> problemDetailsException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
            }

            return Ok(mtaResponse);
        }

        /// <summary>
        /// Request the email template for an MTA
        /// </summary>
        [Obsolete("Feature toggled off, moved to MTA service, once soak tested this can be removed")]
        [HttpGet("[controller]/[action]/{policyNumber}/{mtaId}")]
        public async Task<IActionResult> MtaTemplate(string policyNumber, Guid mtaId)
        {

            if (mtaId == _mostRecentTemplateMtaId)
            {
                return Ok(_mostRecentTemplate);
            }

            _mostRecentTemplate = await _coreMtaClient.EmailTemplateAsync(policyNumber, mtaId);
            _mostRecentTemplateMtaId = mtaId;
            return Ok(_mostRecentTemplate);
        }
    }
}
