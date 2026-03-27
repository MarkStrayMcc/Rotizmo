using System.Threading.Tasks;
using Cfc.CoreApi.Integration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{
    public class SendEuDocumentsController : Controller
    {
        private readonly ISendEuDocumentsApi _sendEuDocumentsApi;

        public SendEuDocumentsController(ISendEuDocumentsApi sendEuDocumentsApi)
        {
            _sendEuDocumentsApi = sendEuDocumentsApi;
        }

        [HttpPost("[controller]")]
        public async Task<IActionResult> SendEuDocuments([FromBody] SendEuDocumentsRequest sendEuDocumentsRequest)
        {
            var sendEuDocumentsResult = await _sendEuDocumentsApi.SendEuDocuments(sendEuDocumentsRequest);

            return Ok(sendEuDocumentsResult);
        }
    }
}
