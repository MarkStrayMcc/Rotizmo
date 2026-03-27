using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class BrokerContactController : Controller
    {
        private readonly IBrokerContactApi _brokerContactApi;

        public BrokerContactController(IBrokerContactApi brokerContactApi)
        {
            _brokerContactApi = brokerContactApi;
        }  

        [HttpGet("[controller]/[action]/{brokerContactId}")]
        public async Task<IActionResult> GetBrokerContact(int brokerContactId, bool includeFullBrokerDetails)
        {
            var brokerInformationResponse = await _brokerContactApi.GetBrokerContact(brokerContactId, includeFullBrokerDetails);

            return Ok(brokerInformationResponse);
        }
    }
}
