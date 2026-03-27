using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class EmailContactApi : BaseApi, IEmailContactApi
    {
        private readonly string _getEmailContactsUrl;

        public EmailContactApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _getEmailContactsUrl = _configuration["CoreApi:Email:GetContacts"];
        }

        public Task<List<WebApiDto.Dto.EmailContact>> GetEmailContacts()
        {
            return GetAsyncTyped<List<WebApiDto.Dto.EmailContact>>(_getEmailContactsUrl);
        }
    }
}