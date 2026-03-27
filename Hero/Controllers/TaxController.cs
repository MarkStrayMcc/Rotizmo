using Hero.Integration.CoreApi.Tax;
using System;
using System.Threading.Tasks;

using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Hero.Controllers
{


    public class TaxController : Controller
    {
        private readonly ITaxApi _taxTaxApi;
        private readonly ITaxClient _taxTaxClient;

        public TaxController(ITaxApi taxApi, ITaxClient taxClient)
        {
            this._taxTaxApi = taxApi;
            this._taxTaxClient = taxClient;
        }

        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetTotalTaxRate(Guid draftQuoteId)
        {
            var amount = await _taxTaxApi.GetTotalTaxRateAsync(draftQuoteId);
            return Ok(amount);
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetGSTRate(DateTime inceptionDate)
        {
            var amount = await _taxTaxApi.GetGSTAsync(inceptionDate);
            return Ok(amount);
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetGoodsAndServicesTax(DateTime effectiveDate, string countryIsoCode, bool isRegistered)
        {
            try
            {
                GoodsAndServicesTaxResponse goodsAndServicesTaxResponse = await _taxTaxClient.Tax_GetGoodsAndServicesTaxAsync(effectiveDate, countryIsoCode, isRegistered);
                return Ok(goodsAndServicesTaxResponse);
            }
            catch (Hero.Integration.CoreApi.Tax.SwaggerException<Hero.Integration.CoreApi.Tax.ProblemDetails> problemDetailsException)
            {
                if (problemDetailsException.StatusCode == 404)
                {
                    return NotFound(problemDetailsException.Result);
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, problemDetailsException.Result);
                }

            }
        }
    }
}
