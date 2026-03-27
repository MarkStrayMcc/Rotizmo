using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    [Route("[controller]/[action]")]
    public class CurrencyController : Controller
    {
        private readonly ICurrencyApi _currencyApi;

        public CurrencyController(ICurrencyApi currencyApi)
        {
            _currencyApi = currencyApi;
        }

        [HttpGet]
        public async Task<IActionResult> Currencies()
        {
            var currencies = await _currencyApi.GetAsync();
            return Ok(currencies);
        }
        
        [HttpGet]
        public async Task<IActionResult> Currency(int countryId)
        {
            var currency = await _currencyApi.GetByCountryIdAsync(countryId);
            return Ok(currency);
        }

        /// <summary>
        /// Get the currency symbol for a given isocode
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> CurrencySymbol(string isocode)
        {
            var currency = await _currencyApi.GetByIsoCodeIdAsync(isocode);
            return Ok(currency);
        }

        /// <summary>
        /// Get the currency rate for a given isocode
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> CurrencyRate(string isocode)
        {
            var rate = await _currencyApi.GetRateAsync(isocode);
            return Ok(rate);
        }
    }
}
