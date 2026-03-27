using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Integration.CoreApi
{
    public class PolicyEmailApi : BaseApi, IPolicyEmailApi
    {
        private readonly string _getEmailTemplateForPolicyUrl;

        public PolicyEmailApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _getEmailTemplateForPolicyUrl = _configuration["CoreApi:Email:GetTemplateForPolicy"];
        }

        public Task<EmailTemplate> GetEmailTemplateForPolicy(string policyNumber)
        {
            return GetAsyncTyped<EmailTemplate>(_getEmailTemplateForPolicyUrl.Replace("{policyNumber}", policyNumber));
        }
    }
}
