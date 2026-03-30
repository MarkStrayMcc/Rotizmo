using System.Net;
using Hero.Infrastructure;

namespace Hero.Tests.Integration
{
    [TestFixture]
    public class GeolocationDelegatingHandlerTests
    {
        [Test]
        public void ShouldCallGeolocationDelegatingHandler()
        {
            var handler = new GeolocationDelegatingHandler(null)
            {
                InnerHandler = new TestHandler((r, c) => TestHandler.Return200())
            };

            var request = new HttpRequestMessage(HttpMethod.Get, "http://test-google-geocode.com");
            var client = new HttpClient(handler);
            var result = client.SendAsync(request).Result;

            Assert.That(result.StatusCode, Is.EqualTo(HttpStatusCode.OK));

        }
    }

    public class TestHandler : DelegatingHandler
    {
        private readonly Func<HttpRequestMessage,
            CancellationToken, Task<HttpResponseMessage>> _handlerFunc;

        public TestHandler()
        {
            _handlerFunc = (r, c) => Return200();
        }

        public TestHandler(Func<HttpRequestMessage,
            CancellationToken, Task<HttpResponseMessage>> handlerFunc)
        {
            _handlerFunc = handlerFunc;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return _handlerFunc(request, cancellationToken);
        }

        public static Task<HttpResponseMessage> Return200()
        {
            return Task.Factory.StartNew(
                () => new HttpResponseMessage(HttpStatusCode.OK));
        }
    }
}
