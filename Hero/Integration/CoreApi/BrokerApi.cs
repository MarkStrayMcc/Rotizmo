using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Hero.Integration.CoreApi
{
    public class BrokerApi : BaseApi, IBrokerApi
    {
        private readonly string brokerUrl;

        public BrokerApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            this.brokerUrl = configuration["CoreApi:Broker"];
        }

        public async Task<decimal> GetBrokerCommissionRate(int brokerTeamId, int productId)
        {
            return await GetAsyncTyped<decimal>($"{brokerUrl}commissionrate?brokerTeamId={brokerTeamId}&productId={productId}");
        }
    }
}