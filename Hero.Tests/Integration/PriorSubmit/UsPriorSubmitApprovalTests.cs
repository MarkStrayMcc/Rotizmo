using Hero.Integration.PriorSubmit;
using PropertyLimit = Hero.Models.PropertyLimit;
using ClientLocation = Hero.Models.ClientLocation;
using Country = Hero.Models.Country;

namespace Hero.Tests.Integration.PriorSubmit;

[TestFixture]
public class UsPriorSubmitApprovalTests
{
    private UsPriorSubmitApproval _subject;

    [SetUp]
    public void SetUp()
    {
        _subject = new UsPriorSubmitApproval();
    }

    [Test]
    public void CountryId_ShouldBeUs()
    {
        _subject.CountryId.Should().Be(4);
    }

    [TestCase("10001")]
    [TestCase("10002")]
    [TestCase("10003")]
    [TestCase("10004")]
    [TestCase("10005")]
    [TestCase("10006")]
    [TestCase("10007")]
    [TestCase("10009")]
    [TestCase("10010")]
    [TestCase("10011")]
    [TestCase("10012")]
    [TestCase("10013")]
    [TestCase("10014")]
    [TestCase("10016")]
    [TestCase("10017")]
    [TestCase("10018")]
    [TestCase("10019")]
    [TestCase("10020")]
    [TestCase("10021")]
    [TestCase("10022")]
    [TestCase("10036")]
    [TestCase("10038")]
    [TestCase("10065")]
    [TestCase("10069")]
    [TestCase("10075")]
    [TestCase("10128")]
    [TestCase("10278")]
    [TestCase("10280")]
    [TestCase("10281")]
    [TestCase("10282")]
    public async Task GivenLocationWithPriorSubmitZipCode_WhenEvaluated_ThenPriorCarrierApprovalRequiredIsTrue(string zipCode)
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit(zipCode) };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().BeTrue();
    }

    [TestCase("10001")]
    [TestCase("10022")]
    [TestCase("10282")]
    public async Task GivenLocationWithPriorSubmitZipCode_WhenEvaluated_ThenFormattedAddressIsPopulated(string zipCode)
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit(zipCode) };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].FormattedAddress.Should().NotBeNullOrEmpty();
    }

    [TestCase("37188")]
    [TestCase("90210")]
    [TestCase("20500")]
    [TestCase("10008")]
    [TestCase("10015")]
    [TestCase("99999")]
    public async Task GivenLocationWithNonPriorSubmitZipCode_WhenEvaluated_ThenPriorCarrierApprovalRequiredIsNotSet(string zipCode)
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit(zipCode) };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().NotBe(true);
    }

    [TestCase("37188")]
    [TestCase("90210")]
    public async Task GivenLocationWithNonPriorSubmitZipCode_WhenEvaluated_ThenFormattedAddressIsNull(string zipCode)
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit(zipCode) };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].FormattedAddress.Should().BeNull();
    }

    [Test]
    public async Task GivenLocationWithWhitespaceInZipCode_WhenEvaluated_ThenWhitespaceIsRemovedAndMatchOccurs()
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit("100 01") };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().BeTrue();
    }

    [Test]
    public async Task GivenLocationWithNullPostcode_WhenEvaluated_ThenItIsSkipped()
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit(null) };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().NotBe(true);
    }

    [Test]
    public async Task GivenLocationWithEmptyPostcode_WhenEvaluated_ThenItIsSkipped()
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit("") };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().NotBe(true);
    }

    [Test]
    public async Task GivenLocationWithWhitespaceOnlyPostcode_WhenEvaluated_ThenItIsSkipped()
    {
        var propertyLimits = new List<PropertyLimit> { CreateUsPropertyLimit("   ") };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().NotBe(true);
    }

    [Test]
    public async Task GivenLocationWithNullInsuredAddress_WhenEvaluated_ThenItIsSkipped()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            new() { InsuredAddress = null }
        };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().NotBe(true);
    }

    [Test]
    public async Task GivenEmptyPropertyLimits_WhenEvaluated_ThenItCompletesSuccessfully()
    {
        var propertyLimits = new List<PropertyLimit>();

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits.Should().BeEmpty();
    }

    [Test]
    public async Task GivenMixedLocations_WhenEvaluated_ThenOnlyMatchingZipCodesAreMarked()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreateUsPropertyLimit("10001"),
            CreateUsPropertyLimit("90210"),
            CreateUsPropertyLimit("10022"),
            CreateUsPropertyLimit("37188")
        };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].PriorCarrierApprovalRequired.Should().BeTrue();
        propertyLimits[1].PriorCarrierApprovalRequired.Should().NotBe(true);
        propertyLimits[2].PriorCarrierApprovalRequired.Should().BeTrue();
        propertyLimits[3].PriorCarrierApprovalRequired.Should().NotBe(true);
    }

    [Test]
    public async Task GivenLocationWithPriorSubmitZipCode_WhenEvaluated_ThenFormattedAddressContainsAddressComponents()
    {
        var propertyLimits = new List<PropertyLimit>
        {
            CreateUsPropertyLimit("10001", address1: "350 Fifth Avenue", city: "New York", stateProvinceCode: "NY")
        };

        await _subject.EvaluateAsync(propertyLimits);

        propertyLimits[0].FormattedAddress.Should().Contain("350 Fifth Avenue");
        propertyLimits[0].FormattedAddress.Should().Contain("New York");
        propertyLimits[0].FormattedAddress.Should().Contain("10001");
    }

    private static PropertyLimit CreateUsPropertyLimit(
        string postcode,
        string address1 = "123 Test St",
        string city = "TestCity",
        string stateProvinceCode = "DC")
    {
        return new PropertyLimit
        {
            PropertyDamageLimit = 20000,
            ContentsDamageLimit = 60000,
            InsuredAddress = new ClientLocation
            {
                CountryId = 4,
                Address1 = address1,
                City = city,
                Postcode = postcode,
                StateProvinceCode = stateProvinceCode,
                Country = new Country { CountryId = 4, Name = "US", IsoCode = "US" }
            }
        };
    }
}
