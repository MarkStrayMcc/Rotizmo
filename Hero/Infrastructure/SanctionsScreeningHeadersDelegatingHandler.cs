using Microsoft.FeatureManagement;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Hero.Infrastructure;
public class SanctionsScreeningHeadersDelegatingHandler : DelegatingHandler
{
    private readonly IFeatureManager _featureManager;
    private const string PilotEnvironmentHeader = "X-Pilot-Environment";
    private const string WorldCheckOneFakeModeFeatureFlag = "HERO_UseWorldCheckOneFakeMode";

    public SanctionsScreeningHeadersDelegatingHandler(IFeatureManager featureManager)
    {
        _featureManager = featureManager;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        await AddConditionalPilotEnvironmentHeader(request);

        var response = await base.SendAsync(request, cancellationToken);

        return response;
    }

    private async Task AddConditionalPilotEnvironmentHeader(HttpRequestMessage request)
    {
        var isFakeModeEnabled = await _featureManager.IsEnabledAsync(WorldCheckOneFakeModeFeatureFlag);
        if (!isFakeModeEnabled)
        {
            request.Headers.Add(PilotEnvironmentHeader, string.Empty);
        }
    }
}
