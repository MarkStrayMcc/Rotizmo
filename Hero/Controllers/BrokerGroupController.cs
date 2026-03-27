using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    public class BrokerGroupController : Controller
    {
        private readonly IBrokerGroupApi _brokerGroupApi;

        public BrokerGroupController(IBrokerGroupApi brokerGroupApi) => _brokerGroupApi = brokerGroupApi;

        [HttpGet("[controller]/{brokerGroupId}")]
        public async Task<IActionResult> Get(int brokerGroupId)
        {
            return Ok(await _brokerGroupApi.GetBrokerGroupInfo(brokerGroupId));
        }
    }
}

