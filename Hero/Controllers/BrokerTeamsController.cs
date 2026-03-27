using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    [Route("broker-teams")]
    public class BrokerTeamsController : Controller
    {
        private readonly IBrokerTeamApi _brokerTeamApi;

        public BrokerTeamsController(IBrokerTeamApi brokerTeamApi) => _brokerTeamApi = brokerTeamApi;

        [HttpGet]
        public async Task<IActionResult> Get(IEnumerable<string> countryIsoCode)
        {
            var brokerTeams = await _brokerTeamApi.GetByCountryIsoCodes(countryIsoCode);
            return Ok(brokerTeams);
        }
    }
}
