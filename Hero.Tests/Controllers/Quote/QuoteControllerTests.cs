using Hero.Controllers;
using Hero.Integration.Cache;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;


namespace Hero.Tests.Controllers.Quote;

[TestFixture]
public class QuoteControllerTests
{
    private IQuoteApi? _mockQuoteApi;

    private QuoteController _subject { get; set; }

    [SetUp]
    public void SetUp()
    {
        var mockCacheHelper= Substitute.For<ICacheHelper>();
        _mockQuoteApi = Substitute.For<IQuoteApi>();
        var mockDraftQuoteApi = Substitute.For<IDraftQuoteApi>();
        _subject = new QuoteController(mockCacheHelper, _mockQuoteApi, mockDraftQuoteApi);
    }

    [TearDown]
    public void TearDown()
    {
        _subject.Dispose();
    }

    [Test]
    public async Task BindQuoteShouldCallCoreApi()
    {
        // Arrange
        // To test ensuring correct QuoteBindRequest 
        var quoteBindRequest = new QuoteBindRequest()
        {
            QuoteId = 1234,
            Premium = 10000m,
            CfcContactId = 888,
            ExpiryDate = DateTime.UtcNow.AddDays(10),
            InceptionDate = DateTime.UtcNow.AddDays(30),
            BrokerTeam = new BrokerTeam()
            {
                Id = 1,
                Name = "broker team"
            },
            InsuredLocation = new ClientLocation() {
                ClientLocationId = 1,
                IsPrimaryLocation = true,
                Postcode = "e12 5an"
            },
            PolicyLocationPremiums = new List<WebApiDto.Dto.PolicyLocationPremiums>
            {
                new()
                {
                    BusinessLineCode = "MMC",
                    ModelPremium = 123m,
                    QuotedPremium = 456m,
                    SuggestedPremium = 789m
                }
            }
        };

        // Act
        var result = await _subject.Bind(quoteBindRequest);
        
        // Assert
        await _mockQuoteApi!.Received(1).BindQuote(Arg.Any<QuoteBindRequest>());
        var okObjectResult = result as OkObjectResult;
        okObjectResult.Should().NotBeNull();
    }
}