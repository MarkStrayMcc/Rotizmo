using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi
{
    public class InsuranceTypeApi : BaseApi, IInsuranceTypeApi
    {
        private readonly string _insuranceTypesUrl;
        public InsuranceTypeApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _insuranceTypesUrl = _configuration["CoreApi:InsuranceTypes"];
        }

        public async Task<List<InsuranceType>> GetAsync()
        {
            return await GetAsyncTyped<List<InsuranceType>>(_insuranceTypesUrl);
        }
    }
}
