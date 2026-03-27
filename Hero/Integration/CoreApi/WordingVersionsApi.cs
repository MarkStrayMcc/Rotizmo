using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.Extensions;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto.DDPT;

namespace Hero.Integration.CoreApi
{
    public class WordingVersionsApi : BaseApi, IWordingVersionsApi
    {
        private readonly string _isPublishableWordingVersionUrl;
        private readonly string _getWordingDocumentUrl;

        public WordingVersionsApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _isPublishableWordingVersionUrl = _configuration["CoreApi:IsPublishableWordingVersion"];
            _getWordingDocumentUrl = _configuration["CoreApi:GetWordingDocument"];
        }

        public async Task<bool> IsPublishableWordingVersion(int wordingVersionId)
        {
            var url = _isPublishableWordingVersionUrl.Replace("{wordingVersionId}", wordingVersionId.ToString());
            return await GetAsyncTyped<bool>(url);
        }

        public async Task<DocumentResult> GetDocument(string format, int wordingVersionId, string countryIsoCode, int brokerTeamId, string productName, 
            string stateProvinceCode, bool isAdmitted = false, string cfcTeamCoverholder = null)
        {
            var url = BuildDocumentUrl(format, wordingVersionId, countryIsoCode, brokerTeamId, productName,
                stateProvinceCode, isAdmitted, cfcTeamCoverholder);

            return await GetAsyncTyped<DocumentResult>(url);
        }

        private string BuildDocumentUrl(string format, int wordingVersionId, string countryIsoCode, int brokerTeamId, string productCode, 
            string stateProvinceCode, bool isAdmitted = false, string cfcTeamCoverholder = null)
        {
            var url = _getWordingDocumentUrl
                .Replace("{fileFormat}", format)
                .Replace("{wordingVersionId}", wordingVersionId.ToString())
                .Replace("{countryIsoCode}", countryIsoCode)
                .Replace("{brokerTeamId}", brokerTeamId.ToString())
                .AddParameter("productCode", productCode)
                .AddParameter("stateProvinceCode", stateProvinceCode)
                .AddParameter("isAdmitted", $"{isAdmitted}")
                .AddParameter("coverholder", $"{cfcTeamCoverholder}");

            return url;
        }
    }
}