using Hero.Controllers;
using Hero.Integration.BlastZoneApi;
using Hero.Models.BlastZone;
using Microsoft.AspNetCore.Mvc;
using Microsoft.FeatureManagement;
using PropertyLimit = Hero.Models.PropertyLimit;

namespace Hero.Tests.Integration.BlastZone;

[TestFixture]

public class BlastZoneControllerTests
{
    private IBlastZoneService _mockBlastZoneService;
    private BlastZoneController _blastZoneController = null!;
    private IFeatureManager _mockFeatureManager;

    [SetUp]
    public void SetUp()
    {
        _mockBlastZoneService = Substitute.For<IBlastZoneService>();
        _mockFeatureManager = Substitute.For<IFeatureManager>();
        _mockFeatureManager.IsEnabledAsync(Arg.Any<string>()).Returns(true);
        _blastZoneController = new BlastZoneController(_mockBlastZoneService);
    }

    [Test]
    public async Task GetBlastZoneCapacity_WhenBlastZoneCapacitiesAreReturned_ReturnsTrue()
    {
        // Arrange
        var request = TestFixtures.PropertyLimitBlastZoneCapacityRequest();

        var expectedResponse = new List<BlastZoneWithPropertyLimitResult>()
        {
            new BlastZoneWithPropertyLimitResult
            {
                BlastZoneCapacityResult =  TestFixtures.BlastZoneCapacityResultWithCapacity(),
                PropertyLimit = TestFixtures.PropertyLimits().First()
            }
        };

        _mockBlastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(expectedResponse);

        // Act
        var result = await _blastZoneController.GetBlastZoneCapacityResult(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<List<BlastZoneWithPropertyLimitResult>>().Subject;
        actual.Should().HaveCount(1);
    }

    [Test]
    public async Task CreateBlastZoneReservations_WhenBlastZoneCapacitiesAreReturned_ReturnsTrueWithPropertyLimits()
    {
        // Arrange
        var request = TestFixtures.PropertyLimitBlastZoneCapacityRequest();
        request.PropertyLimits.Add(new PropertyLimit { PropertyLimitId = 1 });

        var blastZoneCapacities = new List<BlastZoneWithPropertyLimitResult> {
            new()
            {
                PropertyLimit = TestFixtures.PropertyLimits().First(),
                BlastZoneCapacityResult = TestFixtures.BlastZoneCapacityResultWithCapacity()
            }
        };

        _mockBlastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(blastZoneCapacities);

        _mockBlastZoneService.CreateBatchBlastZoneReservations(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(new PropertyLimitBlastZoneCapacityResponse { BlastZoneCheckResult = true, PropertyLimits = request.PropertyLimits });

        // Act
        var result = await _blastZoneController.CreateBlastZoneReservation(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<PropertyLimitBlastZoneCapacityResponse>().Subject;
        actual.BlastZoneCheckResult.Should().BeTrue();
        actual.PropertyLimits.Should().BeAssignableTo<List<PropertyLimit>>();
        actual.PropertyLimits.Should().NotBeEmpty();
    }

    [Test]
    public async Task CreateBlastZoneReservations_WhenNoBlastZoneCapacitiesAreReturned_ReturnsFalseWithPropertyLimits()
    {
        // Arrange
        var request = TestFixtures.PropertyLimitBlastZoneCapacityRequest();

        var blastZoneCapacities = new List<BlastZoneWithPropertyLimitResult>();

        _mockBlastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(blastZoneCapacities);

        // Act
        var result = await _blastZoneController.CreateBlastZoneReservation(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<PropertyLimitBlastZoneCapacityResponse>().Subject;
        actual.BlastZoneCheckResult.Should().BeFalse();
        actual.PropertyLimits.Should().BeAssignableTo<List<PropertyLimit>>();
    }

    [Test]
    public async Task CreateBlastZoneReservations_WhenBlastZoneCapacitiesHaveNoCapacity_ReturnsFalseWithPropertyLimits()
    {
        // Arrange
        var request = TestFixtures.PropertyLimitBlastZoneCapacityRequest();

        var blastZoneCapacities = new List<BlastZoneWithPropertyLimitResult> {
            new()
            {
                PropertyLimit = TestFixtures.PropertyLimits().First(),
                BlastZoneCapacityResult = TestFixtures.BlastZoneCapacityResultWithNoCapacity()
            }
        };

        _mockBlastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(blastZoneCapacities);

        _mockBlastZoneService.CreateBatchBlastZoneReservations(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(new PropertyLimitBlastZoneCapacityResponse { BlastZoneCheckResult = true, PropertyLimits = new List<PropertyLimit>() });

        // Act
        var result = await _blastZoneController.CreateBlastZoneReservation(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<PropertyLimitBlastZoneCapacityResponse>().Subject;
        actual.BlastZoneCheckResult.Should().BeFalse();
        actual.PropertyLimits.Should().BeAssignableTo<List<PropertyLimit>>();
    }

    [Test]
    public async Task CreateBlastZoneReservations_WhenSomeBlastZoneCapacitiesHaveNoCapacity_ReturnsFalseWithPropertyLimits()
    {
        // Arrange
        var request = TestFixtures.PropertyLimitBlastZoneCapacityRequest();

        var blastZoneCapacities = new List<BlastZoneWithPropertyLimitResult>
        {
            new()
            {
                PropertyLimit = TestFixtures.PropertyLimits().First(),
                BlastZoneCapacityResult = TestFixtures.BlastZoneCapacityResultWithCapacity()
            },
             new()
            {
                PropertyLimit = TestFixtures.PropertyLimits().First(),
                BlastZoneCapacityResult = TestFixtures.BlastZoneCapacityResultWithNoCapacity()
            }
        };

        _mockBlastZoneService.GetBatchBlastZoneCapacitiesWithPropertyLimits(Arg.Any<PropertyLimitBlastZoneCapacityRequest>()).Returns(blastZoneCapacities);

        // Act
        var result = await _blastZoneController.CreateBlastZoneReservation(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<PropertyLimitBlastZoneCapacityResponse>().Subject;
        actual.BlastZoneCheckResult.Should().BeFalse();
        actual.PropertyLimits.Should().BeAssignableTo<List<PropertyLimit>>();
    }

    [Test]
    public async Task UpdateBlastZoneReservations_WhenBlastZoneCapacityIsAvailable_ReturnsTrue()
    {
        // Arrange
        var request = TestFixtures.PropertyLimitBlastZoneCapacityRequest();

        _mockBlastZoneService.UpdateBatchBlastZoneReservations(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(new PropertyLimitBlastZoneCapacityResponse { BlastZoneCheckResult = true });

        // Act
        var result = await _blastZoneController.UpdateBlastZoneReservation(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<PropertyLimitBlastZoneCapacityResponse>().Subject;
        actual.Should().NotBeNull();
        actual.BlastZoneCheckResult.Should().BeTrue();
        await _mockBlastZoneService.Received(1).UpdateBatchBlastZoneReservations(Arg.Any<PropertyLimitBlastZoneCapacityRequest>());
    }

    [Test]
    public async Task UpdateBlastZoneReservations_WhenBlastZoneCapacityIsNotAvailable_ReturnsFalse()
    {
        // Arrange
        var request = TestFixtures.PropertyLimitBlastZoneCapacityRequest();

        _mockBlastZoneService.UpdateBatchBlastZoneReservations(Arg.Any<PropertyLimitBlastZoneCapacityRequest>())
            .Returns(new PropertyLimitBlastZoneCapacityResponse());

        // Act
        var result = await _blastZoneController.UpdateBlastZoneReservation(request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<PropertyLimitBlastZoneCapacityResponse>().Subject;
        actual.Should().NotBeNull();
        actual.BlastZoneCheckResult.Should().BeFalse();
        await _mockBlastZoneService.Received(1).UpdateBatchBlastZoneReservations(Arg.Any<PropertyLimitBlastZoneCapacityRequest>());
    }

    [Test]
    public async Task GetBlastZoneReservation_WhenReservationExists_ReturnsOkWithReservation()
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

        _mockBlastZoneService.GetBlastZoneReservations(reservationGroupId).Returns(expectedResponse);

        // Act
        var result = await _blastZoneController.GetBlastZoneReservation(reservationGroupId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<BlastZoneReservationGetResponse>().Subject;
        actual.Should().NotBeNull();
        actual.Id.Should().Be(reservationGroupId);
        actual.Reservations.Should().NotBeNull();
        actual.Reservations.Count.Should().Be(1);
        actual.Reservations.First().Exposure.Should().Be(500000);
        await _mockBlastZoneService.Received(1).GetBlastZoneReservations(reservationGroupId);
    }

    [Test]
    public async Task DeleteBlastZoneReservations_WhenServiceReturnsTrue_ReturnsOkWithTrue()
    {
        // Arrange
        var reservationGroupId = Guid.NewGuid();
        _mockBlastZoneService.DeleteBlastZoneReservations(reservationGroupId).Returns(true);

        // Act
        var result = await _blastZoneController.DeleteBlastZoneReservations(reservationGroupId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<bool>().Subject;
        actual.Should().BeTrue();
        await _mockBlastZoneService.Received(1).DeleteBlastZoneReservations(reservationGroupId);
    }

    [Test]
    public async Task DeleteBlastZoneReservations_WhenServiceReturnsFalse_ReturnsOkWithFalse()
    {
        // Arrange
        var reservationGroupId = Guid.NewGuid();
        _mockBlastZoneService.DeleteBlastZoneReservations(reservationGroupId).Returns(false);

        // Act
        var result = await _blastZoneController.DeleteBlastZoneReservations(reservationGroupId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>();
        var actual = okResult.Subject.Value.Should().BeAssignableTo<bool>().Subject;
        actual.Should().BeFalse();
        await _mockBlastZoneService.Received(1).DeleteBlastZoneReservations(reservationGroupId);
    }

}
