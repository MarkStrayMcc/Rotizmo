using Hero.Infrastructure.Exceptions;
using Hero.Models;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Hero.Integration.EnrichmentAdapter
{
    public class EnrichmentAdapterApi : IEnrichmentAdapterApi
    {
        private readonly HttpClient _client;

        public EnrichmentAdapterApi(HttpClient client) 
        {
            _client = client;
        }

        public async Task<Dictionary<string, RiskParameter>> GetEnrichedData(Guid clientUid)
        {
            var url = $"{_client.BaseAddress}api/v1/{clientUid}/enriched-data";
            var response = await _client.GetAsync(url);
            var content = await response.Content.ReadFromJsonAsync<EnrichedDataResult>();

            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                throw new ValidationException(response.ReasonPhrase);
            }
            else if (response.StatusCode == HttpStatusCode.NotFound ||
                     (response.StatusCode == HttpStatusCode.InternalServerError))
            {
                throw new NotFoundException();
            }
            else if (!response.IsSuccessStatusCode)
            {
                throw new Exception(content.ToString());
            }
            return content.EnrichedData;
        }

    }
}