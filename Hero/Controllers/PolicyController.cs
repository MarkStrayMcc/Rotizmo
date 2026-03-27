using System.Threading.Tasks;
using Hero.Integration.CoreApi.PolicyAdditionalInsured;
using Hero.Integration.CoreApi.PolicyLossPayee;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class PolicyController : Controller
    {
        private readonly IPolicyAdditionalInsuredClient _policyAdditionalInsuredClient;
        private readonly IPolicyLossPayeeClient _policyLossPayeeClient;

        public PolicyController(IPolicyAdditionalInsuredClient policyAdditionalInsuredClient, IPolicyLossPayeeClient policyLossPayeeClient)
        {
            _policyAdditionalInsuredClient = policyAdditionalInsuredClient;
            _policyLossPayeeClient = policyLossPayeeClient;
        }
        
        [HttpGet("policy/{policyNumber}/additional-insured")]
        public async Task<IActionResult> GetAdditionalInsuredForPolicy(string policyNumber)
        {
            return Ok(await _policyAdditionalInsuredClient.AdditionalInsuredAsync(policyNumber));
        }

        [HttpGet("policy/{policyNumber}/loss-payees")]
        public async Task<IActionResult> GetLossPayeesForPolicy(string policyNumber)
        {
            return Ok(await _policyLossPayeeClient.RetrievePolicyLossPayeesAsync(policyNumber));
        }
    }
}
