using Hero.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.DDPTApi.Interfaces
{
    public interface IWordingVersionApi
    {
        Task<List<WordingVersion>> GetWordingVersions(string productCode, string countryCode, string languageCode);
        Task<List<ExcessWordingVersion>> GetExcessWordingVersions(string productCode, string countryCode, string languageCode);
    }
}
