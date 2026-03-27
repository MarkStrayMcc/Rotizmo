using Hero.Integration.CoreApi.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using BinderRatingEngineOutput = WebApiDto.Dto.BinderRatingEngine.BinderRatingEngineOutput;
using Quote = WebApiDto.Dto.Quote;
using TriaPremiumRequest = Hero.Models.TriaPremiumRequest;

namespace Hero.Integration.CoreApi
{

    public class PricingApi : BaseApi, IPricingApi
    {
        private readonly string _pricingUrl;
        private readonly string _triaPremiumUrl;

        public PricingApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _pricingUrl = _configuration["CoreApi:DefaultPricingDetails"];
            _triaPremiumUrl = _configuration["CoreApi:TriaPremium"];
        }

        public async Task<List<BinderRatingEngineOutput>> GetDefaultPricingDetails(Guid draftQuoteId)
        {
            return await GetAsyncTyped<List<BinderRatingEngineOutput>>($"{_pricingUrl}/{draftQuoteId}");
        }

        public async Task<List<BinderRatingEngineOutput>> GetDefaultPricingInformationForSavedQuote(Quote quote, bool hasAgreedPremium)
        {
            return await PostAsyncTyped<Quote, List<BinderRatingEngineOutput>>($"{_pricingUrl}?hasAgreedPremium={hasAgreedPremium}", quote);
        }

        public async Task<decimal> CalculateTriaPremium(TriaPremiumRequest request)
        {
            return await PostAsyncTyped<TriaPremiumRequest, decimal>(_triaPremiumUrl, request);
        }
    }
}