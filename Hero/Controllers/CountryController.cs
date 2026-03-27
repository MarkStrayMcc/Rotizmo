using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class CountryController : Controller
    {
        private readonly ICountryApi _countryApi;

        public CountryController(ICountryApi countryApi)
        {
            _countryApi = countryApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> GetCountry()
        {
            var countries = await _countryApi.GetAsync();
            return Ok(countries);
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
