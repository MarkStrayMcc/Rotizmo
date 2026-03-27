using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class QuoteEmailApi : BaseApi, IQuoteEmailApi
    {
        private readonly string _getEmailTemplateForQuoteUrl;

        public QuoteEmailApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _getEmailTemplateForQuoteUrl = _configuration["CoreApi:Email:GetTemplateForQuote"];
        }

        public async Task<EmailTemplate> GetEmailTemplateForQuote(int quoteId)
        {
            var response = await GetAsyncTyped<EmailTemplate>(_getEmailTemplateForQuoteUrl.Replace("{quoteId}", quoteId.ToString()));
            return response;
        }
    }
}
