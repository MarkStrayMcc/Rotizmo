using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models.Brokers;
using Microsoft.AspNetCore.Http;

namespace Hero.Integration.CoreApi
{
    public class BrokerContactApi : BaseApi, IBrokerContactApi
    {
        private readonly string _brokerContactUrl;

        public BrokerContactApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _brokerContactUrl = configuration["CoreApi:BrokerContact"];
        }

        public async Task<BrokerInformationResponse> GetBrokerContact(int brokerContactId, bool includeFullBrokerDetails)
        {
            var url = $"{_brokerContactUrl.Replace("{brokerContactId}/", brokerContactId.ToString())}?includeFullBrokerDetails={includeFullBrokerDetails}";
            return await GetAsyncTyped<BrokerInformationResponse>(url);
        }
    }
}