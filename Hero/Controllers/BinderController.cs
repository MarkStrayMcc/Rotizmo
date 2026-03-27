using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class BinderController : Controller
    {
        private readonly IBinderApi _binderApi;

        public BinderController(IBinderApi binderApi)
        {
            _binderApi = binderApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> BinderLookups()
        {
            var binderLookups = await _binderApi.GetBinderLookups();

            return Ok(binderLookups);
        }

        [HttpGet("[controller]/[action]")]
        public async Task<IActionResult> BinderSectionLookups()
        {
            var binderLookups = await _binderApi.GetBinderSectionLookups();

            return Ok(binderLookups);
        }
    }
}
