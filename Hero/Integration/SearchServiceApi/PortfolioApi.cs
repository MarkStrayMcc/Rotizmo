using Hero.Integration.SearchServiceApi.Interfaces;
using Hero.Models;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Hero.Integration.SearchServiceApi
{
    public class PortfolioApi : IPortfolioApi
    {
        private readonly HttpClient _httpClient;

        public PortfolioApi(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<PolicySearchResult>> GetPortfolioItems(
            string searchTerm,
            string filters = "allpolicies",
            int limit = 100,
            int offset = 0)
        {
            try
            {
                var policySearchResults = await _httpClient.GetFromJsonAsync<PolicySearchResults>($"{_httpClient.BaseAddress}?SearchTerm={searchTerm}&Filters={filters}&Limit={limit}&Offset={offset}");

                return policySearchResults.Results;
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }
    }
}
