using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.Geolocation;

public class GeolocationClient : IGeolocationClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public GeolocationClient(IConfigurationRoot configuration, HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GeoLocation:ApiKey"];
    }

    public async Task<string> GetAsync(string address)
    {
        var response = await _httpClient.GetAsync($"{_httpClient.BaseAddress}?address={HttpUtility.UrlEncode(address)}&key={_apiKey}");
        var result = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("There was a problem connecting to the Google Geocoding API");
        }

        return result;
    }
}