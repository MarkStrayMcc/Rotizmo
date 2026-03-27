using Hero.Infrastructure.Filters;
using Hero.Integration.DirectBilling;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [ApiController]
    [ApiExceptionFilter]
    [Route("direct-billing")]
    public class DirectBillingController : ControllerBase
    {
        private readonly IDirectBillingApi _directBillingApi;

        public DirectBillingController(IDirectBillingApi directBillingApi)
        {
            _directBillingApi = directBillingApi;
        }

        [HttpGet]
        [Route("payments/limits/{countryCode}")]
        public async Task<IActionResult> Get(string countryCode)
        {
            var limit = await _directBillingApi.GetPaymentLimit(countryCode);
            return Ok(limit);
        }

        [HttpGet]
        [Route("{externalCustomerReference}/contact-details")]
        public async Task<IActionResult> GetContactDetails(string externalCustomerReference)
        {
            var contactDetails = await _directBillingApi.GetContactDetails(externalCustomerReference);
            return Ok(contactDetails);
        }
    }
}
