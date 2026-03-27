using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class PolicyEmailController : Controller
    {
        private readonly IPolicyEmailApi _policyEmailApi;

        public PolicyEmailController(IPolicyEmailApi policyEmailApi)
        {
            _policyEmailApi = policyEmailApi;
        }

        [HttpGet("policy/{policyNumber}/email-template")]
        public async Task<IActionResult> GetEmailTemplateForPolicy(string policyNumber)
        {
            return Ok(await _policyEmailApi.GetEmailTemplateForPolicy(policyNumber));
        }
    }
}
