using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class BinderSectionParticipationApi : BaseApi, IBinderSectionParticipationApi
    {
        public BinderSectionParticipationApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            BinderSectionParticipationUrl = configuration["CoreApi:BinderSectionParticipations"];
        }

        protected string BinderSectionParticipationUrl { get; }

        public async Task<IEnumerable<BinderSectionParticipation>> GetBinderSectionParticipationLookups()
        {
            return await GetAsyncTyped<IEnumerable<BinderSectionParticipation>>($"{BinderSectionParticipationUrl}");
        }
    }
}
