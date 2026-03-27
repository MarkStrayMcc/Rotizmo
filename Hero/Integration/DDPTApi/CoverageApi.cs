using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.DDPTApi.Interfaces;
using WebApiDto.Dto.DDPT;
using CoverageType = WebApiDto.Dto.CoverageType;

namespace Hero.Integration.DDPTApi
{
    public class CoverageApi : BaseDDPTApi, ICoverageApi
    {
        private static string _apiUrl;

        public CoverageApi(IConfigurationRoot configuration) : base(configuration)
        {
            _apiUrl = configuration["CoreApi:GetCoverageTypes"];
        }

        public async Task<List<CoverageType>> GetCoverageTypes(CoverageRequest coverage)
        {
            var url = $"{_apiUrl.TrimEnd('/')}";
            return await PostAsyncTyped<CoverageRequest, List<CoverageType>>(url, coverage);
        }
    }
}
