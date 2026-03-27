using System.Threading.Tasks;

namespace Hero.Integration.Geolocation;

public interface IGeolocationClient
{
    Task<string> GetAsync(string address);
}