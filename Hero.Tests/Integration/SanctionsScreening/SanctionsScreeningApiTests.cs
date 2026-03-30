using System.Net;
using System.Net.Http.Json;
using Hero.Integration.SanctionsScreening;
using Hero.Models;
using Hero.Tests.Helpers;

namespace Hero.Tests.Integration.SanctionsScreening;

[TestFixture]
public class SanctionsScreeningApiTests
{
    private ICreateAndScreenApiRequestBuilder _requestBuilder;

    [SetUp]
    public void SetUp()
    {
        _requestBuilder = Substitute.For<ICreateAndScreenApiRequestBuilder>();
    }

    [Test]
    public async Task CreateAndScreen_ShouldBuildTheRequestPayload()
    {
        var api = new SanctionsScreeningApi(SetupHttpClient(), _requestBuilder);

        var clientUid = Guid.NewGuid().ToString();
        var clientId = Random.Shared.Next();
        var clientName = "client_name";
        var countryIsoCode = "iso_code";
        var entityType = "entity_type";
        var onGoingScreening = false;

        await api.CreateAndScreen(clientUid, clientId, clientName, countryIsoCode, entityType, onGoingScreening);

        _requestBuilder.Received(1)
            .Build(clientUid, clientId, clientName, countryIsoCode, entityType, onGoingScreening);
    }

    [Test]
    public async Task CreateAndScreen_ShouldBuildAndPostPayload()
    {
        var httpCalled = false;
        var api = new SanctionsScreeningApi(SetupHttpClient(callback: () => httpCalled = true), _requestBuilder);
        _requestBuilder.Build(default, default, default, default, default,false)
            .ReturnsForAnyArgs(new CreateAndScreenApiRequest());

        await api.CreateAndScreen("uid", 1, "name", "UK", "entity", false);

        httpCalled.Should().BeTrue();
    }
    
    [TestCase(true)]
    [TestCase(false)]
    public async Task CreateAndScreen_Returns_MatchResult(bool hasMatches)
    {
        var api = new SanctionsScreeningApi(SetupHttpClient(hasMatches:hasMatches), _requestBuilder);
        _requestBuilder.Build(default, default, default, default, default, false).ReturnsForAnyArgs(new CreateAndScreenApiRequest());

        var result = await api.CreateAndScreen("uid", 1, "name", "UK", "entity", false);

        result.Should().Be(hasMatches);
    }

    [TestCase(HttpStatusCode.BadRequest)]
    [TestCase(HttpStatusCode.InternalServerError)]
    public async Task CreateAndScreen_ThrowsHttpRequestExceptionForErrors(HttpStatusCode statusCode)
    {
        var api = new SanctionsScreeningApi(SetupHttpClient(statusCode:statusCode), _requestBuilder);
        _requestBuilder.Build(default, default, default, default, default, false).ReturnsForAnyArgs(new CreateAndScreenApiRequest());

        Assert.ThrowsAsync<HttpRequestException>(async () => await api.CreateAndScreen("uid", 1, "name", "UK", "entity", false));
    }
    
    private HttpClient SetupHttpClient(bool hasMatches = true, Action? callback = null, HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        var handler = new TestHttpMessageHandler((req, token) =>
        {
            if (callback != null)
                callback();
            Assert.That(req.RequestUri.ToString(), Does.Contain("/api/v1/cases/create-and-screen"));
            return Task.FromResult(new HttpResponseMessage(statusCode)
            {
                Content = JsonContent.Create(new SanctionsScreeningResponse { HasMatches = hasMatches })
            });
        });

        return new HttpClient(handler) { BaseAddress = new Uri("https://test-sanctions-api.example.com") };
    }
}
