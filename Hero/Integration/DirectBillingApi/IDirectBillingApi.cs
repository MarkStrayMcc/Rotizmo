using Hero.Models.Payments;
using System.Threading.Tasks;

namespace Hero.Integration.DirectBilling
{
    public interface IDirectBillingApi
    {
        Task<Limit> GetPaymentLimit(string countryCode);
        Task<ContactDetails> GetContactDetails(string externalCustomerReference);
    }
}