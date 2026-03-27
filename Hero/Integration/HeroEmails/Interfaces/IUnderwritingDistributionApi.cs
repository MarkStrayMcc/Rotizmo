using Hero.Models;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails.Interfaces
{
    public interface IUnderwritingDistributionApi
    {
        Task<bool> SendEmail(Email email);
    }
}
