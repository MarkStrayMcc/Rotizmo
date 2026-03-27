using Hero.Integration.EnrichmentAdapter;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    public class EnrichmentAdapterController : Controller
    {
        private readonly IEnrichmentAdapterApi _enrichmentAdapterApi;

        public EnrichmentAdapterController(IEnrichmentAdapterApi enrichmentAdapterApi)
        {
            _enrichmentAdapterApi = enrichmentAdapterApi;
        }

        [HttpGet("[controller]/[action]/{clientUid}")]
        public async Task<IActionResult> Get(Guid clientUid)
        {
            var enrichedData = await _enrichmentAdapterApi.GetEnrichedData(clientUid);

            return Ok(enrichedData);
        }
    }
}
