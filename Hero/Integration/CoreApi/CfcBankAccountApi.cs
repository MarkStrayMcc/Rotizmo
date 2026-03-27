using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class CfcBankAccountApi : BaseApi, ICfcBankAccountApi
    {
        private readonly string _cfcBankAccountsUrl;
        public CfcBankAccountApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _cfcBankAccountsUrl = _configuration["CoreApi:CfcBankAccounts"];
        }

        public async Task<List<CfcBankAccount>> GetAsync()
        {
            return await GetAsyncTyped<List<CfcBankAccount>>(_cfcBankAccountsUrl);
        }
    }
}
