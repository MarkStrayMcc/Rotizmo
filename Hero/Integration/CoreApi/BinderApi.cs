using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class BinderApi : BaseApi, IBinderApi
    {
        private readonly string _binderUrl;
        private readonly string _binderSectionUrl;

        public BinderApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _binderUrl = configuration["CoreApi:Binder"];
            _binderSectionUrl = configuration["CoreApi:BinderSection"];
        }

        public async Task<List<BinderLookup>> GetBinderLookups()
        {
            return await GetAsyncTyped<List<BinderLookup>>(_binderUrl + "/lookups");
        }
        public async Task<List<BinderSectionLookup>> GetBinderSectionLookups()
        {
            return await GetAsyncTyped<List<BinderSectionLookup>>(_binderSectionUrl + "/lookups");
        }

    }
} 
