using Microsoft.FeatureManagement;
using System.Linq;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;

namespace Hero.Integration.SanctionsScreening;

public class SanctionsScreeningService : ISanctionsScreeningService
{
    private readonly IFeatureManager _featureManager;
    private readonly ISanctionsScreeningApi _sanctionsScreeningApi;
    private readonly IClientsApi _clientsApi;

    public SanctionsScreeningService(IFeatureManager featureManager,
        ISanctionsScreeningApi sanctionsScreeningApi,
        IClientsApi clientsApi)
    {
        _featureManager = featureManager;
        _sanctionsScreeningApi = sanctionsScreeningApi;
        _clientsApi = clientsApi;
    }
    
    public async Task<bool> HasSanctions(SanctionsCheckRequest request)
    {
        if (await _featureManager.IsEnabledAsync("HERO_UseWorldCheckSanctionsApi"))
        {
            var orgRequest = _sanctionsScreeningApi.CreateAndScreen(request.ClientUid, request.ClientId, request.ClientName, request.CountryIsoCode, "organisation", request.onGoingScreening);
            var indRequest = _sanctionsScreeningApi.CreateAndScreen(request.ClientUid, request.ClientId, request.ClientName, request.CountryIsoCode, "individual", request.onGoingScreening);
            var sanctionResults = await Task.WhenAll(orgRequest, indRequest);
            return sanctionResults.Any(sanctioned => sanctioned);
        }
        else
        {
            return await _clientsApi.HasSanctions(request.ClientName, request.CountryIsoCode, request.Stage, request.IsSendEmail);
        }
    }
}