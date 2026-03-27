using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class CfcContactPersonalMessageApi : BaseApi, ICfcContactPersonalMessageApi
    {
        private readonly string _cfcContactUrl;
        public CfcContactPersonalMessageApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _cfcContactUrl = _configuration["CoreApi:CfcContacts"];
        }

        public async Task<CfcContactPersonalMessage> GetPersonalMessageById(int cfcContactId)
        {
            return await GetAsyncTyped<CfcContactPersonalMessage>($"{_cfcContactUrl}/{cfcContactId}/personalmessage");
        }

        [HttpPost]

        public Task<CfcContactPersonalMessage> SetPersonalMessage(CfcContactPersonalMessageChangeRequest request)
        {
            var url = $"{_cfcContactUrl}/personalmessage/add";

            return PostAsyncTyped<CfcContactPersonalMessageChangeRequest, CfcContactPersonalMessage>(url, request);
        }
    }
}
