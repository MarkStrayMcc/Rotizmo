using System.Threading.Tasks;
using Hero.Models.Geolocation;

namespace Hero.Integration.Geolocation;

public interface IGeolocationService
{
    Task<GeolocationResult> GetAsync(string address);
}