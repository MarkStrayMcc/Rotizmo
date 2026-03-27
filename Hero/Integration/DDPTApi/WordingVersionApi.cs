using Hero.Integration.DDPTApi.Interfaces;
using Hero.Models;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace Hero.Integration.DDPTApi
{
    public class WordingVersionApi : BaseDDPTApi, IWordingVersionApi
    {
        private readonly string _wordingVersionsUrl;
        private readonly string _excessWordingVersionsUrl;

        public WordingVersionApi(IConfigurationRoot configuration) : base(configuration)
        {
            _wordingVersionsUrl = Configuration["DDPTApi:WordingVersions"];
            _excessWordingVersionsUrl = Configuration["DDPTApi:ExcessWordingVersions"];
        }

        public async Task<List<WordingVersion>> GetWordingVersions(string productCode, string countryCode, string languageCode)
        {
            return await GetAsyncTyped<List<WordingVersion>>(GetUrl(_wordingVersionsUrl, productCode, countryCode, languageCode));
        }

        public async Task<List<ExcessWordingVersion>> GetExcessWordingVersions(string productCode, string countryCode, string languageCode)
        {
            return await GetAsyncTyped<List<ExcessWordingVersion>>(GetUrl(_excessWordingVersionsUrl, productCode, countryCode, languageCode));
        }

        private static string GetUrl(string url, string productCode, string countryCode, string languageCode)
        {
            var countryCodeParam = string.IsNullOrEmpty(countryCode) || countryCode.Equals("null") ? "" : $"&countryCode={WebUtility.UrlEncode(countryCode)}";
            var productCodeParam = string.IsNullOrEmpty(productCode) || productCode.Equals("null") ? "" : $"&productCode={WebUtility.UrlEncode(productCode)}";
            var languageCodeParam = string.IsNullOrEmpty(languageCode) || languageCode.Equals("null") ? "" : $"&languageCode={WebUtility.UrlEncode(languageCode)}";
            return $"{url}?{countryCodeParam}{productCodeParam}{languageCodeParam}";
        }
    }
}
