using Hero.Integration.CoreApi;
using Hero.Models.Validation;
using Hero.Models.Validation.Validators;
using Hero.Integration.CoreApi.Interfaces;
using Country = WebApiDto.Dto.Country;
using FluentValidation.TestHelper;
using Microsoft.Extensions.Caching.Memory;

namespace Hero.Tests.ValidationTests;

[TestFixture]
public class LocationValidationRequestValidatorTests
{
    private LocationValidationRequestValidator _validator;
    private ILocationApi? _mockLocationsApi;

    [SetUp]
    public void Setup()
    {
        _mockLocationsApi = Substitute.For<ILocationApi>();

        _mockLocationsApi.GetCountryStates(Arg.Is<string>("US")).Returns(new List<WebApiDto.Dto.StateProvince>()
        {
            new()
            {
                CountryId = 1,
                Description = "District of Columbia",
                StateProvinceCode = "DC"
            }
        });

        var countryApi = Substitute.For<ICountryApi>();
        countryApi.GetAsync().Returns(Task.FromResult(new List<Country>()
        {
            new Models.Country()
            {
                CountryId = 1,
                Name = "UK",
                IsoCode = "GB"
            },
            new Models.Country()
            {
                CountryId = 2,
                Name = "US",
                IsoCode = "US"
            },
            new Models.Country()
            {
                CountryId = 3,
                Name = "Canada",
                IsoCode = "CA"
            },
            new Models.Country()
            {
                CountryId = 4,
                Name = "France",
                IsoCode = "FR"
            }
        }));

        var cache = new MemoryCache(new MemoryCacheOptions());
        var countries = new ListOfCountries(countryApi, cache);
        _validator = new LocationValidationRequestValidator(countries, _mockLocationsApi);
    }

    [Test]
    public async Task Should_Fail_When_AddressLine1_Is_Null()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = null,
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec25nm",
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.Address1)
            .WithErrorMessage("Address line 1 is required");
    }

    [Test]
    public async Task Should_Fail_When_AddressLine1_Is_Empty()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = string.Empty,
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec25nm",
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.Address1)
            .WithErrorMessage("Address line 1 is required");
    }

    [Test]
    public async Task Should_Fail_When_AddressLine1_Is_Whitespace()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "   ",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec25nm",
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.Address1)
            .WithErrorMessage("Address line 1 is required");
    }

    [Test]
    public async Task Should_Fail_When_BuildingUse_Is_Null()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec25nm",
            CountryName = "UK",
            BuildingUse = string.Empty
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.BuildingUse)
            .WithErrorMessage("Building use is required");
    }

    [Test]
    public async Task Should_Fail_When_BuildingUse_Is_Not_Match()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec25nm",
            CountryName = "UK",
            BuildingUse = "Commerci"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.BuildingUse)
            .WithErrorMessage("Invalid building use value");
    }

    [Test]
    public async Task Should_Fail_When_City_Is_Null()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = null,
            Postcode = "ec25nm",
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.City)
            .WithErrorMessage("City is required");
    }

    [Test]
    public async Task Should_Fail_When_City_Is_Empty()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = string.Empty,
            Postcode = "ec25nm",
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.City)
            .WithErrorMessage("City is required");
    }

    [Test]
    public async Task Should_Fail_When_City_Is_Whitespace()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "  ",
            Postcode = "ec25nm",
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.City)
            .WithErrorMessage("City is required");
    }

    [Test]
    public async Task Should_Fail_When_Postcode_Is_Null()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = null,
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.Postcode)
            .WithErrorMessage("Postcode is required");
    }

    [Test]
    public async Task Should_Fail_When_Postcode_Is_Empty()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = string.Empty,
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.Postcode)
            .WithErrorMessage("Postcode is required");
    }

    [Test]
    public async Task Should_Fail_When_Postcode_Is_Whitespace()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "  ",
            CountryName = "UK"
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.Postcode)
            .WithErrorMessage("Postcode is required");
    }

    [Test]
    public async Task Should_Fail_When_CountryName_Is_Null()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec28hn",
            CountryName = null
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.CountryName)
            .WithErrorMessage($"{nameof(clientLocation.CountryName)} is required");
    }

    [Test]
    public async Task Should_Fail_When_CountryName_Is_Empty()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec28jn",
            CountryName = string.Empty
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.CountryName)
            .WithErrorMessage($"{nameof(clientLocation.CountryName)} is required");
    }

    [Test]
    public async Task Should_Fail_When_CountryName_Is_Whitespace()
    {
        var clientLocation = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            City = "London",
            Postcode = "ec13nm",
            CountryName = " "
        };

        var result = await _validator.TestValidateAsync(clientLocation);
        result.ShouldHaveValidationErrorFor(location => location.CountryName)
            .WithErrorMessage($"{nameof(clientLocation.CountryName)} is required");
    }

    [Test]
    public async Task Should_Fail_For_Invalid_CountryName()
    {
        var locationValidationRequest = CreateLocationValidationRequest("Wakanda");
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.CountryName)
            .WithErrorMessage("Country information you have entered is invalid");
    }

    [Test]
    public async Task Should_Fail_For_Valid_CountryName_With_Extraneous_Spaces()
    {
        var locationValidationRequest = CreateLocationValidationRequest("   UK   ");
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.CountryName)
            .WithErrorMessage("Country information you have entered is invalid");
    }

    [Test]
    public async Task Should_Pass_For_Valid_CountryName_In_Wrong_Case()
    {
        var locationValidationRequest = CreateLocationValidationRequest("uk");
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.CountryName);
    }

    [Test]
    public async Task Should_Pass_For_Valid_State_And_Country()
    {
        var validationRequest = CreateLocationValidationRequest("US", "District of Columbia");

        var result = await _validator.TestValidateAsync(validationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location);
    }

    [Test]
    public async Task Should_Pass_Ignoring_StateProvince_For_UK_Which_DoesntHaveStates()
    {
        var validationRequest = CreateLocationValidationRequest("UK", "District of Columbia");

        var result = await _validator.TestValidateAsync(validationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location);
    }


    [Test]
    public async Task Should_Fail_For_Invalid_State_And_Valid_Country()
    {
        var locationValidationRequest = new LocationValidationRequest()
        {
            Address1 = "address line 1",
            Address2 = "address line 2",
            Address3 = "address line 3",
            CountryName = "US",
            StateProvince = "UK" //51st state
        };

        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location);
    }

    [Test]
    public async Task Should_Fail_For_Addressline1_With_Exceeding_Max_Length()
    {
        var addressLine1 = new string('A', 101);
        var locationValidationRequest = CreateLocationValidationRequest(addressLine1: addressLine1);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.Address1)
            .WithErrorMessage("Address line 1 information you have entered exceeds the maximum allowed length of 100 characters");
    }

    [Test]
    public async Task Should_Not_Fail_For_Addressline1_When_not_Exceeding_Max_Length()
    {
        var addressLine1 = new string('A', 99);
        var locationValidationRequest = CreateLocationValidationRequest(addressLine1: addressLine1);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.Address1);
    }

    [Test]
    public async Task Should_Fail_For_Addressline2_With_Exceeding_Max_Length()
    {
        var addressLine2 = new string('A', 101);
        var locationValidationRequest = CreateLocationValidationRequest(addressLine2: addressLine2);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.Address2)
            .WithErrorMessage("Address line 2 information you have entered exceeds the maximum allowed length of 100 characters");
    }

    [Test]
    public async Task Should_Not_Fail_For_Addressline2_When_not_Exceeding_Max_Length()
    {
        var addressLine2 = new string('A', 99);
        var locationValidationRequest = CreateLocationValidationRequest(addressLine2: addressLine2);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.Address2);
    }

    [Test]
    public async Task Should_Fail_For_Addressline3_With_Exceeding_Max_Length()
    {
        var addressLine3 = new string('A', 101);
        var locationValidationRequest = CreateLocationValidationRequest(addressLine3: addressLine3);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.Address3)
            .WithErrorMessage("Address line 3 information you have entered exceeds the maximum allowed length of 100 characters");
    }

    [Test]
    public async Task Should_Not_Fail_For_Addressline3_When_not_Exceeding_Max_Length()
    {
        var addressLine3 = new string('A', 99);
        var locationValidationRequest = CreateLocationValidationRequest(addressLine3: addressLine3);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.Address3);
    }

    [Test]
    public async Task Should_Fail_For_City_With_Exceeding_Max_Length()
    {
        var city = new string('A', 31);
        var locationValidationRequest = CreateLocationValidationRequest(city: city);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.City)
            .WithErrorMessage("City information you have entered exceeds the maximum allowed length of 30 characters");
    }

    [Test]
    public async Task Should_Not_Fail_For_City_When_Not_Exceeding_Max_Length()
    {
        var city = new string('A', 29);
        var locationValidationRequest = CreateLocationValidationRequest(city: city);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.City);
    }

    [Test]
    public async Task Should_Fail_For_PostCode_With_Exceeding_Max_Length()
    {
        var postCode = new string('A', 11);
        var locationValidationRequest = CreateLocationValidationRequest(postCode: postCode);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.Postcode)
            .WithErrorMessage("Postcode/zipcode information you have entered exceeds the maximum allowed length of 10 characters");
    }

    [Test]
    public async Task Should_Not_Fail_For_PostCode_When_Not_Exceeding_Max_Length()
    {
        var postCode = new string('A', 9);
        var locationValidationRequest = CreateLocationValidationRequest(postCode: postCode);
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.Postcode);
    }

    [Test]
    public async Task Should_Pass_For_UK_Country()
    {
        var locationValidationRequest = CreateLocationValidationRequest("UK");
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.CountryName);
    }

    [Test]
    public async Task Should_Pass_For_US_Country()
    {
        var locationValidationRequest = CreateLocationValidationRequest("US", "District of Columbia");
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.CountryName);
    }

    [Test]
    public async Task Should_Pass_For_Canada_Country()
    {
        var locationValidationRequest = CreateLocationValidationRequest("Canada");
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldNotHaveValidationErrorFor(location => location.CountryName);
    }

    [Test]
    public async Task Should_Fail_For_France_Country()
    {
        var locationValidationRequest = CreateLocationValidationRequest("France");
        var result = await _validator.TestValidateAsync(locationValidationRequest);
        result.ShouldHaveValidationErrorFor(location => location.CountryName)
            .WithErrorMessage("Country 'France' is not allowed.");
    }

    private static LocationValidationRequest CreateLocationValidationRequest(string country = "UK",
    string stateProvince = "Texas", string addressLine1 = "address line 1", string addressLine2 = "address line 2",
        string addressLine3 = "address line 3", string postCode = "KT212JB", string city = "London", string buildingUse = "COMMERCIAL")
    {
        var locationValidationRequest = new LocationValidationRequest()
        {
            Address1 = addressLine1,
            Address2 = addressLine2,
            Address3 = addressLine3,
            CountryName = country,
            StateProvince = stateProvince,
            Postcode = postCode,
            City = city,
            BuildingUse = buildingUse
        };
        return locationValidationRequest;
    }
}
