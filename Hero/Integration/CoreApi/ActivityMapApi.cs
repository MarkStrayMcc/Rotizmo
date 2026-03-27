using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;
using System.Web;

namespace Hero.Integration.CoreApi
{
    public class ActivityMapApi : BaseApi, IActivityMapApi
    {
        private readonly string _activityMapUrl;
        private readonly string _activityTreeUrl;
        public ActivityMapApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _activityMapUrl = _configuration["CoreApi:Activitymap"];
            _activityTreeUrl = _configuration["CoreApi:ActivityTree"];
        }

        public async Task<List<ActivityMap>> GetAsync(int productId, int? parentId)
        {
            return await GetAsyncTyped<List<ActivityMap>>($"{_activityMapUrl}/{productId}/{parentId}");
        }

        public async Task<List<ActivityMap>> GetAsync(string productCode, string childActivityCode)
        {
            return await GetAsyncTyped<List<ActivityMap>>($"{_activityTreeUrl}/?productCode={HttpUtility.UrlEncode(productCode)}&activityCode={HttpUtility.UrlEncode(childActivityCode)}");
        }
    }
}
