using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class BinderValidationApi : BaseApi, IBinderValidationApi
    {
        public BinderValidationApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor)
            : base(configuration, httpContextAccessor)
        {
            this.BinderValidationCriteriaUrl = configuration["CoreApi:BinderValidationCriterias"];
        }

        protected string BinderValidationCriteriaUrl { get; }

        public async Task<IDictionary<string, IEnumerable<BinderValidationCriteria>>> GetBinderValidationCriterias(
            string draftQuoteId,
            string businessLineCodes)
        {
            return await GetAsyncTyped<IDictionary<string, IEnumerable<BinderValidationCriteria>>>(
                       $"{this.BinderValidationCriteriaUrl}/{draftQuoteId}/{businessLineCodes}");
        }
    }
}
