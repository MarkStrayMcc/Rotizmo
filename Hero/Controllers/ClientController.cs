using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class ClientController : Controller
    {
        private readonly IClientApi _clientApi;

        public ClientController(IClientApi clientApi)
        {
            _clientApi = clientApi;
        }

        [HttpGet("[controller]/[action]/{policyNumber}")]
        public async Task<IActionResult> Get(string policyNumber)
        {
            var client = await _clientApi.GetAsync(policyNumber);

            return Ok(client);
        }

        [HttpGet("[controller]/[action]/{searchTerm}")]
        public async Task<IActionResult> Search(string searchTerm)
        {
            var client = await _clientApi.SearchAsync(searchTerm);

            return Ok(client);
        }

        /// <summary>
        /// Gets the client Folder By clientId
        /// </summary>
        /// <param name="clientId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("[controller]/{clientId}/folder")]
        public async Task<IActionResult> GetClientFolderByClientId(int clientId)
        {
            var clientFolderPath = await _clientApi.GetClientFolderByClientId(clientId);
            return Ok(clientFolderPath);
        }

        /// <summary>
        /// Gets the client Folder By clientId
        /// </summary>
        /// <param name="clientId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("[controller]/{clientId}/latest-active-quote-reference")]
        public async Task<IActionResult> GetLatestActiveQuoteReference([FromBody] LatestQuoteReferenceRequest latestQuoteByClientIdRequest)        {
            var latestQuoteByClientIdResponse = await _clientApi.GetLatestActiveQuoteReference(latestQuoteByClientIdRequest);
            return Ok(latestQuoteByClientIdResponse);
        }

    }
}