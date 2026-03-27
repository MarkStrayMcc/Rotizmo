using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public class BrokerTeamApi : BaseApi, IBrokerTeamApi
    {
        private readonly string _coreApiUrl;

        public BrokerTeamApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _coreApiUrl = configuration["CoreApi:BaseUrl"];
        }

        public async Task<IEnumerable<BrokerTeam>> GetByCountryIsoCodes(IEnumerable<string> countryIsoCodes) 
        {
            var url = $"{_coreApiUrl}api/broker-teams?countryIsoCode={string.Join("&countryIsoCode=", countryIsoCodes)}";
            return await GetAsyncTyped<IEnumerable<BrokerTeam>>(url);
        }
    }
}