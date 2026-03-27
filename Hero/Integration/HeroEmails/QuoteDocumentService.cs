using Hero.Integration.HeroEmails.Interfaces;
using Hero.Models;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails
{
    public class QuoteDocumentService : IQuoteDocumentService
    {
        private readonly HttpClient _httpClient;
        private const string _getQuoteRelatedDocuments = "api/quotes/";
        private const string _getQuoteDocument = "api/QuoteDocument?QuoteUid=";

        public QuoteDocumentService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<FileData>> GetQuoteRelatedDocumentsAsync(Guid quoteUid)
        {
            var url = $"{_httpClient.BaseAddress}{_getQuoteRelatedDocuments}{quoteUid}/documents";
            var response = await _httpClient.GetFromJsonAsync<List<FileData>>(url);

            return response ?? new List<FileData>();
        }

        public async Task<QuoteFileData> GetQuoteAdditionalDocumentAsync(Guid quoteUid)
        {
            var url = $"{_httpClient.BaseAddress}{_getQuoteDocument}{quoteUid}";
            var response = await _httpClient.GetFromJsonAsync<QuoteFileData>(url);

            return response ?? new QuoteFileData();
        }

        public async Task<List<QuoteFileData>> GetQuoteAdditionalDocumentsAsync(Guid quoteUid)
        {
            var url = $"{_httpClient.BaseAddress}api/quotes/{quoteUid}/documents";
            var response = await _httpClient.GetFromJsonAsync<List<QuoteFileData>>(url);

            return response ?? new List<QuoteFileData>();
        }
    }
}
