using Microsoft.AspNetCore.Mvc;
using Hero.Integration.DDPTApi.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;
using WebApiDto.Dto.DDPT;

namespace Hero.Controllers
{
    [Produces("application/json")]
    [Route("api/Coverage")]
    public class CoverageController : Controller
    {
        private readonly ICoverageApi _coverageApi;

        public CoverageController(ICoverageApi coverageApi)
        {
            _coverageApi = coverageApi;
        }

        // GET: api/Coverage/
        [HttpPost("getavailable")]
        public async Task<IEnumerable<CoverageType>> GetAvailable([FromBody]CoverageRequest request)
        {
            return await _coverageApi.GetCoverageTypes(request);
        }
    }
}