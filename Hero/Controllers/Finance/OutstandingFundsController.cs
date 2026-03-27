using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using Hero.Integration.CoreApi.Finance.OutstandingFunds;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using ClientOutstandingFundsTransferRequest = Hero.Integration.CoreApi.Finance.OutstandingFunds.OutstandingFundsTransferRequest;
using OutstandingFundContributionsResponse = Hero.Models.OutstandingFundContributionsResponse;
using OutstandingFundsResponse = Hero.Models.OutstandingFundsResponse;
using OutstandingFundsTransferRequest = Hero.Models.OutstandingFundsTransferRequest;
using OutstandingFundsTransferResponse = Hero.Models.OutstandingFundsTransferResponse;
using ProblemDetails = Hero.Models.ProblemDetails;
using CoreApiProblemDetails = Hero.Integration.CoreApi.Finance.OutstandingFunds.ProblemDetails;

namespace Hero.Controllers.Finance
{
    [Route("finance/[action]")]
    public class OutstandingFundsController : Controller
    {
        private readonly IOutstandingFundsClient _outstandingFundsClient;
        private readonly IMapper _mapper;

        public OutstandingFundsController(IOutstandingFundsClient outstandingFundsClient, IMapper mapper)
        {
            _outstandingFundsClient = outstandingFundsClient;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> OutstandingFunds([FromQuery] string bankAccount, [FromQuery] string currencyIsoCode, [FromQuery] string ledgerReference)
        {
            try
            {
                return Ok(_mapper.Map<OutstandingFundsResponse>(await _outstandingFundsClient.GetOutstandingFundsAsync(bankAccount, currencyIsoCode, ledgerReference)));
            }
            catch (SwaggerException problemDetailsException)
            {
                return HandleSwaggerException(problemDetailsException);
            }
        }

        [HttpGet("{outstandingFundId}")]
        public async Task<IActionResult> OutstandingFundContributions([FromRoute] long outstandingFundId)
        {
            try
            {
                return Ok(_mapper.Map<OutstandingFundContributionsResponse>(await _outstandingFundsClient.GetOutstandingFundContributionsAsync(outstandingFundId)));
            }
            catch (SwaggerException problemDetailsException)
            {
                return HandleSwaggerException(problemDetailsException);
            }
        }

        [HttpPost]
        public async Task<IActionResult> TransferToOffice([FromBody] OutstandingFundsTransferRequest outstandingFundsTransferRequest)
        {
            OutstandingFundsTransferResponse outstandingFundsTransferResponse;
            try
            {
                var clientOutstandingFundsTransferRequest = _mapper.Map<ClientOutstandingFundsTransferRequest>(outstandingFundsTransferRequest);
                outstandingFundsTransferResponse = _mapper.Map<OutstandingFundsTransferResponse>(await _outstandingFundsClient.TransferOutstandingFundsAsync(clientOutstandingFundsTransferRequest));
            }
            catch (SwaggerException<MultipleOperationsResultProblemDetails> problemDetailsException)
            {
                return new ObjectResult(_mapper.Map<Models.MultipleOperationsResultProblemDetails>(problemDetailsException.Result));
            }
            catch (SwaggerException problemDetailsException)
            {
                return HandleSwaggerException(problemDetailsException);
            }

            return Ok(outstandingFundsTransferResponse);
        }

        [HttpDelete("{outstandingFundId}")]
        public async Task<IActionResult> OutstandingFunds(int outstandingFundId)
        {
            try
            {
                var cfcContactIdFromHeader = GetCfcContactIdFromHeaders();
                await _outstandingFundsClient.DeleteOutstandingFundAsync(outstandingFundId, cfcContactIdFromHeader.ToString());
                return Ok();
            }
            catch (ArgumentException e)
            {
                return HandleSwaggerException(e);
            }
            catch (FormatException e)
            {
                return HandleSwaggerException(e);
            }
            catch (OverflowException e)
            {
                return HandleSwaggerException(e);
            }
            catch (SwaggerException<CoreApiProblemDetails> problemDetailsSwaggerException)
            {
                return HandleProblemDetailsSwaggerException(problemDetailsSwaggerException);
            }
            catch (SwaggerException swaggerException)
            {
                return HandleSwaggerException(swaggerException);
            }
        }

        /// <summary>
        /// OutstandingFundsClient captures an erroneous response from CoreApi and converts it into a SwaggerException<ProblemDetails>
        /// This method extracts the contents we need to display in the UI from the exception
        /// </summary>
        /// <param name="problemDetailsSwaggerException"></param>
        /// <returns></returns>
        private ObjectResult HandleProblemDetailsSwaggerException(SwaggerException<CoreApiProblemDetails> problemDetailsSwaggerException)
        {
            var problem = problemDetailsSwaggerException.Result;
            var response = new ProblemDetails
            {
                Status = (int) problem.Status,
                Title = problem.Title
            };
            return StatusCode(response.Status, response);
        }

        private ObjectResult HandleSwaggerException(Exception exception)
        {
            var problemDetail = new ProblemDetails
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "An unexpected error has occurred.",
            };
            return StatusCode(problemDetail.Status, problemDetail);
        }

        private int GetCfcContactIdFromHeaders()
        {
            var isCfcContactIdInHeader = Request.Headers.TryGetValue("cfc-contact-id", out StringValues headerValues);
            if (!isCfcContactIdInHeader)
            {
                throw new ArgumentNullException(@"cfc-contact-id", @"cfc-contact-id is required but has not been provided as a header.");
            }

            return Convert.ToInt32(headerValues.FirstOrDefault());
        }
    }
}