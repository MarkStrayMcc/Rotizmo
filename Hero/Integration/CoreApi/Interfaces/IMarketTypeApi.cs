using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IMarketTypeApi
    {

        Task<List<string>> GetMarketTypes();
    }
}
