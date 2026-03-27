using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Hero.Models.GeoLocation.GoogleApi;

public class GeolocationResponse
{
    public List<Result> Results { get; set; }

    public string Status { get; set; }

    [JsonPropertyName("error_message")]
    public string ErrorMessage { get; set; }
}

public class Result  
{
    public Geometry Geometry { get; set; }

    [JsonPropertyName("formatted_address")]
    public string FormattedAddress { get; set; }
}

public class Geometry
{
    public Location Location { get; set; }

    [JsonPropertyName("location_type")]
    public string Type { get; set; }
}

public class Location
{
    [JsonPropertyName("lat")]
    public double Latitude { get; set; }

    [JsonPropertyName("lng")]
    public double Longitude { get; set; }
}