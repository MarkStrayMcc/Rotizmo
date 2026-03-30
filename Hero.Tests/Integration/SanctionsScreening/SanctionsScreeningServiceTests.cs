using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.SanctionsScreening;
using Hero.Models;
using Microsoft.FeatureManagement;

namespace Hero.Tests.Integration.SanctionsScreening;

public class SanctionsScreeningServiceTests
{
    private IFeatureManager _featureManager;
    private ISanctionsScreeningApi _sanctionsScreeningApi;
    private IClientsApi _clientsApi;
    private SanctionsScreeningService _subject;

    [SetUp]
    public void SetUp()
    {
        _featureManager = Substitute.For<IFeatureManager>();
        _sanctionsScreeningApi = Substitute.For<ISanctionsScreeningApi>();
        _clientsApi = Substitute.For<IClientsApi>();
        _subject = new SanctionsScreeningService(_featureManager,_sanctionsScreeningApi, _clientsApi);
    }
    
    [Test]
    public async Task HasSanctions_ShouldOnlyCallClientsApi_WhenFeatureDisabled()
    {
        _featureManager.IsEnabledAsync("HERO_UseWorldCheckSanctionsApi").Returns(false);

        var request = BuildSanctionsCheckRequestPayload();
        
        await _subject.HasSanctions(request);

        await _clientsApi.Received(1).HasSanctions(request.ClientName, request.CountryIsoCode, request.Stage, request.IsSendEmail);
        await _sanctionsScreeningApi.DidNotReceiveWithAnyArgs().CreateAndScreen(default, default, default, default, default, default);
    }
    
    [TestCase(true)]
    [TestCase(false)]
    public async Task HasSanctions_ShouldCallClientsApi_WhenFeatureDisabled_AndReturnResponse(bool hasSanctions)
    {
        _featureManager.IsEnabledAsync("HERO_UseWorldCheckSanctionsApi").Returns(false);

        var request = BuildSanctionsCheckRequestPayload();

        _clientsApi.HasSanctions(request.ClientName, request.CountryIsoCode, request.Stage, request.IsSendEmail).Returns(hasSanctions);
        
        var response = await _subject.HasSanctions(request);
        response.Should().Be(hasSanctions);
    }
    
    [Test]
    public async Task HasSanctions_ShouldCallSanctionsScreeningApiTwice_WhenFeatureEnabled()
    {
        _featureManager.IsEnabledAsync("HERO_UseWorldCheckSanctionsApi").Returns(true);

        var request = BuildSanctionsCheckRequestPayload();
        
        await _subject.HasSanctions(request);

        await _sanctionsScreeningApi.ReceivedWithAnyArgs(2)
            .CreateAndScreen(default, default, default, default, default, default);
        await _clientsApi.DidNotReceiveWithAnyArgs().HasSanctions(default, default, default, default);
    }
    
    [Test]
    public async Task HasSanctions_ShouldCallSanctionsScreeningApiForEntityTypes_WhenFeatureEnabled()
    {
        _featureManager.IsEnabledAsync("HERO_UseWorldCheckSanctionsApi").Returns(true);

        var request = BuildSanctionsCheckRequestPayload();
        
        await _subject.HasSanctions(request);

        await _sanctionsScreeningApi.Received(1)
            .CreateAndScreen(request.ClientUid, request.ClientId, request.ClientName, request.CountryIsoCode, "organisation", null);
        await _sanctionsScreeningApi.Received(1)
            .CreateAndScreen(request.ClientUid, request.ClientId, request.ClientName, request.CountryIsoCode, "individual", null);
        await _clientsApi.DidNotReceiveWithAnyArgs().HasSanctions(default, default, default, default);
    }
    
    [TestCase(true, true, true)]
    [TestCase(true, false, true)]
    [TestCase(false, false, false)]
    public async Task HasSanctions_ShouldCallSanctionsScreeningApi_AndReturnAggregatedResult_WhenFeatureEnabled(
        bool individualScreeningResult, bool orgScreeningResult, bool expectedResult )
    {
        _featureManager.IsEnabledAsync("HERO_UseWorldCheckSanctionsApi").Returns(true);

        var request = BuildSanctionsCheckRequestPayload();
   
        _sanctionsScreeningApi
            .CreateAndScreen(request.ClientUid, request.ClientId, request.ClientName, request.CountryIsoCode, "organisation", null)
            .Returns(orgScreeningResult);
        _sanctionsScreeningApi
            .CreateAndScreen(request.ClientUid, request.ClientId, request.ClientName, request.CountryIsoCode, "individual", null)
            .Returns(individualScreeningResult);

        var result = await _subject.HasSanctions(request);

        result.Should().Be(expectedResult);
    }

    private static SanctionsCheckRequest BuildSanctionsCheckRequestPayload()
    {
        var r = new SanctionsCheckRequest()
        {
            ClientUid = Guid.NewGuid().ToString(),
            ClientId = Random.Shared.Next(),
            ClientName = "client_name",
            CountryIsoCode = "UK",
            Stage = "stage",
            IsSendEmail = true
        };
        return r;
    }
}