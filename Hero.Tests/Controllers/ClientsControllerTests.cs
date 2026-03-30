using Hero.Controllers;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.SanctionsScreening;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Tests.Controllers;

[TestFixture]
public class ClientsControllerTests
{
    private IClientsApi _mockClientsApi;
    private ISanctionsScreeningApi _mockSanctionsScreeningApi;
    private ClientsController _subject;
    private ISanctionsScreeningService _sanctionsScreeningService;

    [SetUp]
    public void SetUp()
    {
        _mockClientsApi = Substitute.For<IClientsApi>();
        _mockSanctionsScreeningApi = Substitute.For<ISanctionsScreeningApi>();
        _sanctionsScreeningService = Substitute.For<ISanctionsScreeningService>();
        _subject = new ClientsController(_mockClientsApi, _sanctionsScreeningService);
    }

    [TestCase(true)]
    [TestCase(false)]
    public async Task SanctionsCheck_ShouldCallSanctionsScreeningServiceAndReturnOkResult(bool sanctionsResult)
    {
        // Arrange
        var request = new SanctionsCheckRequest
        {
            ClientUid = "test-uid-123",
            ClientName = "Test Company",
            ClientId = 123,
            CountryIsoCode = "GB",
            Stage = "PreQuote",
            IsSendEmail = true
        };

        _sanctionsScreeningService.HasSanctions(request).Returns(sanctionsResult);

        // Act
        var result = await _subject.HasSanctions(request);

        // Assert
        await _sanctionsScreeningService.Received(1).HasSanctions(
            Arg.Is<SanctionsCheckRequest>(r =>
                r.ClientUid == request.ClientUid &&
                r.ClientName == request.ClientName &&
                r.ClientId == request.ClientId &&
                r.CountryIsoCode == request.CountryIsoCode &&
                r.Stage == request.Stage &&
                r.IsSendEmail == request.IsSendEmail));
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
    }

    [Test]
    public async Task HasSanctions_ShouldCallClientsApi()
    {
        // Arrange
        var clientName = "Test Client";
        var countryIsoCode = "GB";
        var stage = "PreQuote";
        var isSendEmail = true;

        _mockClientsApi
            .HasSanctions(clientName, countryIsoCode, stage, isSendEmail)
            .Returns(Task.FromResult(true));

        // Act
        var result = await _subject.Get(clientName, countryIsoCode, stage, isSendEmail);

        // Assert
        await _mockClientsApi.Received(1).HasSanctions(clientName, countryIsoCode, stage, isSendEmail);
        var okResult = result as OkObjectResult;
        okResult.Should().NotBeNull();
    }
}
