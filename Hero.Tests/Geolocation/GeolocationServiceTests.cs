using Hero.Integration.Geolocation;
using NSubstitute.ExceptionExtensions;

namespace Hero.Tests.Geolocation;

[TestFixture]
public class GeolocationServiceTests
{
    private IGeolocationService _subject;
    private IGeolocationClient _geolocationClient;
    private const string _address = "85 Gracechurch St, London EC3V 0DN, UK";

    [SetUp]
    public void SetUp()
    {
        _geolocationClient = Substitute.For<IGeolocationClient>();
        _subject = new GeolocationService(_geolocationClient);
    }

    [Test]
    public async Task WhenSingleResult_GeolocationService_GetAsync_Returns_Successful()
    {
        // Arrange
        _geolocationClient.GetAsync(_address).Returns(Task.FromResult(TestFixtures.GetGeolocationResultJsonWhenSuccessful()));

        // Act
        var result = await _subject.GetAsync(_address);

        // Assert
        result.Success.Should().Be(true);
        result.Latitude.Should().Be(51.51272900000001);
        result.Longitude.Should().Be(-0.0842816);
        result.Precision.Should().Be("ROOFTOP");
        result.FormattedAddress.Should().Be("85 Gracechurch St, London EC3V 0DN, UK");
        result.ErrorMessage.Should().BeNullOrEmpty();
    }

    [Test]
    public async Task WhenMultipleResultsTooFarApart_GeolocationService_GetAsync_Returns_Unsuccessful()
    {
        // Arrange
        _geolocationClient.GetAsync(_address).Returns(Task.FromResult(TestFixtures.GetGeolocationResultJsonWhenMultipleResultsTooFarApart()));

        // Act
        var result = await _subject.GetAsync(_address);

        // Assert
        result.Success.Should().Be(false);
        result.ErrorMessage.Should().Be("Multiple instances of the geolocated address have been found and fall outside of the 250m proximity");
    }

    [Test]
    public async Task WhenMultipleResultsAreWithin250MeterRadius_GeolocationService_GetAsync_Returns_Successful()
    {
        // Arrange
        _geolocationClient.GetAsync(_address).Returns(Task.FromResult(TestFixtures.GetGeolocationResultJsonWhenMultipleResultsWithinRadius250Meters()));

        // Act
        var result = await _subject.GetAsync(_address);

        // Assert
        result.Success.Should().Be(true);
        result.Latitude.Should().Be(51.51272900000001);
        result.Longitude.Should().Be(-0.0842816);
    }

    [Test]
    public async Task WhenAddressNotFound_GeolocationService_GetAsync_Returns_Unsuccessful()
    {
        // Arrange
        _geolocationClient.GetAsync(_address).Returns(Task.FromResult(TestFixtures.GetGeolocationResultJsonWhenAddressNotFound()));

        // Act
        var result = await _subject.GetAsync(_address);

        // Assert
        result.Success.Should().Be(false);
        result.ErrorMessage.Should().Be("Geolocated address not found");
    }


    [Test]
    public async Task WhenRequestDenied_GeolocationService_GetAsync_Returns_Unsuccessful()
    {
        // Arrange
        _geolocationClient.GetAsync(_address).Returns(Task.FromResult(TestFixtures.GetGeolocationResultJsonWhenRequestDenied()));

        // Act
        var result = await _subject.GetAsync(_address);

        // Assert
        result.Success.Should().Be(false);
        result.ErrorMessage.Should().Be("The provided API key is invalid.");
    }

    [Test]
    public async Task WhenExceptionIsThrow_GeoLocationService_GetAsync_Returns_Unsuccessful()
    {
        // Arrange
        _geolocationClient.GetAsync(_address).Throws(new Exception("There was a problem connecting to the Google Geocoding API"));

        // Act
        var result = await _subject.GetAsync(_address);

        // Assert
        result.Success.Should().Be(false);
        result.ErrorMessage.Should().Be("There was a problem connecting to the Google Geocoding API");
    }
}