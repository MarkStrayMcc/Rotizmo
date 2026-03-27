using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace Hero.Integration.Cache
{
    public class CacheHelper : ICacheHelper
    {
        private IDistributedCache _cache;

        public CacheHelper(IDistributedCache cache)
        {
            this._cache = cache;
        }

        public async Task SaveToCache<T>(string key, T item, int? expirationInHours = null)
        {
            var json = JsonConvert.SerializeObject(item);

            if (expirationInHours.HasValue && expirationInHours.Value > 0)
            {
                await _cache.SetStringAsync(key, json, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(expirationInHours.Value)
                });
            }
            else
            {
                await _cache.SetStringAsync(key, json);
            }
        }

        public async Task<T> RetrieveFromCache<T>(string key)
        {
            var json = await _cache.GetStringAsync(key);

            return json == null ? default(T) : JsonConvert.DeserializeObject<T>(json);
        }
    }
}
