using Hero.Integration.BlastZoneApi;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models.BlastZone;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using Hero.Models;

namespace Hero.Tests.Integration.BlastZone;

[TestFixture]
public class BlastZoneApiTests
{
    private HttpMessageHandler _mockHttpMessageHandler = null!;
    private HttpClient _httpClient = null!;
    private IBlastZoneApi _blastZoneApi = null!;
    private ILocationApi _locationApi = null!;
    private IConfiguration _configuration = null!;

    [SetUp]
    public void SetUp()
    {
        _mockHttpMessageHandler = Substitute.For<HttpMessageHandler>();
        _locationApi = Substitute.For<ILocationApi>();
        _configuration = Substitute.For<IConfiguration>();
        _httpClient = new HttpClient(_mockHttpMessageHandler) { BaseAddress = new Uri("https://dev-blast-zone.cfcapps.com/") };
        _blastZoneApi = new BlastZoneApi(_httpClient, _locationApi, _configuration);
    }

    [TearDown]
    public void TearDown()
    {
        _httpClient.Dispose();
        _mockHttpMessageHandler.Dispose();
    }

    [Test]
    public async Task GetBatchBlastZoneCapacity_Returns_BlastZoneResultWithCapacity()
    {
        // Arrange
        var propertyLimits = TestFixtures.PropertyLimits();
        var blastZoneReservations = new List<BlastZoneReservation>();
        var blastZoneReservationRequests = new List<BlastZoneCapacityRequest>();

        foreach (var propertyLimit in propertyLimits)
        {
            blastZoneReservations.Add(TestFixtures.BlastZoneCapacityResultWithCapacityAndReservationId(propertyLimit.RatingReference!.Value));
            blastZoneReservationRequests.Add(TestFixtures.BlastZoneCapacityRequestWithId(propertyLimit.RatingReference!.Value));
        }

        ConfigureMockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = JsonContent.Create(blastZoneReservations)
        });

        // Act
        List<BlastZoneWithPropertyLimitResult> results = await _blastZoneApi.GetBatchBlastZoneCapacityCheck(
            TestFixtures.BatchBlastZoneCapacityCheck(blastZoneReservationRequests),
            propertyLimits,
            1.0m);

        // Assert
        var requestUri = GetCallRequestUri();
        requestUri!.AbsoluteUri.Should().Be("https://dev-blast-zone.cfcapps.com/api/check-blast-zone-capacity");

        results.Should().NotBeNull();
        results.First().Should().NotBeNull();
        results.First().BlastZoneCapacityResult.AvailableLimit.Should().Be(1000000);
    }

    [Test]
    public async Task CreateBatchBlastZoneReservation_Returns_BlastZoneResultWithCapacity()
    {
        // Arrange
        var blastZoneReservationId = Guid.NewGuid();
        var blastZoneClientReservationId = Guid.NewGuid();

        var batchBlastZoneCapacityCreate = new BatchBlastZoneCapacityCreate()
        {
            Reservations = new List<BlastZoneCapacityRequest>
            {
                TestFixtures.BlastZoneCapacityRequestWithId(blastZoneReservationId)
            },
            ReservationExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityEndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityStartDate = DateOnly.FromDateTime(DateTime.Now).ToString("O"),
            Id = blastZoneClientReservationId
        };

        ConfigureMockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = JsonContent.Create(TestFixtures.CreateMockResponseForCreate(batchBlastZoneCapacityCreate))
        });

        var query = TestFixtures.BlastZoneCapacityRequest();

        // Act
        var results = await _blastZoneApi.CreateBatchBlastZoneReservations(batchBlastZoneCapacityCreate);

        // Assert
        var requestUri = GetCallRequestUri();
        requestUri!.AbsoluteUri.Should().Be("https://dev-blast-zone.cfcapps.com/api/blast-zone-reservation-groups");

        results.Should().NotBeNull();
        results.Id.Should().NotBeEmpty();
        results.Id.Should().Be(blastZoneClientReservationId);
        results.Reservations.Should().NotBeNullOrEmpty();
        results.Reservations.First().HasCapacity.Should().BeTrue();
        results.Reservations.First().AvailableLimit.Should().Be(1000000);
    }

    [Test]
    public async Task UpdateBatchBlastZoneReservation_Returns_BatchBlastZoneCreateResult()
    {
        // Arrange
        var blastZoneReservationId = Guid.NewGuid();
        var blastZoneClientReservationId = Guid.NewGuid();

        var batchBlastZoneCapacityCreate = new BatchBlastZoneCapacityCreate()
        {
            Reservations = new List<BlastZoneCapacityRequest>
            {
                TestFixtures.BlastZoneCapacityRequestWithId(blastZoneReservationId)
            },
            ReservationExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityEndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityStartDate = DateOnly.FromDateTime(DateTime.Now).ToString("O"),
            Id = blastZoneClientReservationId
        };

        ConfigureMockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = JsonContent.Create(TestFixtures.CreateMockResponseForUpdate(batchBlastZoneCapacityCreate))
        });

        // Act
        var results = await _blastZoneApi.UpdateBatchBlastZoneReservations(batchBlastZoneCapacityCreate);

        // Assert
        var requestUri = GetCallRequestUri();
        requestUri!.AbsoluteUri.Should().Be($"https://dev-blast-zone.cfcapps.com/api/blast-zone-reservation-groups/{blastZoneClientReservationId}");

        results.Should().NotBeNull();
        results.Reservations.Should().NotBeNullOrEmpty();
        results.Reservations.First().HasCapacity.Should().BeTrue();
        results.Reservations.First().AvailableLimit.Should().Be(1000000);
        results.Id.Should().Be(blastZoneClientReservationId);
    }

    [Test]
    public async Task GetBlastZoneReservations_Returns_BlastZoneReservationGetResponse()
    {
        // Arrange
        var reservationGroupId = Guid.NewGuid();
        var expectedResponse = new BlastZoneReservationGetResponse
        {
            Id = reservationGroupId,
            ClientId = Guid.NewGuid(),
            IsRenewable = true,
            CapacityStartDate = DateOnly.FromDateTime(DateTime.Now).ToString("O"),
            CapacityEndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            FloatingValue = 1000000,
            Reservations = new List<BlastZoneCapacityRequest> { }
        };

        ConfigureMockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = JsonContent.Create(expectedResponse)
        });

        // Act
        var result = await _blastZoneApi.GetBlastZoneReservations(reservationGroupId);

        // Assert
        var requestUri = GetCallRequestUri();
        requestUri!.AbsoluteUri.Should().Be($"https://dev-blast-zone.cfcapps.com/api/{reservationGroupId}");

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(reservationGroupId));
        Assert.That(result.Reservations, Is.Not.Null);
    }

    [Test]
    public async Task DeleteBlastZoneReservations_ReturnsTrue_WhenApiReturnsSuccess()
    {
        // Arrange
        var reservationGroupId = Guid.NewGuid();
        ConfigureMockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK
        });

        // Act
        var result = await _blastZoneApi.DeleteBlastZoneReservations(reservationGroupId);

        // Assert
        var requestUri = GetCallRequestUri();
        requestUri!.AbsoluteUri.Should().Be($"https://dev-blast-zone.cfcapps.com/api/{reservationGroupId}");
        Assert.That(result, Is.True);
    }

    [Test]
    public async Task DeleteBlastZoneReservations_ReturnsFalse_WhenApiReturnsFailure()
    {
        // Arrange
        var reservationGroupId = Guid.NewGuid();
        ConfigureMockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.BadRequest
        });

        // Act
        var result = await _blastZoneApi.DeleteBlastZoneReservations(reservationGroupId);

        // Assert
        var requestUri = GetCallRequestUri();
        requestUri!.AbsoluteUri.Should().Be($"https://dev-blast-zone.cfcapps.com/api/{reservationGroupId}");
        Assert.That(result, Is.False);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacity_SetsConversionRateOnResultsAndPropertyLimits()
    {
        const decimal exchangeRate = 0.82m;

        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        PropertyLimit propertyLimit = propertyLimits.First();
        var blastZoneReservations = new List<BlastZoneReservation>
        {
            TestFixtures.BlastZoneCapacityResultWithCapacityAndReservationId(propertyLimit.RatingReference!.Value),
        };

        var blastZoneReservationRequests = new List<BlastZoneCapacityRequest>
        {
            TestFixtures.BlastZoneCapacityRequestWithId(propertyLimit.RatingReference!.Value),
        };

        using var responseMessage = new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = JsonContent.Create(blastZoneReservations),
        };

        ConfigureMockHttpMessageHandler(responseMessage);

        List<BlastZoneWithPropertyLimitResult> results = await _blastZoneApi.GetBatchBlastZoneCapacityCheck(
            TestFixtures.BatchBlastZoneCapacityCheck(blastZoneReservationRequests),
            propertyLimits,
            exchangeRate);

        results.Should().NotBeNullOrEmpty();
        results.First().ConversionRate.Should().Be(exchangeRate);
        results.First().PropertyLimit.Should().NotBeNull();
        results.First().PropertyLimit!.ConversionRate.Should().Be(exchangeRate);
    }

    private void ConfigureMockHttpMessageHandler(HttpResponseMessage httpResponseMessage)
    {
        _mockHttpMessageHandler.GetType().GetMethod("SendAsync", BindingFlags.NonPublic | BindingFlags.Instance)!
            .Invoke(_mockHttpMessageHandler, new object[] { Arg.Any<HttpRequestMessage>(), Arg.Any<CancellationToken>() })
            .Returns(Task.FromResult(httpResponseMessage));
    }

    private Uri? GetCallRequestUri()
    {
        var calls = _mockHttpMessageHandler.ReceivedCalls()
            .Select(call => call.GetOriginalArguments().First())
            .Cast<HttpRequestMessage>();
        var requestUri = calls.First().RequestUri;
        return requestUri;
    }
}
