using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class MarketTypeApi : BaseApi, IMarketTypeApi
    {
        private readonly string marketTypesUrl;
        
        public MarketTypeApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            this.marketTypesUrl = configuration["CoreApi:MarketTypes"];
        }

        public async Task<List<String>> GetMarketTypes()
        {
            return await GetAsyncTyped<List<String>>(this.marketTypesUrl);
        }
        
    }
}