using Hero.Integration.CoreApi.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Hero.Infrastructure;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;
using Microsoft.FeatureManagement;

namespace Hero.Integration.CoreApi
{
    public class FeaturesApi : BaseApi, IFeaturesApi
    {
        private readonly IIdentityHelper _identityHelper;
        private readonly string _featuresUrl;
        private readonly IFeatureManager _featureManager;

        public FeaturesApi(IConfigurationRoot configuration, IIdentityHelper identityHelper,
            IFeatureManager featureManager,
            IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _featuresUrl = _configuration["CoreApi:Features"];
            _identityHelper = identityHelper;
            _featureManager = featureManager;
        }

        public async Task<FeatureAccess> IsFeatureActive(string featureName, string identityName, int brokerContactId)
        {
            var theFeatureIsEnabled = await _featureManager.IsEnabledAsync(featureName);
            
            if (theFeatureIsEnabled)
            {
                return new FeatureAccess { FeatureName = featureName, HasAccess = theFeatureIsEnabled };
            }

            var userEmail = _identityHelper.GetUserEmail(identityName);
            var featureAccessByUserUrl =
                $"{_featuresUrl}?featureName={featureName}&userEmail={userEmail}&brokerContactId={brokerContactId}";
            return await GetAsyncTyped<FeatureAccess>(featureAccessByUserUrl);
        }
    }
}