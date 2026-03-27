using System.Threading.Tasks;

using Hero.Integration.CoreApi.Interfaces;

using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class QuoteEmailController : Controller
    {
        private readonly IQuoteEmailApi _quoteEmailApi;

        public QuoteEmailController(IQuoteEmailApi quoteEmailApi)
        {
            _quoteEmailApi = quoteEmailApi;
        }

        [HttpGet("quote/{quoteId}/email-template")]
        public async Task<IActionResult> GetEmailTemplateForQuote(int quoteId)
        {
            return Ok(await _quoteEmailApi.GetEmailTemplateForQuote(quoteId));
        }
    }
}
