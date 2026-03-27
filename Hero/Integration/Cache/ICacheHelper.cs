using System.Threading.Tasks;

namespace Hero.Integration.Cache
{
    public interface ICacheHelper
    {
        Task<T> RetrieveFromCache<T>(string key);
        Task SaveToCache<T>(string key, T item, int? expirationInHours = null);
    }
}