using Hero.Integration.BlastZoneApi;
using Hero.Integration.CurrencyConversion;
using Hero.Models;
using Hero.Models.BlastZone;

namespace Hero.Tests.Integration.BlastZone;

[TestFixture]
public sealed class BlastZoneServiceTests
{
    private IBlastZoneService _blastZoneService;
    private IBlastZoneApi _mockBlastZoneApi;
    private ICurrencyConversionService _currencyConversionService;

    [SetUp]
    public void SetUp()
    {
        _mockBlastZoneApi = Substitute.For<IBlastZoneApi>();
        _currencyConversionService = Substitute.For<ICurrencyConversionService>();
        _blastZoneService = new BlastZoneService(_mockBlastZoneApi, _currencyConversionService);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacitiesAsync_ShouldReturnListOfBlastZoneCapacityResults()
    {
        // Arrange
        var expectedBlastZoneReservationId = Guid.NewGuid();
        var propertyLimits = TestFixtures.PropertyLimitsWithBlastZoneReservationId(expectedBlastZoneReservationId);
        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits, expectedBlastZoneReservationId);
        var expectedResponse = new List<BlastZoneWithPropertyLimitResult>
        {
            new()
            {
                PropertyLimit = propertyLimits.First(),
                BlastZoneCapacityResult = TestFixtures.BlastZoneCapacityResultWithCapacity()
            }
        };

        _mockBlastZoneApi
           .GetBatchBlastZoneCapacityCheck(Arg.Any<BatchBlastZoneCapacityCheck>(), Arg.Any<List<PropertyLimit>>(), Arg.Any<decimal>())
           .Returns(expectedResponse);

        // Act
        var result = await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(propertyLimitBlastZoneCapacityRequest);

        // Assert
        result.Should().NotBeNull();
        result.Count.Should().Be(1);
        result.First().BlastZoneCapacityResult.HasCapacity.Should().BeTrue();
        result.First().BlastZoneCapacityResult.AvailableLimit.Should().Be(400000);
        await _mockBlastZoneApi.Received(1).GetBatchBlastZoneCapacityCheck(
            Arg.Is<BatchBlastZoneCapacityCheck>(req => req.OriginalGroupId == expectedBlastZoneReservationId),
            Arg.Any<List<PropertyLimit>>(),
            Arg.Any<decimal>());
    }

    [Test]
    public async Task UpdateBatchBlastZoneReservations_ShouldUpdateExistingReservationsAndReturnTrue()
    {
        // Arrange
        var blastZoneReservationId = Guid.NewGuid();
        var blastZoneClientReservationId = Guid.NewGuid();
        var propertyLimits = TestFixtures.PropertyLimits();

        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        var batchBlastZoneCapacityCreate = new BatchBlastZoneCapacityCreate()
        {
            Reservations = new List<BlastZoneCapacityRequest>
            {
                TestFixtures.BlastZoneCapacityRequestWithId(blastZoneReservationId)
            },
            ReservationExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityEndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityStartDate = DateOnly.FromDateTime(DateTime.Now).ToString("O"),
            Id = blastZoneClientReservationId,
            ClientId = Guid.NewGuid()
        };

        var expectedResponse = new BatchBlastZoneCreateResult
        {
            Id = blastZoneClientReservationId,
            Reservations = TestFixtures.CreateMockResponseForUpdate(batchBlastZoneCapacityCreate)
        };

        _mockBlastZoneApi.UpdateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>()).Returns(expectedResponse);

        // Act
        var result = await _blastZoneService.UpdateBatchBlastZoneReservations(propertyLimitBlastZoneCapacityRequest);

        // Assert
        result.Should().NotBeNull();
        result.BlastZoneCheckResult.Should().BeTrue();
        await _mockBlastZoneApi.Received(1).UpdateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>());
    }

    [Test]
    public async Task CreateBatchBlastZoneReservations_ShouldUpdateExistingReservationAndReturnListOfPropertyLimits()
    {
        // Arrange
        var blastZoneReservationId = Guid.NewGuid();
        var blastZoneClientReservationId = Guid.NewGuid();
        var propertyLimits = TestFixtures.PropertyLimits();

        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        var batchBlastZoneCapacityCreate = new BatchBlastZoneCapacityCreate()
        {
            Reservations = new List<BlastZoneCapacityRequest>
            {
                TestFixtures.BlastZoneCapacityRequestWithId(blastZoneReservationId)
            },
            ReservationExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityEndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)).ToString("O"),
            CapacityStartDate = DateOnly.FromDateTime(DateTime.Now).ToString("O"),
            Id = blastZoneClientReservationId,
            ClientId = Guid.NewGuid()
        };

        var expectedResponse = TestFixtures.CreateMockResponseForCreate(batchBlastZoneCapacityCreate);

        _mockBlastZoneApi.CreateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>()).Returns(expectedResponse);

        // Act
        var result = await _blastZoneService.CreateBatchBlastZoneReservations(propertyLimitBlastZoneCapacityRequest);

        // Assert
        result.BlastZoneCheckResult.Should().BeTrue();
        result.PropertyLimits.Count.Should().Be(1);
        result.PropertyLimits.First().BlastZoneReservationId.Should().Be(blastZoneClientReservationId);
        await _mockBlastZoneApi.Received(1).CreateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>());
    }

    [Test]
    public async Task GetBlastZoneReservations_ShouldReturnReservationGetResponse()
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
            Reservations = new List<BlastZoneCapacityRequest>
            {
                new BlastZoneCapacityRequest { Id = Guid.NewGuid(), Exposure = 500000 }
            }
        };

        _mockBlastZoneApi.GetBlastZoneReservations(reservationGroupId).Returns(expectedResponse);

        // Act
        var result = await _blastZoneService.GetBlastZoneReservations(reservationGroupId);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(reservationGroupId));
        Assert.That(result.Reservations, Is.Not.Null);
        Assert.That(result.Reservations.Count, Is.EqualTo(1));
        Assert.That(result.Reservations.First().Exposure, Is.EqualTo(500000));
        await _mockBlastZoneApi.Received(1).GetBlastZoneReservations(reservationGroupId);
    }

    [Test]
    public async Task DeleteBlastZoneReservations_ShouldReturnTrue_WhenApiReturnsTrue()
    {
        // Arrange
        var reservationGroupId = Guid.NewGuid();
        _mockBlastZoneApi.DeleteBlastZoneReservations(reservationGroupId).Returns(true);

        // Act
        var result = await _blastZoneService.DeleteBlastZoneReservations(reservationGroupId);

        // Assert
        Assert.That(result, Is.True);
        await _mockBlastZoneApi.Received(1).DeleteBlastZoneReservations(reservationGroupId);
    }

    [Test]
    public async Task DeleteBlastZoneReservations_ShouldReturnFalse_WhenApiReturnsFalse()
    {
        // Arrange
        var reservationGroupId = Guid.NewGuid();
        _mockBlastZoneApi.DeleteBlastZoneReservations(reservationGroupId).Returns(false);

        // Act
        var result = await _blastZoneService.DeleteBlastZoneReservations(reservationGroupId);

        // Assert
        Assert.That(result, Is.False);
        await _mockBlastZoneApi.Received(1).DeleteBlastZoneReservations(reservationGroupId);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacitiesAsync_WhenOverriddenCoordinatesExist_ShouldUseOverriddenCoordinates()
    {
        // Arrange
        var propertyLimits = new List<PropertyLimit>
        {
            new()
            {
                PropertyLimitId = 1,
                ContentsDamageLimit = 100000,
                PropertyDamageLimit = 100000,
                ActualLossSustainedLimit = 100000,
                IncreasedCostOfWorkingLimit = 100000,
                LossOfRentLimit = 100000,
                AlternativeAccommodationLimit = 100000,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Postcode = "TN1 1AA",
                    Address1 = "1 Test Street",
                    City = "Test City",
                    Latitude = 51.123456,  // Google API coordinates
                    Longitude = -0.123456,
                    OverriddenLatitude = 51.999999,  // User-provided coordinates (different)
                    OverriddenLongitude = -0.999999
                }
            }
        };

        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        BatchBlastZoneCapacityCheck? capturedRequest = null;
        _mockBlastZoneApi
            .GetBatchBlastZoneCapacityCheck(Arg.Do<BatchBlastZoneCapacityCheck>(x => capturedRequest = x), Arg.Any<List<PropertyLimit>>(), Arg.Any<decimal>())
            .Returns(new List<BlastZoneWithPropertyLimitResult>());

        // Act
        await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(propertyLimitBlastZoneCapacityRequest);

        // Assert - Should use overridden coordinates, not Google API coordinates
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Properties.First().Location.Latitude.Should().Be(51.999999);
        capturedRequest.Properties.First().Location.Longitude.Should().Be(-0.999999);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacitiesAsync_WhenNoOverriddenCoordinates_ShouldUseGoogleApiCoordinates()
    {
        // Arrange
        var propertyLimits = new List<PropertyLimit>
        {
            new()
            {
                PropertyLimitId = 1,
                ContentsDamageLimit = 100000,
                PropertyDamageLimit = 100000,
                ActualLossSustainedLimit = 100000,
                IncreasedCostOfWorkingLimit = 100000,
                LossOfRentLimit = 100000,
                AlternativeAccommodationLimit = 100000,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Postcode = "TN1 1AA",
                    Address1 = "1 Test Street",
                    City = "Test City",
                    Latitude = 51.123456,  // Google API coordinates
                    Longitude = -0.123456,
                    OverriddenLatitude = null,  // No overridden coordinates
                    OverriddenLongitude = null
                }
            }
        };

        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        BatchBlastZoneCapacityCheck? capturedRequest = null;
        _mockBlastZoneApi
            .GetBatchBlastZoneCapacityCheck(Arg.Do<BatchBlastZoneCapacityCheck>(x => capturedRequest = x), Arg.Any<List<PropertyLimit>>(), Arg.Any<decimal>())
            .Returns(new List<BlastZoneWithPropertyLimitResult>());

        // Act
        await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(propertyLimitBlastZoneCapacityRequest);

        // Assert - Should use Google API coordinates
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Properties.First().Location.Latitude.Should().Be(51.123456);
        capturedRequest.Properties.First().Location.Longitude.Should().Be(-0.123456);
    }

    [Test]
    public async Task CreateBatchBlastZoneReservations_WhenOverriddenCoordinatesExist_ShouldUseOverriddenCoordinates()
    {
        // Arrange
        var propertyLimits = new List<PropertyLimit>
        {
            new()
            {
                PropertyLimitId = 1,
                ContentsDamageLimit = 100000,
                PropertyDamageLimit = 100000,
                ActualLossSustainedLimit = 100000,
                IncreasedCostOfWorkingLimit = 100000,
                LossOfRentLimit = 100000,
                AlternativeAccommodationLimit = 100000,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Postcode = "TN1 1AA",
                    Address1 = "1 Test Street",
                    City = "Test City",
                    Latitude = 51.123456,  // Google API coordinates
                    Longitude = -0.123456,
                    OverriddenLatitude = 51.888888,  // User-provided coordinates (different)
                    OverriddenLongitude = -0.888888
                }
            }
        };

        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        BatchBlastZoneCapacityCreate? capturedRequest = null;
        _mockBlastZoneApi.CreateBatchBlastZoneReservations(Arg.Do<BatchBlastZoneCapacityCreate>(x => capturedRequest = x))
            .Returns(new BatchBlastZoneCreateResult
            {
                Id = Guid.NewGuid(),
                Reservations = new List<BlastZoneReservation>
                {
                    new() { Id = propertyLimits.First().RatingReference!.Value, HasCapacity = true, AvailableLimit = 1000000 }
                }
            });

        // Act
        await _blastZoneService.CreateBatchBlastZoneReservations(propertyLimitBlastZoneCapacityRequest);

        // Assert - Should use overridden coordinates, not Google API coordinates
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Reservations.First().Location.Latitude.Should().Be(51.888888);
        capturedRequest.Reservations.First().Location.Longitude.Should().Be(-0.888888);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacitiesAsync_WhenOnlyOverriddenLatitudeProvided_ShouldUseGoogleApiCoordinates()
    {
        // Arrange - Only latitude is overridden, longitude is null
        var propertyLimits = new List<PropertyLimit>
        {
            new()
            {
                PropertyLimitId = 1,
                ContentsDamageLimit = 100000,
                PropertyDamageLimit = 100000,
                ActualLossSustainedLimit = 100000,
                IncreasedCostOfWorkingLimit = 100000,
                LossOfRentLimit = 100000,
                AlternativeAccommodationLimit = 100000,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Postcode = "TN1 1AA",
                    Address1 = "1 Test Street",
                    City = "Test City",
                    Latitude = 51.123456,  // Google API coordinates
                    Longitude = -0.123456,
                    OverriddenLatitude = 51.999999,  // Only latitude overridden
                    OverriddenLongitude = null       // Longitude NOT overridden
                }
            }
        };

        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        BatchBlastZoneCapacityCheck? capturedRequest = null;
        _mockBlastZoneApi
            .GetBatchBlastZoneCapacityCheck(Arg.Do<BatchBlastZoneCapacityCheck>(x => capturedRequest = x), Arg.Any<List<PropertyLimit>>(), Arg.Any<decimal>())
            .Returns(new List<BlastZoneWithPropertyLimitResult>());

        // Act
        await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(propertyLimitBlastZoneCapacityRequest);

        // Assert - Should use Google API coordinates because BOTH overridden values are not present
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Properties.First().Location.Latitude.Should().Be(51.123456);
        capturedRequest.Properties.First().Location.Longitude.Should().Be(-0.123456);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacitiesAsync_WhenOnlyOverriddenLongitudeProvided_ShouldUseGoogleApiCoordinates()
    {
        // Arrange - Only longitude is overridden, latitude is null
        var propertyLimits = new List<PropertyLimit>
        {
            new()
            {
                PropertyLimitId = 1,
                ContentsDamageLimit = 100000,
                PropertyDamageLimit = 100000,
                ActualLossSustainedLimit = 100000,
                IncreasedCostOfWorkingLimit = 100000,
                LossOfRentLimit = 100000,
                AlternativeAccommodationLimit = 100000,
                InsuredAddress = new ClientLocation()
                {
                    CountryId = 1,
                    Postcode = "TN1 1AA",
                    Address1 = "1 Test Street",
                    City = "Test City",
                    Latitude = 51.123456,  // Google API coordinates
                    Longitude = -0.123456,
                    OverriddenLatitude = null,       // Latitude NOT overridden
                    OverriddenLongitude = -0.999999  // Only longitude overridden
                }
            }
        };

        var propertyLimitBlastZoneCapacityRequest = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        BatchBlastZoneCapacityCheck? capturedRequest = null;
        _mockBlastZoneApi
            .GetBatchBlastZoneCapacityCheck(Arg.Do<BatchBlastZoneCapacityCheck>(x => capturedRequest = x), Arg.Any<List<PropertyLimit>>(), Arg.Any<decimal>())
            .Returns(new List<BlastZoneWithPropertyLimitResult>());

        // Act
        await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(propertyLimitBlastZoneCapacityRequest);

        // Assert - Should use Google API coordinates because BOTH overridden values are not present
        capturedRequest.Should().NotBeNull();
        capturedRequest!.Properties.First().Location.Latitude.Should().Be(51.123456);
        capturedRequest.Properties.First().Location.Longitude.Should().Be(-0.123456);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacitiesWithPropertyLimits_CallsCurrencyConversionServiceWithRequestParameters()
    {
        const int expectedBinderSectionId = 1289;
        const string expectedIsoCode = "CAD";

        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        PropertyLimitBlastZoneCapacityRequest request = TestFixtures.PropertyLimitBlastZoneCapacityRequest(
            propertyLimits: propertyLimits,
            binderSectionId: expectedBinderSectionId,
            quoteCurrencyIsoCode: expectedIsoCode);

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(1.0m);
        _mockBlastZoneApi
            .GetBatchBlastZoneCapacityCheck(Arg.Any<BatchBlastZoneCapacityCheck>(), Arg.Any<IReadOnlyList<PropertyLimit>>(), Arg.Any<decimal>())
            .Returns(new List<BlastZoneWithPropertyLimitResult>());

        await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(request);

        _currencyConversionService.Received(1).GetConversionRate(expectedBinderSectionId, expectedIsoCode);
    }

    [Test]
    public async Task CreateBatchBlastZoneReservations_CallsCurrencyConversionServiceWithRequestParameters()
    {
        const int expectedBinderSectionId = 1289;
        const string expectedIsoCode = "USD";

        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        PropertyLimitBlastZoneCapacityRequest request = TestFixtures.PropertyLimitBlastZoneCapacityRequest(
            propertyLimits,
            binderSectionId: expectedBinderSectionId,
            quoteCurrencyIsoCode: expectedIsoCode);

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(1.0m);
        _mockBlastZoneApi.CreateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>())
            .Returns(new BatchBlastZoneCreateResult { Id = Guid.NewGuid(), Reservations = new List<BlastZoneReservation>() });

        await _blastZoneService.CreateBatchBlastZoneReservations(request);

        _currencyConversionService.Received(1).GetConversionRate(expectedBinderSectionId, expectedIsoCode);
    }

    [Test]
    public async Task UpdateBatchBlastZoneReservations_CallsCurrencyConversionServiceWithRequestParameters()
    {
        const int expectedBinderSectionId = 1289;
        const string expectedIsoCode = "EUR";

        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        PropertyLimitBlastZoneCapacityRequest request = TestFixtures.PropertyLimitBlastZoneCapacityRequest(
            propertyLimits,
            binderSectionId: expectedBinderSectionId,
            quoteCurrencyIsoCode: expectedIsoCode);

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(1.0m);
        _mockBlastZoneApi.UpdateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>())
            .Returns(new BatchBlastZoneCreateResult { Id = Guid.NewGuid(), Reservations = new List<BlastZoneReservation>() });

        await _blastZoneService.UpdateBatchBlastZoneReservations(request);

        _currencyConversionService.Received(1).GetConversionRate(expectedBinderSectionId, expectedIsoCode);
    }

    [Test]
    public async Task CreateBatchBlastZoneReservations_ConvertsExposureAndFinancialValuesToOutboundRequest()
    {
        const decimal rate = 0.5m;

        var propertyLimits = new List<PropertyLimit>
        {
            new()
            {
                ContentsDamageLimit   = 100000,
                PropertyDamageLimit   = 100000,
                ActualLossSustainedLimit = 100000,
                InsuredAddress = new ClientLocation { Latitude = 51.1, Longitude = -0.1 },
            }
        };

        var request = new PropertyLimitBlastZoneCapacityRequest
        {
            PropertyLimits = propertyLimits,
            FirstLossLimitValue = 200001,
            FloatingValue = 60000,
            InceptionDate = DateTime.Now,
            ExpiryDate = DateTime.Now.AddDays(1),
            ReservationExpiryDate = DateTime.Now.AddDays(1),
            ClientId = Guid.NewGuid(),
        };

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(rate);

        BatchBlastZoneCapacityCreate? capturedRequest = null;
        _mockBlastZoneApi
            .CreateBatchBlastZoneReservations(Arg.Do<BatchBlastZoneCapacityCreate>(r => capturedRequest = r))
            .Returns(new BatchBlastZoneCreateResult { Id = Guid.NewGuid(), Reservations = new List<BlastZoneReservation>() });

        await _blastZoneService.CreateBatchBlastZoneReservations(request);

        capturedRequest.Should().NotBeNull();
        capturedRequest!.FloatingValue.Should().Be(30000L);
        capturedRequest.FirstLossLimit.Should().Be(100001L);
    }

    [Test]
    public async Task UpdateBatchBlastZoneReservations_ConvertsExposureAndFinancialValuesToOutboundRequest()
    {
        const decimal rate = 0.75m;

        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        var request = new PropertyLimitBlastZoneCapacityRequest
        {
            PropertyLimits = propertyLimits,
            FirstLossLimitValue = 200000,
            FloatingValue = 80000,
            InceptionDate = DateTime.Now,
            ExpiryDate = DateTime.Now.AddDays(1),
            ReservationExpiryDate = DateTime.Now.AddDays(1),
            ClientId = Guid.NewGuid(),
        };

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(rate);

        BatchBlastZoneCapacityCreate? capturedRequest = null;
        _mockBlastZoneApi
            .UpdateBatchBlastZoneReservations(Arg.Do<BatchBlastZoneCapacityCreate>(r => capturedRequest = r))
            .Returns(new BatchBlastZoneCreateResult { Id = Guid.NewGuid(), Reservations = new List<BlastZoneReservation>() });

        await _blastZoneService.UpdateBatchBlastZoneReservations(request);

        capturedRequest.Should().NotBeNull();
        capturedRequest!.FloatingValue.Should().Be(60000L);
        capturedRequest.FirstLossLimit.Should().Be(150000L);
    }

    [Test]
    public async Task CreateBatchBlastZoneReservations_AppliesPositiveInfinityRoundingToConvertedValues()
    {
        const decimal rate = 0.1m;

        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        var request = new PropertyLimitBlastZoneCapacityRequest
        {
            PropertyLimits = propertyLimits,
            FirstLossLimitValue = 3,
            FloatingValue = 7,
            InceptionDate = DateTime.Now,
            ExpiryDate = DateTime.Now.AddDays(1),
            ReservationExpiryDate = DateTime.Now.AddDays(1),
            ClientId = Guid.NewGuid(),
        };

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(rate);

        BatchBlastZoneCapacityCreate? capturedRequest = null;
        _mockBlastZoneApi
            .CreateBatchBlastZoneReservations(Arg.Do<BatchBlastZoneCapacityCreate>(r => capturedRequest = r))
            .Returns(new BatchBlastZoneCreateResult { Id = Guid.NewGuid(), Reservations = new List<BlastZoneReservation>() });

        await _blastZoneService.CreateBatchBlastZoneReservations(request);

        capturedRequest.Should().NotBeNull();
        capturedRequest!.FirstLossLimit.Should().Be(1L);
        capturedRequest.FloatingValue.Should().Be(1L);
    }

    [Test]
    public async Task CreateBatchBlastZoneReservations_WhenFirstLossLimitIsNull_SendsZeroToApi()
    {
        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        var request = new PropertyLimitBlastZoneCapacityRequest
        {
            PropertyLimits = propertyLimits,
            FirstLossLimitValue = null,
            FloatingValue = 0,
            InceptionDate = DateTime.Now,
            ExpiryDate = DateTime.Now.AddDays(1),
            ReservationExpiryDate = DateTime.Now.AddDays(1),
            ClientId = Guid.NewGuid(),
        };

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(1.5m);

        BatchBlastZoneCapacityCreate? capturedRequest = null;
        _mockBlastZoneApi
            .CreateBatchBlastZoneReservations(Arg.Do<BatchBlastZoneCapacityCreate>(r => capturedRequest = r))
            .Returns(new BatchBlastZoneCreateResult { Id = Guid.NewGuid(), Reservations = new List<BlastZoneReservation>() });

        await _blastZoneService.CreateBatchBlastZoneReservations(request);

        capturedRequest.Should().NotBeNull();
        capturedRequest!.FirstLossLimit.Should().Be(0L);
    }

    [Test]
    public async Task CreateBatchBlastZoneReservations_SetsConversionRateOnReturnedPropertyLimits()
    {
        const decimal rate = 0.82m;

        var blastZoneClientReservationId = Guid.NewGuid();
        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        PropertyLimitBlastZoneCapacityRequest request = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(rate);
        _mockBlastZoneApi.CreateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>())
            .Returns(new BatchBlastZoneCreateResult
            {
                Id = blastZoneClientReservationId,
                Reservations = new List<BlastZoneReservation>
                {
                    new() { Id = propertyLimits.First().RatingReference!.Value, HasCapacity = true, AvailableLimit = 500000 }
                }
            });

        PropertyLimitBlastZoneCapacityResponse result = await _blastZoneService.CreateBatchBlastZoneReservations(request);

        result.PropertyLimits.Should().NotBeNullOrEmpty();
        result.PropertyLimits.First().ConversionRate.Should().Be(rate);
        result.PropertyLimits.First().BlastZoneReservationId.Should().Be(blastZoneClientReservationId);
    }

    [Test]
    public async Task UpdateBatchBlastZoneReservations_SetsConversionRateOnReturnedPropertyLimits()
    {
        const decimal rate = 1.23m;

        var blastZoneClientReservationId = Guid.NewGuid();
        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        PropertyLimitBlastZoneCapacityRequest request = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(rate);
        _mockBlastZoneApi.UpdateBatchBlastZoneReservations(Arg.Any<BatchBlastZoneCapacityCreate>())
            .Returns(new BatchBlastZoneCreateResult
            {
                Id = blastZoneClientReservationId,
                Reservations = new List<BlastZoneReservation>
                {
                    new() { Id = propertyLimits.First().RatingReference!.Value, HasCapacity = true, AvailableLimit = 500000 },
                },
            });

        PropertyLimitBlastZoneCapacityResponse result = await _blastZoneService.UpdateBatchBlastZoneReservations(request);

        result.PropertyLimits.Should().NotBeNullOrEmpty();
        result.PropertyLimits.First().ConversionRate.Should().Be(rate);
        result.PropertyLimits.First().BlastZoneReservationId.Should().Be(blastZoneClientReservationId);
    }

    [Test]
    public async Task GetBatchBlastZoneCapacitiesWithPropertyLimits_SetsConversionRateOnResultsAndPropertyLimits()
    {
        const decimal rate = 0.75m;

        List<PropertyLimit> propertyLimits = TestFixtures.PropertyLimits();
        Guid ratingRef = propertyLimits.First().RatingReference!.Value;
        PropertyLimitBlastZoneCapacityRequest request = TestFixtures.PropertyLimitBlastZoneCapacityRequest(propertyLimits);

        _currencyConversionService.GetConversionRate(Arg.Any<int>(), Arg.Any<string>()).Returns(rate);

        // Simulate the API layer (BlastZoneApi) stamping the conversion rate onto results
        _mockBlastZoneApi
            .GetBatchBlastZoneCapacityCheck(Arg.Any<BatchBlastZoneCapacityCheck>(), Arg.Any<IReadOnlyList<PropertyLimit>>(), Arg.Is<decimal>(r => r == rate))
            .Returns(callInfo =>
            {
                var limits = callInfo.ArgAt<IReadOnlyList<PropertyLimit>>(1);
                decimal exchangeRate = callInfo.ArgAt<decimal>(2);
                PropertyLimit pl = limits[0];
                pl.ConversionRate = exchangeRate;

                return new List<BlastZoneWithPropertyLimitResult>
                {
                    new() { BlastZoneCapacityResult = new BlastZoneReservation { Id = ratingRef, HasCapacity = true }, PropertyLimit = pl, ConversionRate = exchangeRate },
                };
            });

        List<BlastZoneWithPropertyLimitResult> results = await _blastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(request);

        results.Should().HaveCount(1);
        results.First().ConversionRate.Should().Be(rate);
        results.First().PropertyLimit.ConversionRate.Should().Be(rate);
    }
}
