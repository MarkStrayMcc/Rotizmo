using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class CfcContactApi : BaseApi, ICfcContactApi
    {
        private readonly string _cfcContactsUrl;
        public CfcContactApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _cfcContactsUrl = _configuration["CoreApi:CfcContacts"];
        }

        public async Task<List<CfcContact>> GetByInitialsAsync()
        {
            return await GetAsyncTyped<List<CfcContact>>(_cfcContactsUrl);
        }

        public async Task<List<CfcContact>> SearchAsync(string searchTerm)
        {
            return await GetAsyncTyped<List<CfcContact>>($"{_cfcContactsUrl}/search?searchTerm={searchTerm}");
        }

        public async Task<CfcContact> GetByInitialsAsync(string initals)
        {
            return await GetAsyncTyped<CfcContact>($"{_cfcContactsUrl}/getbyinitials/{initals}");
        }

        public async Task<CfcContact> GetByUsernameAsync(string username)
        {
            return await GetAsyncTyped<CfcContact>($"{_cfcContactsUrl}/getbyusername/{username}");
        }

        public async Task<List<CfcContact>> GetUnderwritersForReferral(int quoteId)
        {
            return await GetAsyncTyped<List<CfcContact>>($"{_cfcContactsUrl}/referees?quoteId={quoteId}");
        }
    }
}
