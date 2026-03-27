using Hero.Models;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails.Interfaces
{
    public interface IHeroEmailingService
    {
        public Task<bool> SendQuoteEmailWithCoverHolder(UnderwritingDistributionEmail underwritingDistributionEmail);
        public Task<bool> SendPolicyEmailWithCoverHolder(UnderwritingDistributionEmail underwritingDistributionEmail);
    }
}
