using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;
using System.Threading.Tasks;


namespace Hero.Controllers
{
    [Route("[controller]/[action]")]
    public class CfcBankAccountController : Controller
    {
        private readonly ICfcBankAccountApi _cfcBankAccountApi;

        public CfcBankAccountController(ICfcBankAccountApi cfcBankAccountApi)
        {
            _cfcBankAccountApi = cfcBankAccountApi;
        }

        [HttpGet]
        public async Task<IActionResult> CfcBankAccounts()
        {
            var bankAccounts = await _cfcBankAccountApi.GetAsync().ConfigureAwait(false);
            return Ok(bankAccounts);
        }
    }
}
