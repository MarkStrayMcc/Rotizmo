using Hero.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails.Interfaces
{
    public interface IQuoteDocumentService
    {
        Task<List<FileData>> GetQuoteRelatedDocumentsAsync(Guid quoteUid);
        Task<QuoteFileData> GetQuoteAdditionalDocumentAsync(Guid quoteUid);

        Task<List<QuoteFileData>> GetQuoteAdditionalDocumentsAsync(Guid quoteUid);
    }
}
