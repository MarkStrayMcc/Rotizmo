using Hero.Integration.CoreApi;
using Hero.Integration.CreatePolicyMtaApi.LossPayeeApi;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [ApiController]
    [Route("api/policy/{policyNumber}/loss-payees")]
    public class LossPayeeController : Controller
    {
        private ILossPayeeClient _lossPayeeClient; 

        public LossPayeeController(ILossPayeeClient lossPayeeClient)
        {
            _lossPayeeClient = lossPayeeClient;
        }

        [HttpPost]
        public async Task<IActionResult> Post(string policyNumber, [FromBody] LossPayeeMtaRequest request)
        {
            var response = await _lossPayeeClient.PostAsync(policyNumber, request);
            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> Get(string policyNumber)
        {
            var lossPayees = await _lossPayeeClient.GetAsync(policyNumber);
            return Ok(lossPayees);
        }
    }
}

