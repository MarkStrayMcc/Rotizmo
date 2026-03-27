using System;
using System.Threading.Tasks;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ITaxApi
    {
        Task<decimal> GetTotalTaxRateAsync(Guid draftQuoteId);
        Task<decimal> GetGSTAsync(DateTime inceptionDate);
        Task<decimal> GetGoodsAndServicesTaxAsync(DateTime effectiveDate, string countryIsoCode, bool isRegistered);
    }
}
