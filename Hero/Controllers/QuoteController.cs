using System;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.Cache;
using System.Text;
using Quote = Hero.Models.Quote;
using QuoteBindRequest = Hero.Models.QuoteBindRequest;
using QuotePublishRequest = Hero.Models.QuotePublishRequest;
using ProblemDetails = Cfc.CoreApi.Integration.ProblemDetails;

namespace Hero.Controllers
{
    public class QuoteController : Controller
    {
        private readonly ICacheHelper _cacheHelper;
        private readonly IQuoteApi _quoteApi;
        private readonly IDraftQuoteApi _draftQuoteApi;

        public QuoteController(
            ICacheHelper cacheHelper,
            IQuoteApi quoteApi,
            IDraftQuoteApi draftQuoteApi)
        {
            _cacheHelper = cacheHelper;
            _quoteApi = quoteApi;
            _draftQuoteApi = draftQuoteApi;
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> QuoteData(int enquiryId)
        {
            try
            {
                var quote = await _quoteApi.CreateDraftQuoteForEnquiry(enquiryId);
                return Ok(quote);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> QuoteDataV2(int enquiryId)
        {
            try
            {
                var quoteData = await _draftQuoteApi.ResolveDraftQuoteAsync(enquiryId);
                return Ok(quoteData);
            }
            catch (Exception exception)
            {
                return HandleException(exception);
            }
        }

        private ObjectResult HandleException(Exception exception)
        {
            var problemDetail = new ProblemDetails
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "An unexpected error has occurred. Look in the Detail section for more information.",
                Detail = exception.Message
            };
            return StatusCode((int)problemDetail.Status, problemDetail);
        }

        [HttpGet("[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> LoadFromQuoteRef(int quoteRef)
        {
            try
            {
                var quote = await _quoteApi.GetQuoteAsync(quoteRef);
                return Ok(quote);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        /// <summary>
        /// Saves a draft quote to cache
        /// </summary>
        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> SaveDraft([FromBody] WebApiDto.Dto.Quote quote)
        {
            if (quote.DraftQuoteId == Guid.Empty)
            {
                quote.DraftQuoteId = Guid.NewGuid();
            }

            if (string.IsNullOrEmpty(quote.Origin))
            {
                quote.Origin = "HERO";
            }

            var key = $"{nameof(Quote)}:{quote.DraftQuoteId.ToString()}";

            await _cacheHelper.SaveToCache(key, quote, 2);

            return Ok(quote);
        }

        [HttpPost("[controller]/[action]")]
        public IActionResult Send([FromBody] WebApiDto.Dto.Quote quote)
        {
            return Ok(quote);
        }

        [HttpPost("[controller]/[action]")]
        public IActionResult Insert([FromBody] WebApiDto.Dto.Quote quote)
        {
            return Ok(quote);
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> Bind([FromBody] QuoteBindRequest bindRequest)
        {
            var result = await _quoteApi.BindQuote(bindRequest);
            return Ok(result);
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> SaveQuote([FromBody] WebApiDto.Dto.Quote quote)
        {
            try
            {
                var quoteResponse = await _quoteApi.SaveQuoteAsync(quote.DraftQuoteId);
                return Ok(quoteResponse);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> ConfirmQuoteSent(int quoteId, string underwriter)
        {
            await _quoteApi.ConfirmQuoteSent(quoteId, underwriter);
            return Ok();
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> PublishQuote([FromBody] QuotePublishRequest quotePublishRequest)
        {
            try
            {
                var quoteResponse = await _quoteApi.PublishQuote(quotePublishRequest);
                return Ok(quoteResponse);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet("[controller]/{quoteReference}/is-publishable")]
        public async Task<ActionResult<bool>> IsPublishableQuote([FromRoute] int quoteReference)
        {
            try
            {
                var response = await _quoteApi.IsPublishableQuote(quoteReference);
                return Ok(response);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet("[controller]/pricinggroups")]
        public async Task<IActionResult> GetPricingGroups(int quoteId)
        {
            try
            {
                // get user email
                var userEmail = "";
                if (HttpContext.Session.TryGetValue("Email", out var emailBytes))
                {
                    userEmail = Encoding.UTF8.GetString(emailBytes);
                }
                var quoteResponse = await _quoteApi.GetPricingGroups(
                    new WebApiDto.Dto.PricingGroupsRequest
                    {
                        QuoteID = quoteId,
                        UserEmail = userEmail
                    });
                return Ok(quoteResponse);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }
    }
}
