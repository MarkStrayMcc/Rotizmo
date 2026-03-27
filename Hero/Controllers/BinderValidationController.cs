using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class BinderValidationController : Controller
    {
        private readonly IBinderValidationApi binderValidationApi;

        public BinderValidationController(IBinderValidationApi binderValidationApi) =>
            this.binderValidationApi = binderValidationApi;

        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetBinderValidationCriterias(string draftQuoteId, string businessLineCodes)
        {
            var binderValidationCriterias = await this.binderValidationApi.GetBinderValidationCriterias(draftQuoteId, businessLineCodes);

            return this.Ok(binderValidationCriterias);
        }
    }
}
