using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Hero.Models;

namespace Hero.Controllers
{
    public class ClientClearanceController : Controller
    {
        private readonly IClientClearanceApi _clientClearanceApi;

        public ClientClearanceController(IClientClearanceApi clientClearanceApi)
        {
            _clientClearanceApi = clientClearanceApi;
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> CheckForBroker([FromBody]ClientClearanceRequest clientClearanceRequest)
        {
            var clientClearanceResult = await _clientClearanceApi.CheckForBroker(clientClearanceRequest);

            return Ok(clientClearanceResult);
        }
    }
}