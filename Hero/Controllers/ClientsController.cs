using System.Threading.Tasks;
using Hero.Infrastructure.Filters;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.SanctionsScreening;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{

    [ApiController]
    [ApiExceptionFilter]
    [Route("clients")]
    public class ClientsController : ControllerBase
    {
        private readonly IClientsApi _clientsApi;
        private readonly ISanctionsScreeningService _sanctionsScreeningService;

        public ClientsController(IClientsApi clientsApi, 
            ISanctionsScreeningService sanctionsScreeningService)
        {
            _clientsApi = clientsApi;
            _sanctionsScreeningService = sanctionsScreeningService;
        }

        [HttpGet]
        [Route("has-sanctions")]
        public async Task<IActionResult> Get(string clientName, string countryIsoCode, string stage, bool isSendEmail)
        {
            var checkClientSanctionsResponse = await _clientsApi.HasSanctions(clientName, countryIsoCode, stage, isSendEmail);

            return Ok(checkClientSanctionsResponse);
        }

        [HttpPost]
        [Route("sanctions-check")]
        public async Task<IActionResult> HasSanctions([FromBody] SanctionsCheckRequest request)
        {
            var response = await _sanctionsScreeningService.HasSanctions(request);

            return Ok(response);
        }
    }
}
