using Hero.Integration.PriorSubmit;
using PropertyLimit = Hero.Models.PropertyLimit;
using ClientLocation = Hero.Models.ClientLocation;
using Country = Hero.Models.Country;

namespace Hero.Tests.Integration.PriorSubmit;

[TestFixture]
public class PriorSubmitApprovalServiceTests
{
    private PriorSubmitApprovalService _subject;
    private IPriorSubmitApproval _mockUsApproval;
    private IPriorSubmitApproval _mockUkApproval;

    [SetUp]
    public void SetUp()
    {
        _mockUsApproval = Substitute.For<IPriorSubmitApproval>();
        _mockUsApproval.CountryId.Returns(4);
        _mockUsApproval.EvaluateAsync(Arg.Any<IList<PropertyLimit>>()).Returns(Task.CompletedTask);

        _mockUkApproval = Substitute.For<IPriorSubmitApproval>();
        _mockUkApproval.CountryId.Returns(1);
        _mockUkApproval.EvaluateAsync(Arg.Any<IList<PropertyLimit>>()).Returns(Task.CompletedTask);

        _subject = new PriorSubmitApprovalService(new[] { _mockUsApproval, _mockUkApproval });
    }

    [Test]
    public async Task GivenPropertyLimitsWithUsLocations_WhenEvaluating_ThenUsApprovalIsCalled()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreatePropertyLimit(countryId: 4, postcode: "10001")
        };

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUsApproval.Received(1).EvaluateAsync(propertyLimits);
    }

    [Test]
    public async Task GivenPropertyLimitsWithUsLocations_WhenEvaluating_ThenUkApprovalIsNotCalled()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreatePropertyLimit(countryId: 4, postcode: "10001")
        };

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUkApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
    }

    [Test]
    public async Task GivenPropertyLimitsWithUkLocations_WhenEvaluating_ThenUkApprovalIsCalledAndUsIsNot()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreatePropertyLimit(countryId: 1, postcode: "EC3V 0AA")
        };

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUkApproval.Received(1).EvaluateAsync(propertyLimits);
        await _mockUsApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
    }

    [Test]
    public async Task GivenPropertyLimitsWithBothUsAndUkLocations_WhenEvaluating_ThenBothApprovalsAreCalled()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreatePropertyLimit(countryId: 4, postcode: "10001"),
            CreatePropertyLimit(countryId: 1, postcode: "EC3V 0AA")
        };

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUsApproval.Received(1).EvaluateAsync(propertyLimits);
        await _mockUkApproval.Received(1).EvaluateAsync(propertyLimits);
    }

    [Test]
    public async Task GivenEmptyPropertyLimits_WhenEvaluating_ThenNoApprovalsAreCalled()
    {
        var propertyLimits = new List<PropertyLimit>();

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUsApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
        await _mockUkApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
    }

    [Test]
    public async Task GivenPropertyLimitsWithNullInsuredAddress_WhenEvaluating_ThenNoApprovalsAreCalled()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            new() { InsuredAddress = null }
        };

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUsApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
        await _mockUkApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
    }

    [Test]
    public async Task GivenPropertyLimitsWithCountryNotMatchingAnyApproval_WhenEvaluating_ThenNoApprovalsAreCalled()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreatePropertyLimit(countryId: 99, postcode: "12345")
        };

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUsApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
        await _mockUkApproval.DidNotReceive().EvaluateAsync(Arg.Any<IList<PropertyLimit>>());
    }

    [Test]
    public async Task GivenMultiplePropertyLimitsWithSameCountry_WhenEvaluating_ThenApprovalIsCalledOnce()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreatePropertyLimit(countryId: 4, postcode: "10001"),
            CreatePropertyLimit(countryId: 4, postcode: "10002"),
            CreatePropertyLimit(countryId: 4, postcode: "90210")
        };

        await _subject.EvaluateLocationsAsync(propertyLimits);

        await _mockUsApproval.Received(1).EvaluateAsync(propertyLimits);
    }

    [Test]
    public async Task GivenNoApprovals_WhenEvaluating_ThenItCompletesWithoutError()
    {
        var serviceWithNoApprovals = new PriorSubmitApprovalService(Enumerable.Empty<IPriorSubmitApproval>());

        var propertyLimits = new List<PropertyLimit>
        {
            CreatePropertyLimit(countryId: 4, postcode: "10001")
        };

        await serviceWithNoApprovals.EvaluateLocationsAsync(propertyLimits);
    }

    private static PropertyLimit CreatePropertyLimit(int countryId, string postcode)
    {
        return new PropertyLimit
        {
            PropertyDamageLimit = 20000,
            ContentsDamageLimit = 60000,
            InsuredAddress = new ClientLocation
            {
                CountryId = countryId,
                Address1 = "123 Test St",
                City = "TestCity",
                Postcode = postcode,
                Country = new Country { CountryId = countryId, Name = countryId == 4 ? "US" : "UK", IsoCode = countryId == 4 ? "US" : "GB" }
            }
        };
    }
}
