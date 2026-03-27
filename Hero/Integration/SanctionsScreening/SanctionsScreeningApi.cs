using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.SanctionsScreening;

public class SanctionsScreeningApi : ISanctionsScreeningApi
{
    private readonly HttpClient _httpClient;
    private readonly ICreateAndScreenApiRequestBuilder _requestBuilder;

    public SanctionsScreeningApi(HttpClient httpClient, ICreateAndScreenApiRequestBuilder requestBuilder)
    {
        _httpClient = httpClient;
        _requestBuilder = requestBuilder;
    }

    public async Task<bool> CreateAndScreen(string clientUid, int clientId, string clientName, string countryIsoCode, string entityType, bool? onGoingScreening)
    {
        var request = _requestBuilder.Build(clientUid, clientId, clientName, countryIsoCode, entityType, onGoingScreening);
        var response = await _httpClient.PostAsJsonAsync("/api/v1/cases/create-and-screen", request);
        response.EnsureSuccessStatusCode();

        var screeningResult = await response.Content.ReadFromJsonAsync<SanctionsScreeningResponse>();
        return screeningResult.HasMatches;
    }
}