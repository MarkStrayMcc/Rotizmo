using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IBrokerTeamApi
    {
        Task<IEnumerable<BrokerTeam>> GetByCountryIsoCodes(IEnumerable<string> countryIsoCodes);
    }
}