using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IQuoteApi
    {
        Task<SaveQuoteResponse> SaveQuoteAsync(Guid draftQuoteId);
        Task<Quote> GetQuoteAsync(int quoteReference);
        Task<DocumentResult> RequestQuoteDocumentAsync(int quoteId, string format);
        Task<DocumentResult> RequestPolicyDocumentAsync(string policyNumber, string format);
        Task<QuoteBindResponse> BindQuote(QuoteBindRequest request);
        Task ConfirmQuoteSent(int quoteId, string underwriter);
        Task<bool> PublishQuote(QuotePublishRequest quotePublishRequest);
        Task<bool> IsPublishableQuote(int quoteReference);
        Task<List<PricingGroup>> GetPricingGroups(WebApiDto.Dto.PricingGroupsRequest request);
        Task<Quote> CreateDraftQuoteForEnquiry(int enquiryId);
    }
}