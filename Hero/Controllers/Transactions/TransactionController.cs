using Hero.Infrastructure.Filters;
using Hero.Integration.Transaction;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers.Transactions
{
    [ApiController]
    [ApiExceptionFilter]
    [Route("transactions")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionApi _transactionApi;

        public TransactionController(ITransactionApi transactionApi)
        {
            _transactionApi = transactionApi;
        }

        [HttpGet]
        [Route("policyNumber/{policyNumber}")]
        public async Task<IActionResult> GetByPolicyNumber(string policyNumber)
        {
            var transactions = await _transactionApi.GetByPolicyNumber(policyNumber);
            return Ok(transactions);
        }
    }
}
