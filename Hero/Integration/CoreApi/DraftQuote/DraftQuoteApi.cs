using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi.DraftQuote
{
    public class DraftQuoteApi : BaseApi, IDraftQuoteApi
    {
        private readonly string _resolveDraftQuoteUrl;

        public DraftQuoteApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _resolveDraftQuoteUrl = _configuration["CoreApi:ResolveDraftQuoteForEnquiry"];
        }

        public async Task<QuoteData> ResolveDraftQuoteAsync(int enquiryId)
        {
            return await GetAsyncTyped<QuoteData>($"{_resolveDraftQuoteUrl}?enquiryId={enquiryId}");
        }
    }
}
