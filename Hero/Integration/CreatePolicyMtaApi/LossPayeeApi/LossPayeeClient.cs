using Hero.Integration.CoreApi;
using Hero.Models.CreatePolicyMta;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.CreatePolicyMtaApi.LossPayeeApi
{
    public class LossPayeeClient : BaseApi, ILossPayeeClient
    {
        private string lossPayeUrl = string.Empty;
        public string value = string.Empty;
        public LossPayeeClient(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            lossPayeUrl = configuration["CreatePolicyMtaApi:BaseUrl"];
        }

        public async Task<ICollection<LossPayee>> GetAsync(string policyNumber)
        {
            var url = $"{lossPayeUrl}api/policies/{policyNumber}/loss-payee";

            return await GetAsyncTyped<ICollection<LossPayee>>(url);
        }

        public async Task<string> PostAsync(string policyNumber, LossPayeeMtaRequest request)
        {
            var url = $"{lossPayeUrl}api/policies/{policyNumber}/loss-payee";
            return await PostAsyncTyped<LossPayeeMtaRequest, string>(url, request);
        }
    }
}
