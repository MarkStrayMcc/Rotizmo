using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Quote = Hero.Models.Quote;

namespace Hero.Controllers
{
    public class PricingController : Controller
    {
        private readonly IBrokerApi _brokerApi;
        private readonly IPricingApi _pricingApi;

        public PricingController(
            IBrokerApi brokerApi,
            IPricingApi pricingApi)
        {
            _brokerApi = brokerApi;
            _pricingApi = pricingApi;
        }

        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetDefaultPricingInformation(Guid draftQuoteId)
        {
            var defaultCoveragePricingDetails = await this._pricingApi.GetDefaultPricingDetails(draftQuoteId);

            return Ok(defaultCoveragePricingDetails);
        }

        [HttpPost("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetDefaultPricingInformationForSavedQuote([FromBody] Quote quote, bool hasAgreedPremium)
        {
            var defaultCoveragePricingDetails = await this._pricingApi.GetDefaultPricingInformationForSavedQuote(quote, hasAgreedPremium);

            return Ok(defaultCoveragePricingDetails);
        }

        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetDefaultCommissionRate(int brokerTeamId, int productId)
        {
            var defaultCommissionRate = await this._brokerApi.GetBrokerCommissionRate(brokerTeamId, productId);
            return Ok(new CommissionRate { Rate = defaultCommissionRate });
        }

        [HttpPost("pricing/tria")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> CalculateTriaInformation([FromBody] TriaPremiumRequest request)
        {
            var triaPremium = await _pricingApi.CalculateTriaPremium(request);
            return Ok(triaPremium);
        }

    }
}