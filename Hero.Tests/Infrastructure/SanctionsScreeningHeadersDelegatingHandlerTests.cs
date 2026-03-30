using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Hero.Infrastructure;
using Microsoft.FeatureManagement;

namespace Hero.Tests.Infrastructure;

[TestFixture]
public class SanctionsScreeningHeadersDelegatingHandlerTests
{
    private IFeatureManager _featureManager;
    private SanctionsScreeningHeadersDelegatingHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _featureManager = Substitute.For<IFeatureManager>();
        _handler = new SanctionsScreeningHeadersDelegatingHandler(_featureManager);
    }

    [TearDown]
    public void TearDown()
    {
        _handler?.Dispose();
    }

    [Test]
    public async Task SendAsync_ShouldAddPilotEnvironmentHeader_WhenFakeModeDisabled()
    {
        // Arrange
        _featureManager.IsEnabledAsync("HERO_UseWorldCheckOneFakeMode").Returns(false);
        _handler.InnerHandler = new TestHandler();

        var request = new HttpRequestMessage(HttpMethod.Post, "https://test-api.com/api/v1/cases/create-and-screen");
        var capturedHeaders = new List<string>();

        var testHandler = new TestHandler((req, ct) =>
        {
            if (req.Headers.Contains("X-Pilot-Environment"))
            {
                capturedHeaders.AddRange(req.Headers.GetValues("X-Pilot-Environment"));
            }
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        });
        _handler.InnerHandler = testHandler;

        // Act
        using var client = new HttpClient(_handler);
        await client.SendAsync(request);

        // Assert
        capturedHeaders.Should().Contain(string.Empty);
    }

    [Test]
    public async Task SendAsync_ShouldNotAddPilotEnvironmentHeader_WhenFakeModeEnabled()
    {
        // Arrange
        _featureManager.IsEnabledAsync("HERO_UseWorldCheckOneFakeMode").Returns(true);
        _handler.InnerHandler = new TestHandler();

        var request = new HttpRequestMessage(HttpMethod.Post, "https://test-api.com/api/v1/cases/create-and-screen");
        var capturedHeaders = new List<string>();

        var testHandler = new TestHandler((req, ct) =>
        {
            if (req.Headers.Contains("X-Pilot-Environment"))
            {
                capturedHeaders.AddRange(req.Headers.GetValues("X-Pilot-Environment"));
            }
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        });
        _handler.InnerHandler = testHandler;

        // Act
        using var client = new HttpClient(_handler);
        await client.SendAsync(request);

        // Assert
        capturedHeaders.Should().BeEmpty();
    }

    private class TestHandler : DelegatingHandler
    {
        private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _handlerFunc;

        public TestHandler()
        {
            _handlerFunc = (r, c) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        }

        public TestHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handlerFunc)
        {
            _handlerFunc = handlerFunc;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return _handlerFunc(request, cancellationToken);
        }
    }
}
