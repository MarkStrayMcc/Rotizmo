using Hero.Models;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IEmailApi
    {
        Task SendEmail(Email email, bool isHeroOrigin);

        Task<EmailTemplate> GetEmailTemplateForEnquiry(int enquiryId);

        Task<EmailTemplate> GetEmailTemplate(Hero.Models.EmailType emailType);
    }
}
