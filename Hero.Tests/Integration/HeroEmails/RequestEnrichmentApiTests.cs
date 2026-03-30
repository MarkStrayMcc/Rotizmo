using Hero.Integration.HeroEmails;
using Hero.Models;
using Hero.Models.Exceptions;
using Hero.Tests.Helpers;
using System.Net;
using System.Net.Http.Json;

namespace Hero.Tests.Integration.HeroEmails
{
    public class RequestEnrichmentApiTests
    {
        [Test]
        public async Task GetQuoteEmailTemplate_ReturnsTemplateString()
        {
            // Arrange
            var expectedTemplate = "template-content";
            var handler = new TestHttpMessageHandler((request, token) =>
            {
                Assert.That(request.RequestUri.ToString(), Is.EqualTo("http://localhost/api/v1/templates/emailType/1"));
                var emailTemplate = new EmailTemplate { Template = expectedTemplate };
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(emailTemplate)
                });
            });
            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var api = new RequestEnrichmentApi(client);

            // Act
            var result = await api.GetEmailTemplate(1);

            // Assert
            Assert.That(result, Is.EqualTo(expectedTemplate));
        }

        [Test]
        public async Task GetQuoteCoverHolderInfo_ReturnsCoverHolderString()
        {
            // Arrange
            var expectedInfo = "coverholder-info";
            var handler = new TestHttpMessageHandler((request, token) =>
            {
                Assert.That(request.RequestUri.ToString(), Is.EqualTo("http://localhost/api/v1/quote/123/coverholder"));
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(expectedInfo)
                });
            });
            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var api = new RequestEnrichmentApi(client);

            // Act
            var result = await api.GetQuoteCoverHolderInfo(123);

            // Assert
            Assert.That(result, Is.EqualTo(expectedInfo));
        }

        [Test]
        public async Task GetQuoteEmailMergeFields_ReturnsDictionary()
        {
            // Arrange
            var expectedFields = new Dictionary<string, string> { { "Field1", "Value1" } };
            var handler = new TestHttpMessageHandler((request, token) =>
            {
                Assert.That(request.RequestUri.ToString(), Is.EqualTo("http://localhost/api/v1/quote/mergefields"));
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(expectedFields)
                });
            });
            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var api = new RequestEnrichmentApi(client);

            var enrichmentRequest = new UnderwritingDistributionEmail
            {
                QuoteId = 123,
                QuoteUid = Guid.NewGuid(),
                IsPublished = true,
                IsBindable = true,
                WordingVersionId = 1,
                CountryIsoCode = "US",
                ProductCode = "P1",
                Email = new Email(),
                QuoteIds = new List<int>()
            };

            // Act
            var result = await api.GetQuoteEmailMergeFields(enrichmentRequest);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result["Field1"], Is.EqualTo("Value1"));
        }

        [Test]
        public async Task GetQuoteUids_ReturnsDictionary()
        {
            // Arrange
            var quoteIds = new List<int> { 1, 2, 3 };
            var expectedDict = new Dictionary<int, Guid>
            {
                { 1, Guid.NewGuid() },
                { 2, Guid.NewGuid() },
                { 3, Guid.NewGuid() }
            };

            var handler = new TestHttpMessageHandler((request, token) =>
            {
                Assert.That(request.Method, Is.EqualTo(HttpMethod.Post));
                Assert.That(request.RequestUri.ToString(), Is.EqualTo("http://localhost/api/v1/quote/quoteuids"));
                // Optionally, check the request content if needed
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(expectedDict)
                });
            });
            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var api = new RequestEnrichmentApi(client);

            // Act
            var result = await api.GetQuoteUids(quoteIds);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(3));
            Assert.That(result[1], Is.EqualTo(expectedDict[1]));
            Assert.That(result[2], Is.EqualTo(expectedDict[2]));
            Assert.That(result[3], Is.EqualTo(expectedDict[3]));
        }

        [Test]
        public async Task GetApprovedStatesByCountryId_ReturnsListOfStates_WhenApiReturnsSuccess()
        {
            // Arrange
            var countryId = 1;
            var expectedStates = new List<string> { "CA", "TX", "NY" };
            var handler = new TestHttpMessageHandler((request, token) =>
            {
                Assert.That(request.RequestUri.ToString(), Is.EqualTo($"http://localhost/api/v1/helper/approvedstates?countryId={countryId}"));
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(expectedStates)
                });
            });
            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var api = new RequestEnrichmentApi(client);

            // Act
            var result = await api.GetApprovedStatesByCountryId(countryId);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(3));
            Assert.That(result, Is.EquivalentTo(expectedStates));
        }

        [Test]
        public void GetApprovedStatesByCountryId_ThrowsException_WhenApiReturnsError()
        {
            // Arrange
            var countryId = 99;
            var handler = new TestHttpMessageHandler((request, token) =>
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("error")
                });
            });
            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var api = new RequestEnrichmentApi(client);

            // Act & Assert
            var ex = Assert.ThrowsAsync<RequestEnrichmentException>(async () =>
                await api.GetApprovedStatesByCountryId(countryId));
            Assert.That(ex.Message, Does.Contain("Failed to retrieve approved states"));
        }
    }
}