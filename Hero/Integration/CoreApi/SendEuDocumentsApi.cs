using System.Threading.Tasks;
using Cfc.CoreApi.Integration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi.Interfaces
{
    public class SendEuDocumentsApi : BaseApi, ISendEuDocumentsApi
    {
        private readonly string _sendEuDocumentsUrl;

        public SendEuDocumentsApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _sendEuDocumentsUrl = configuration["CoreApi:SendEuDocuments"];
        }

        public async Task<SendEuDocumentsResult> SendEuDocuments(SendEuDocumentsRequest sendEuDocumentsRequest)
        {
            return await PostAsyncTyped<SendEuDocumentsRequest, SendEuDocumentsResult>(_sendEuDocumentsUrl, sendEuDocumentsRequest);
        }
    }
}