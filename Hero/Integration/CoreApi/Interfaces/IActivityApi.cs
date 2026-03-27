using Hero.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IActivityApi
    {
        Task<List<ActivitySearchResponse>> GetAsync(string productCode, string name);
    }
}
