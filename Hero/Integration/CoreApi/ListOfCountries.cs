using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi;

public class ListOfCountries : IListOfCountries
{
    private readonly ICountryApi _countryApi;
    private readonly IMemoryCache _cache;

    private const string CountriesCacheKey = "ListOfCountries_Countries";
    private static readonly TimeSpan CacheTimeToLive = TimeSpan.FromHours(1);

    public ListOfCountries(ICountryApi countryApi, IMemoryCache cache)
    {
        _countryApi = countryApi;
        _cache = cache;
    }

    private async Task<CountryLookup> GetCountriesAsync()
    {
        return await _cache.GetOrCreateAsync(CountriesCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheTimeToLive;
            var result = await _countryApi.GetAsync();
            return new CountryLookup
            {
                ByName = result.ToDictionary(c => c.Name, c => c, StringComparer.OrdinalIgnoreCase),
                ById = result.ToDictionary(c => c.CountryId, c => c)
            };
        });
    }

    public async Task<Country> GetCountryByName(string countryName)
    {
        var lookup = await GetCountriesAsync();
        return lookup.ByName.GetValueOrDefault(countryName);
    }

    public async Task<Country> GetCountryByCountryId(int countryId)
    {
        var lookup = await GetCountriesAsync();
        return lookup.ById.GetValueOrDefault(countryId);
    }

    private class CountryLookup
    {
        public Dictionary<string, Country> ByName { get; init; }
        public Dictionary<int, Country> ById { get; init; }
    }
}
