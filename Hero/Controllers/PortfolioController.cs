using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.SearchServiceApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Hero.Models;

namespace Hero.Controllers
{
    public class PortfolioController: Controller
    {
        private readonly IPortfolioApi _portfolioApi;

        public PortfolioController(IPortfolioApi portfolioApi)
        {
            _portfolioApi = portfolioApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IEnumerable<PolicySearchResult>> GetPortfolioItems(
            string searchTerm,
            string filters = "allpolicies",
            int limit = 100,
            int offset = 0)
        {
            return await _portfolioApi.GetPortfolioItems(searchTerm, filters, limit, offset);
        }
    }
}
