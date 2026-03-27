using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Hero.Integration.CoreApi.Interfaces;
using WebApiDto.Dto;

namespace Hero.Controllers
{
    public class ActivityMapController : Controller
    {
        private readonly IActivityMapApi _activityMapApi;

        public ActivityMapController(IActivityMapApi activityMapApi)
        {
            _activityMapApi = activityMapApi;
        }

        [HttpGet("[controller]/[action]")]
        public async Task<List<ActivityMap>> GetActivity(int productId, int? parentId)
        {
            var activities = await _activityMapApi.GetAsync(productId, parentId);
            return activities;
        }

        [HttpGet("[controller]/activity-tree")]
        public async Task<List<ActivityMap>> GetActivityTree(string productCode, string childActivityCode)
        {
            var activities = await _activityMapApi.GetAsync(productCode, childActivityCode);
            return activities;
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
