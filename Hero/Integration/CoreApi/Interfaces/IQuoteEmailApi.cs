using System.Threading.Tasks;

using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IQuoteEmailApi
    {
        Task<EmailTemplate> GetEmailTemplateForQuote(int quoteId);
    }
}
