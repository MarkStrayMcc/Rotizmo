using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IPolicyEmailApi
    {
        Task<EmailTemplate> GetEmailTemplateForPolicy(string policyNumber);
    }
}
