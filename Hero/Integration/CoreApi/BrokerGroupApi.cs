using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public class BrokerGroupApi : BaseApi, IBrokerGroupApi
    {
        private readonly string _coreApiUrl;

        public BrokerGroupApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _coreApiUrl = configuration["CoreApi:BaseUrl"];
        }

        public async Task<BrokerGroup> GetBrokerGroupInfo(int brokerGroupId)
        {
            var url = $"{_coreApiUrl}api/brokergroup?id={brokerGroupId}";
            return await GetAsyncTyped<BrokerGroup>(url);
        }
    }
}