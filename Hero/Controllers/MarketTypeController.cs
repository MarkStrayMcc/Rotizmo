using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class MarketTypeController: Controller
    {
        private readonly IMarketTypeApi _marketTypeApi;

        public MarketTypeController(IMarketTypeApi marketTypeApi)
        {
            _marketTypeApi = marketTypeApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> MarketTypes()
        {
            var response = await _marketTypeApi.GetMarketTypes();
            return Ok(response);
        }

    }
}
