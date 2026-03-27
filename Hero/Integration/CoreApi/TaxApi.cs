using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Hero.Integration.CoreApi
{
    public class TaxApi : BaseApi, ITaxApi
    {
        private string _totalTaxRateUrl;
        private string _gstRateUrl;
        private string _goodsAndServicesTaxUrl;

        public TaxApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _totalTaxRateUrl = _configuration["CoreApi:TotalTaxRate"];
            _gstRateUrl = _configuration["CoreApi:GSTRate"];
            _goodsAndServicesTaxUrl = _configuration["CoreApi:GoodsAndServicesTax"];
        }

        public async Task<decimal> GetTotalTaxRateAsync(Guid draftQuoteId)
        {
            _totalTaxRateUrl = $"{_totalTaxRateUrl}/{draftQuoteId}";
            return await GetAsyncTyped<decimal>(_totalTaxRateUrl);
        }

        public async Task<decimal> GetGSTAsync(DateTime inceptionDate)
        {
            return await PostAsyncTyped<DateTime, decimal>(_gstRateUrl, inceptionDate);
        }

        public async Task<decimal> GetGoodsAndServicesTaxAsync(DateTime effectiveDate, string countryIsoCode,
            bool isRegistered)
        {
            var url = $"{_goodsAndServicesTaxUrl}/?effectiveDate={effectiveDate.ToString("yyyy-MM-dd")}&countryIsoCode={countryIsoCode}&isRegistered={isRegistered}";
            return await GetAsyncTyped<decimal>(url);
        }
    }
}
