using Hero.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails.Interfaces
{
    public interface IRequestEnrichmentApi
    {
        Task<string> GetEmailTemplate(int emailType, string coverholderInfo = "");
        Task<string> GetQuoteCoverHolderInfo(int quoteReference);
        Task<Dictionary<string, string>> GetQuoteEmailMergeFields(UnderwritingDistributionEmail underwritingDistributionEmail);
        Task<Dictionary<int, Guid>> GetQuoteUids(List<int> quoteIds);
        Task<List<EncryptDocumentsServiceResponse>> GetEncryptedDocuments(EncryptDocumentRequest encryptDocumentRequest);
        Task<List<string>> GetApprovedStatesByCountryId(int countryId);
    }
}
