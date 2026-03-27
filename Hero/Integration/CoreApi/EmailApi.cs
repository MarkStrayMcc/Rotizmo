using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi
{
    public class EmailApi : BaseApi, IEmailApi
    {
        private readonly string _sendEmailUrl;
        private readonly string _getEmailTemplateForEnquiryUrl;
        private readonly string _getEmailTemplateUrl;

        public EmailApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _sendEmailUrl = _configuration["CoreApi:Email:Send"];
            _getEmailTemplateForEnquiryUrl = _configuration["CoreApi:Email:GetTemplateForEnquiry"];
            _getEmailTemplateUrl = _configuration["CoreApi:Email:GetTemplate"];
        }

        public Task SendEmail(Email email, bool isHeroOrigin)
        {
            return PostAsyncTyped($"{_sendEmailUrl}?isHeroOrigin={isHeroOrigin}", email);
        }

        public Task<EmailTemplate> GetEmailTemplateForEnquiry(int enquiryId)
        {
            return GetAsyncTyped<EmailTemplate>(_getEmailTemplateForEnquiryUrl.Replace("{enquiryId}", enquiryId.ToString()));
        }

        public Task<EmailTemplate> GetEmailTemplate(Hero.Models.EmailType emailType)
        {
            return GetAsyncTyped<EmailTemplate>(_getEmailTemplateUrl.Replace("{templateType}", emailType.ToString("D")));
        }
    }
}