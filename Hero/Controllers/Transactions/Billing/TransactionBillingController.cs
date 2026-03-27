using Hero.Infrastructure.Filters;
using Hero.Integration.CoreApi.TransactionBilling;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers.Transactions.Billing
{
    [ApiController]
    [ApiExceptionFilter]
    [Route("policy/{policyNumber}/transactions/billing")]
    public class TransactionBillingController : ControllerBase
    {
        private readonly ITransactionBillingClient _client;

        public TransactionBillingController(ITransactionBillingClient client)
        {
            _client = client;
        }

        [HttpPut]
        public async Task<IActionResult> Put(string policyNumber, UpdateTransactionBillingRequest request)
        {
            await _client.PutAsync(policyNumber, request);
            return NoContent();
        }
    }
}
