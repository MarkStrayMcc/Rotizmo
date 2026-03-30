using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using Hero.Integration.SubjectivityConfigurationApi;
using Hero.Models.SubjectivityConfiguration;

namespace Hero.Tests.Integration;

[TestFixture]
public class SubjectivityConfigurationApiTests
{
    private HttpMessageHandler _mockHttpMessageHandler = null!;
    private ISubjectivityConfigurationApi _api = null!;

    [SetUp]
    public void SetUp()
    {
        _mockHttpMessageHandler = Substitute.For<HttpMessageHandler>();
        var client = new HttpClient(_mockHttpMessageHandler) { BaseAddress = new Uri("https://dev-subjectivity-configuration.cfcapps.com/") };
        _api = new SubjectivityConfigurationApi(client);
    }

    [Test]
    public async Task Filter_WithSearchSubjectivitiesQuery_ReturnsSearchSubjectivitiesResults()
    {
        // Arrange
        ConfigureMockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = JsonContent.Create(GetTestSearchSubjectivitiesResults())
        });
        var query = new SearchSubjectivitiesQuery { LanguageIsoCode = "en", ProductCode = "CPM", CountryIsoCode = "US", StateIsoCode = "CA" };

        // Act
        var results = await _api.Filter(query);

        // Assert
        Assert.That(results, Is.Not.Null);
        Assert.That(results, Has.Count.EqualTo(3));
    }

    [Test]
    public void Filter_WithInvalidSearchSubjectivitiesQuery_ThrowsInvalidOperationException()
    {
        // Arrange
        ConfigureMockHttpMessageHandler(new HttpResponseMessage { StatusCode = HttpStatusCode.BadRequest });
        var query = new SearchSubjectivitiesQuery { LanguageIsoCode = "english", CountryIsoCode = "United States of America" };

        // Assert
        Assert.ThrowsAsync<InvalidOperationException>(async () => await _api.Filter(query));
    }

    [TearDown]
    public void TearDown()
    {
        _mockHttpMessageHandler.Dispose();
    }

    private void ConfigureMockHttpMessageHandler(HttpResponseMessage httpResponseMessage)
    {
        _mockHttpMessageHandler.GetType().GetMethod("SendAsync", BindingFlags.NonPublic | BindingFlags.Instance)!
            .Invoke(_mockHttpMessageHandler, new object[] { Arg.Any<HttpRequestMessage>(), Arg.Any<CancellationToken>() })
            .Returns(Task.FromResult(httpResponseMessage));
    }

    private static List<SearchSubjectivitiesResult> GetTestSearchSubjectivitiesResults()
    {
        return new List<SearchSubjectivitiesResult>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Texts = new List<SubjectivityText> { new() { LanguageIsoCode = "en", Text = "Test subjectivity 1" } },
                Type = "confirmation"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Texts = new List<SubjectivityText> { new() { LanguageIsoCode = "en", Text = "Test subjectivity 2" } },
                Type = "document"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Texts = new List<SubjectivityText> { new() { LanguageIsoCode = "en", Text = "Test subjectivity 3" } },
                Type = "date"
            }
        };
    }
}
