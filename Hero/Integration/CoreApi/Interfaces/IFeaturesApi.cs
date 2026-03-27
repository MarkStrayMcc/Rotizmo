using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IFeaturesApi
    {
        Task<FeatureAccess> IsFeatureActive(string featureName, string identityName, int brokerContactId);
    }
}