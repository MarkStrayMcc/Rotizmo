namespace Hero.Models.Geolocation;

public class GeolocationResult
{
    public bool Success { get; set; }
    public string ErrorMessage { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Precision { get; set; }
    public string FormattedAddress { get; set; }
    public string QueriedAddress { get; set; }
    public string AddressLine1 { get; set; }
}