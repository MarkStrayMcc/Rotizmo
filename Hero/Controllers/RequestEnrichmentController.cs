using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.HeroEmails.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Controllers
{
    public class RequestEnrichmentController : Controller
    {
        private readonly IRequestEnrichmentApi _requestEnrichmentApi;

        public RequestEnrichmentController(IRequestEnrichmentApi requestEnrichmentApi)
        {
            _requestEnrichmentApi = requestEnrichmentApi;
        }

        [HttpGet("request-enrichment/get-approval-states/{countryId}")]
        public async Task<IActionResult> GetApprovedStatesByCountryId(int countryId)
        {
            var approvedStates = await _requestEnrichmentApi.GetApprovedStatesByCountryId(countryId);
            return Ok(approvedStates);
        }
    }
}