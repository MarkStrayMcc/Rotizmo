using Hero.Integration.CoreApi.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto.UnderwritingReferral;

namespace Hero.Integration.CoreApi
{
    public class ReferralApi : BaseApi, IReferralApi
    {
        private readonly string _referralUrl;

        public ReferralApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _referralUrl = _configuration["CoreApi:Refer"];
        }

        public async Task ReferAsync(ReferralRequest referral)
        {
            await PostAsyncTyped(_referralUrl, referral);
        }
    }
}
