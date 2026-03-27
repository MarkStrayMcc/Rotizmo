using System;
using System.Text.Json;
using System.Threading.Tasks;
using Hero.Models.Geolocation;
using Hero.Models.GeoLocation.GoogleApi;

namespace Hero.Integration.Geolocation;

public class GeolocationService : IGeolocationService
{
    private readonly IGeolocationClient _geoLocationClient;
    private const double RadiusLimitMeters = 250.0;

    public GeolocationService(IGeolocationClient geoLocationClient)
    {
        _geoLocationClient = geoLocationClient;
    }

    public async Task<GeolocationResult> GetAsync(string address)
    {
        try
        {
            var stringResponse = await _geoLocationClient.GetAsync(address);
            var geolocationResponse = JsonSerializer.Deserialize<GeolocationResponse>(stringResponse,
                new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            var result = GetGeolocationResult(geolocationResponse);
            result.QueriedAddress = address;
            return result;
        }
        catch (Exception ex)
        {
            return new GeolocationResult { ErrorMessage = ex.Message };
        }
    }

    private static GeolocationResult GetGeolocationResult(GeolocationResponse response)
    {
        var geolocationResult = new GeolocationResult();
        switch (response.Status)
        {
            case "OK" when response.Results.Count == 1:
                geolocationResult.Latitude = response.Results[0].Geometry.Location.Latitude;
                geolocationResult.Longitude = response.Results[0].Geometry.Location.Longitude;
                geolocationResult.FormattedAddress = response.Results[0].FormattedAddress;
                geolocationResult.Precision = response.Results[0].Geometry.Type;
                geolocationResult.Success = true;
                break;
            case "OK" when response.Results.Count > 1:
                if (AllLocationsAreWithinRadiusOfEachOther(response))
                {
                    // All locations are within the 250m radius, use first one as the result
                    geolocationResult.Latitude = response.Results[0].Geometry.Location.Latitude;
                    geolocationResult.Longitude = response.Results[0].Geometry.Location.Longitude;
                    geolocationResult.FormattedAddress = response.Results[0].FormattedAddress;
                    geolocationResult.Precision = response.Results[0].Geometry.Type;
                    geolocationResult.Success = true;
                }
                else
                {
                    // Any of the locations are further apart than the 250m limit, return validation error
                    geolocationResult.ErrorMessage = $"Multiple instances of the geolocated address have been found and fall outside of the {RadiusLimitMeters}m proximity";
                }
                break;
            case "ZERO_RESULTS":
                geolocationResult.ErrorMessage = "Geolocated address not found";
                break;
            default:
                geolocationResult.ErrorMessage = response.ErrorMessage;
                break;
        }

        return geolocationResult;
    }

    private static bool AllLocationsAreWithinRadiusOfEachOther(GeolocationResponse response)
    {
        for (int i = 0; i < response.Results.Count; i++)
        {
            var locationA = response.Results[i].Geometry.Location;

            for (int j = i + 1; j < response.Results.Count; j++)
            {
                var locationB = response.Results[j].Geometry.Location;
                double distance = CalculateDistance(locationA, locationB);

                if (distance > RadiusLimitMeters)
                {
                    return false;
                }
            }
        }

        return true;
    }

    private static double CalculateDistance(Location loc1, Location loc2)
    {
        // Using Haversine formula
        const double earthRadiusMeters = 6371000; // Earth's radius in meters
        var dLat = DegreesToRadians(loc2.Latitude - loc1.Latitude);
        var dLon = DegreesToRadians(loc2.Longitude - loc1.Longitude);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(loc1.Latitude)) * Math.Cos(DegreesToRadians(loc2.Latitude)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        var distance = earthRadiusMeters * c; // Distance in meters
        return distance;
    }

    private static double DegreesToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }
}