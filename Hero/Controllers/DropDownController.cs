using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hero.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Hero.Integration.Cache;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.DDPTApi.Interfaces;
using WebApiDto.Dto;
using WebApiDto.Dto.MapApis;

namespace Hero.Controllers
{
    [Route("[controller]/[action]")]
    public class DropDownController : Controller
    {
        private readonly ICountryApi _countryApi;
        private readonly ICurrencyApi _currencyApi;
        private readonly IProductApi _productApi;
        private readonly ICfcContactApi _cfcContactApi;
        private readonly IInsuranceTypeApi _insuranceTypeApi;
        private readonly ILocationApi _locationApi;
        private readonly IWordingVersionApi _wordingVersionApi;
        private readonly ISurplusLineApi _surplusLineApi;

        public DropDownController(
            ICountryApi countryApi,
            ICurrencyApi currencyApi,
            IProductApi productApi,
            ICfcContactApi cfcContactApi,
            IInsuranceTypeApi insuranceTypeApi,
            ILocationApi locationApi,
            IWordingVersionApi wordingVersionApi,
            ISurplusLineApi surpluslineApi,
            ICacheHelper cacheHelper,
            IConfiguration configuration)
        {
            _countryApi = countryApi;
            _currencyApi = currencyApi;
            _productApi = productApi;
            _cfcContactApi = cfcContactApi;
            _insuranceTypeApi = insuranceTypeApi;
            _locationApi = locationApi;
            _wordingVersionApi = wordingVersionApi;
            _surplusLineApi = surpluslineApi;
        }

        [HttpGet]
        public async Task<IActionResult> Countries()
        {
            var contacts = await _countryApi.GetAsync();
            return Ok(contacts.Select(c => c.ToDropDownData()).ToList());
        }

        [HttpGet]
        public async Task<IActionResult> Currencies()
        {
            var currencies = await _currencyApi.GetAsync();
            return Ok(currencies.Select(c => c.ToDropDownData()).ToList());
        }

        [HttpGet]
        public async Task<IActionResult> Currency(int countryId)
        {
            var currency = await _currencyApi.GetByCountryIdAsync(countryId);
            return Ok(currency.ToDropDownData());
        }

        [HttpGet]
        public async Task<IActionResult> CfcContacts(string searchTerm)
        {
            var contacts = string.IsNullOrEmpty(searchTerm)
                ? await _cfcContactApi.GetByInitialsAsync()
                : await _cfcContactApi.SearchAsync(searchTerm);

            var result = contacts.Select(c => c.ToDropDownData()).ToList();
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> Products(string searchTerm)
        {
            var products = !string.IsNullOrEmpty(searchTerm)
                ? await _productApi.GetAsync()
                : await _productApi.SearchAsync(searchTerm);

            return Ok(products.Select(p => p.ToDropDownData()).ToList());
        }

        [HttpGet]
        public async Task<IActionResult> InsuranceTypes()
        {
            var contacts = await _insuranceTypeApi.GetAsync();
            return Ok(contacts.Select(c => c.ToDropDownData()).ToList());
        }

        [HttpGet]
        public async Task<IActionResult> GetLanguages()
        {
            try
            {
                //TODO Needs to come from database
                var languages = new List<Language>()
                {
                    new Language {LanguageId = 1, Name = "English"}
                };
                var result = await Task.Run(() => languages.Select(c => c.ToDropDownData()));

                return Ok(result);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCountryStates(string countryCode)
        {
            var countryStates = await _locationApi.GetCountryStates(countryCode);
            return Ok(countryStates.Select(a => a.ToDropDownData()).ToList());
        }

        [HttpPost]
        public async Task<IActionResult> GetAutotcompleteAddress([FromBody] AutocompleteRequest model)
        {
            var addresses = await _locationApi.GetAutocompleteAddressAsync(model);
            return Ok(addresses.Predictions.Select(a => a.ToDropDownData()).ToList());
        }

        [HttpGet]
        public async Task<IActionResult> GetWordingVersions(string productCode, string countryCode, string languageCode)
        {
            try
            {
                var wordingVersions = await _wordingVersionApi.GetWordingVersions(productCode, countryCode, languageCode);
                return Ok(wordingVersions.Select(w => w.ToDropDownData()).ToList());
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetExcessWordingVersions(string productCode, string countryCode, string languageCode)
        {
            try
            {
                var excessWordingVersions = await _wordingVersionApi.GetExcessWordingVersions(productCode, countryCode, languageCode);
                return Ok(excessWordingVersions.Select(w => w.ToDropDownData()).ToList());
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUnderwritersForReferral(int quoteId)
        {
            try
            {
                var underwriters = await _cfcContactApi.GetUnderwritersForReferral(quoteId);
                return Ok(underwriters);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> QuoteTypes()
        {
            try
            {
                var quoteTypes = new List<DropDownData>
                {
                    new DropDownData { Text = "New", Value = QuoteTypeHelper.NewBusiness },
                    new DropDownData { Text = "Renewal", Value = QuoteTypeHelper.Renewal },
                };
                return Ok(quoteTypes);
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}
