using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class ClientClearanceApi : BaseApi, IClientClearanceApi
    {
        private readonly string _clientClearanceUrl;

        public ClientClearanceApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _clientClearanceUrl = _configuration["CoreApi:ClientClearance"];
        }

        public async Task<ClientClearanceResult> CheckForBroker(ClientClearanceRequest clientClearanceRequest)
        {
            return await PostAsyncTyped<ClientClearanceRequest, ClientClearanceResult>(_clientClearanceUrl, clientClearanceRequest);
        }
    }
}

