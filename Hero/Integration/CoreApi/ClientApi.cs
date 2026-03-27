using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;

namespace Hero.Integration.CoreApi
{
    public class ClientApi : BaseApi, IClientApi
    {
        private readonly string _clientGetUrl;

        private readonly string _clientSearchUrl;

        private readonly string _clientFolderUrl;

        private readonly string _clientClientLatestReferenceUrl;

        public ClientApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _clientGetUrl = _configuration["CoreApi:Client"];
            _clientSearchUrl = _configuration["CoreApi:ClientSearch"];
            _clientFolderUrl = _configuration["CoreApi:ClientFolderGet"];
            _clientClientLatestReferenceUrl = _configuration["CoreApi:ClientLatestReference"];
        }
        
        public async Task<Models.Client> GetAsync(string policyNumber)
        {
            var client = await GetAsyncTyped<Client>(_clientGetUrl.Replace("{policyNumber}", policyNumber));
            return client;
        }

        public async Task<List<ClientSearchResult>> SearchAsync(string searchTerm)
        {
            var encodedSearchTerm = HttpUtility.UrlEncode(searchTerm);
            var url = _clientSearchUrl.Replace("{name}", encodedSearchTerm);
            var clients = await GetAsyncTyped<List<ClientSearchResult>>(url);

            return clients;
        }

        public async Task<string> GetClientFolderByClientId(int clientId)
        {
            var clientFolderPath = await GetAsyncTyped<string>(_clientFolderUrl.Replace("{clientId}", clientId.ToString()));
            return clientFolderPath;
        }

        public async Task<ClientLatestReferenceResponse> GetLatestActiveQuoteReference(LatestQuoteReferenceRequest request)
        {
            return await PostAsyncTyped<LatestQuoteReferenceRequest,ClientLatestReferenceResponse>(_clientClientLatestReferenceUrl.Replace("{clientId}", request.ClientId.ToString()),request);
        }
    }
}

