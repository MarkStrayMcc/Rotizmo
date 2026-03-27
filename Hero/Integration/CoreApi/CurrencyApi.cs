using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class CurrencyApi : BaseApi, ICurrencyApi
    {
        private readonly string _currenciesUrl;
        public CurrencyApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _currenciesUrl = _configuration["CoreApi:Currencies"];
        }

        public async Task<List<Currency>> GetAsync()
        {
            return await GetAsyncTyped<List<Currency>>(_currenciesUrl);
        }

        public async Task<Currency> GetByCountryIdAsync(int countryId)
        {
            return await GetAsyncTyped<Currency>($"{_currenciesUrl}/{countryId}");
        }

        public async Task<string> GetByIsoCodeIdAsync(string isocode)
        {
            return await GetAsyncTyped<string>($"{_currenciesUrl}/{isocode}/symbol");
        }

        public async Task<decimal> GetRateAsync(string isocode)
        {
            return await GetAsyncTyped<decimal>($"{_currenciesUrl}/{isocode}/rate");
        }
    }
}
