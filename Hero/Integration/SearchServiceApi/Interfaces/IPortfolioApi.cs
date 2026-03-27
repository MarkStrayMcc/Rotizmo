using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.SearchServiceApi.Interfaces
{
    public interface IPortfolioApi
    {
        Task<IEnumerable<PolicySearchResult>> GetPortfolioItems(
            string searchTerm,
            string filters = "allpolicies",
            int limit = 100,
            int offset = 0);
    }
}
