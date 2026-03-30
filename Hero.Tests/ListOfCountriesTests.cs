using Hero.Integration.CoreApi;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using WebApiDto.Dto;

namespace Hero.Tests;

[TestFixture]
public class ListOfCountriesTests
{
    private ListOfCountries _listOfCountries;
    private IMemoryCache _cache;

    [SetUp]
    public void SetUp()
    {
        var mockCountriesApi = Substitute.For<ICountryApi>();
        mockCountriesApi.GetAsync().Returns(Task.FromResult(new List<Country>
        {
            new()
            {
                CountryId = 1,
                Name = "US"
            },
            new()
            {
                CountryId = 2,
                Name = "UK"
            }
        }));

        _cache = new MemoryCache(new MemoryCacheOptions());
        _listOfCountries = new ListOfCountries(mockCountriesApi, _cache);
    }

    [TearDown]
    public void TearDown()
    {
        _cache?.Dispose();
    }

    [Test]
    public async Task Should_return_valid_country()
    {
        var result = await _listOfCountries.GetCountryByName("US");

        Assert.That(result.Name, Is.EqualTo("US"));
    }

    [Test]
    public async Task Should_return_null_for_invalid_country()
    {
        var result = await _listOfCountries.GetCountryByName("Wakanda");

        Assert.That(result, Is.Null);
    }
}
