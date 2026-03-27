using System.Threading.Tasks;
using WebApiDto.Dto.UnderwritingReferral;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IReferralApi
    {
        Task ReferAsync(ReferralRequest referral);
    }
}
