using Quote = WebApiDto.Dto.Quote;

namespace Hero.Integration.CoreApi.Interfaces
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using WebApiDto.Dto.BinderRatingEngine;

    public interface IPricingApi
    {
        Task<List<BinderRatingEngineOutput>> GetDefaultPricingDetails(Guid draftQuoteId);
        Task<List<BinderRatingEngineOutput>> GetDefaultPricingInformationForSavedQuote(Quote quote, bool hasAgreedPremium);
        Task<decimal> CalculateTriaPremium(Models.TriaPremiumRequest request);
    }
}