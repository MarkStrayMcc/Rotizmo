using System.Net;
using System.Net.Http.Json;
using Hero.Integration.HeroEmails;
using Hero.Models;
using Hero.Tests.Helpers;

namespace Hero.Tests.Integration.HeroEmails
{
    public class QuoteDocumentServiceTests
    {
        [Test]
        public async Task GetQuoteRelatedDocumentsAsync_ReturnsList_WhenResponseIsNotNull()
        {
            // Arrange
            var quoteUid = Guid.NewGuid();
            var expectedList = new List<FileData>
            {
                new FileData { Name = "file1.pdf" },
                new FileData { Name = "file2.pdf" }
            };

            var handler = new TestHttpMessageHandler((request, token) =>
            {
                Assert.That(request.RequestUri.ToString(), Does.Contain($"{quoteUid}/documents"));
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(expectedList)
                });
            });

            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var service = new QuoteDocumentService(client);

            // Act
            var result = await service.GetQuoteRelatedDocumentsAsync(quoteUid);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count, Is.EqualTo(2));
            Assert.That(result[0].Name, Is.EqualTo("file1.pdf"));
        }

        [Test]
        public async Task GetQuoteRelatedDocumentsAsync_ReturnsEmptyList_WhenResponseIsNull()
        {
            // Arrange
            var quoteUid = Guid.NewGuid();

            var handler = new TestHttpMessageHandler((request, token) =>
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("null", System.Text.Encoding.UTF8, "application/json")
                });
            });

            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var service = new QuoteDocumentService(client);

            // Act
            var result = await service.GetQuoteRelatedDocumentsAsync(quoteUid);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Empty);
        }

        [Test]
        public async Task GetQuoteDocumentAsync_ReturnsFileData_WhenResponseIsNotNull()
        {
            // Arrange
            var quoteUid = Guid.NewGuid();
            var expectedFile = new QuoteFileData { FileName = "file1.pdf" };

            var handler = new TestHttpMessageHandler((request, token) =>
            {
                Assert.That(request.RequestUri.ToString(), Does.Contain($"QuoteUid={quoteUid}"));
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = JsonContent.Create(expectedFile)
                });
            });

            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var service = new QuoteDocumentService(client);

            // Act
            var result = await service.GetQuoteAdditionalDocumentAsync(quoteUid);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.FileName, Is.EqualTo("file1.pdf"));
        }

        [Test]
        public async Task GetQuoteDocumentAsync_ReturnsNewFileData_WhenResponseIsNull()
        {
            // Arrange
            var quoteUid = Guid.NewGuid();

            var handler = new TestHttpMessageHandler((request, token) =>
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("null", System.Text.Encoding.UTF8, "application/json")
                });
            });

            var client = new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") };
            var service = new QuoteDocumentService(client);

            // Act
            var result = await service.GetQuoteAdditionalDocumentAsync(quoteUid);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.FileName, Is.Null.Or.Empty);
        }
    }
}