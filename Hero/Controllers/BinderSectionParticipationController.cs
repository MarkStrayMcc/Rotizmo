using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;

namespace Hero.Controllers
{
    public class BinderSectionParticipationController : Controller
    {
        private readonly IBinderSectionParticipationApi binderSectionParticipationApi;

        public BinderSectionParticipationController(IBinderSectionParticipationApi binderSectionParticipationApi) =>
            this.binderSectionParticipationApi = binderSectionParticipationApi;

        [HttpGet("[controller]/[action]")]
        [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
        public async Task<IActionResult> GetBinderSectionParticipationLookups()
        {
            var binderSectinoParticipation = await this.binderSectionParticipationApi.GetBinderSectionParticipationLookups();

            return this.Ok(binderSectinoParticipation);
        }
    }
}
