using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Hero.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Session;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging.Abstractions;

namespace Hero.Tests.Infrastructure;

[TestFixture]
public class CfcHeadersDelegatingHandlerTests
{
    private IHttpContextAccessor _httpContextAccessor;
    private CfcHeadersDelegatingHandler _handler;

    [SetUp]
    public void SetUp()
    {
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();

        var httpContext = new DefaultHttpContext();
        var distributedCache = Substitute.For<IDistributedCache>();
        var sessionStore = new DistributedSessionStore(distributedCache, NullLoggerFactory.Instance);
        httpContext.Session = new DistributedSession(distributedCache, "test-session-id", TimeSpan.FromMinutes(30), TimeSpan.Zero, () => true, NullLoggerFactory.Instance, true);
        _httpContextAccessor.HttpContext.Returns(httpContext);

        _handler = new CfcHeadersDelegatingHandler(_httpContextAccessor);
    }

    [TearDown]
    public void TearDown()
    {
        _handler?.Dispose();
    }

    [Test]
    public async Task SendAsync_ShouldPassThroughRequestIdHeader()
    {
        // Arrange
        var httpContext = new DefaultHttpContext();
        var distributedCache = Substitute.For<IDistributedCache>();
        var sessionStore = new DistributedSessionStore(distributedCache, NullLoggerFactory.Instance);
        httpContext.Session = new DistributedSession(distributedCache, "test-session-id", TimeSpan.FromMinutes(30), TimeSpan.Zero, () => true, NullLoggerFactory.Instance, true);
        httpContext.Request.Headers.Add("Request-Id", "test-request-id");
        _httpContextAccessor.HttpContext.Returns(httpContext);
        _handler = new CfcHeadersDelegatingHandler(_httpContextAccessor);

        var request = new HttpRequestMessage(HttpMethod.Get, "https://test-api.com/api/test");
        var capturedHeaders = new List<string>();

        var testHandler = new TestHandler((req, ct) =>
        {
            if (req.Headers.Contains("Request-Id"))
            {
                capturedHeaders.AddRange(req.Headers.GetValues("Request-Id"));
            }
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        });
        _handler.InnerHandler = testHandler;

        // Act
        using var client = new HttpClient(_handler);
        await client.SendAsync(request);

        // Assert
        capturedHeaders.Should().Contain("test-request-id");
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
