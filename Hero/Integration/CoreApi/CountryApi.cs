using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class CountryApi : BaseApi, ICountryApi
    {
        private readonly string _countriesUrl;

        public CountryApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(
            configuration, httpContextAccessor)
        {
            _countriesUrl = _configuration["CoreApi:Countries"];
        }

        public async Task<List<Country>> GetAsync()
        {
            return await GetAsyncTyped<List<Country>>(_countriesUrl);
        }
    }
}
