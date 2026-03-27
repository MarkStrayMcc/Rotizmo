using Hero.Integration.HeroEmails.Interfaces;
using Hero.Models;
using Hero.Models.Exceptions;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails
{
    public class RequestEnrichmentApi : IRequestEnrichmentApi
    {
        private readonly HttpClient _httpClient;
        private const string _getEmailTemplateEndpoint = "api/v1/templates/emailType/";
        private const string _getCoverholderEndpoint = "api/v1/quote/";
        private const string _getMergeFieldsEndpoint = "api/v1/quote/mergefields";
        private const string _getQuoteUidsEndpoint = "api/v1/quote/quoteuids";
        private const string _getEncriptionEndpoint = "api/v1/policyEmails/encrypt-documents";
        private const string _getApprovedStates = "api/v1/helper/approvedstates?countryId=";

        public RequestEnrichmentApi(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromSeconds(180);
        }

        public async Task<string> GetEmailTemplate(int emailType, string coverholderInfo = "")
        {
            try
            {
                var url = $"{_httpClient.BaseAddress + _getEmailTemplateEndpoint + emailType}";
                if (!string.IsNullOrWhiteSpace(coverholderInfo))
                {
                    url += $"?coverholder={Uri.EscapeDataString(coverholderInfo)}";
                }

                var response = await _httpClient.GetFromJsonAsync<EmailTemplate>(url);

                if (response == null || string.IsNullOrEmpty(response.Template))
                {
                    throw new RequestEnrichmentException($"Email template for type {emailType} not found or is empty.");
                }

                return response?.Template;
            }
            catch (Exception e)
            {
                throw new RequestEnrichmentException(e.Message, e.InnerException!);
            }
        }

        public async Task<Dictionary<int, Guid>> GetQuoteUids(List<int> quoteIds)
        {
            var url = $"{_httpClient.BaseAddress}" + _getQuoteUidsEndpoint;
            var response = await _httpClient.PostAsJsonAsync(url, quoteIds);
            if (!response.IsSuccessStatusCode)
            {
                throw new RequestEnrichmentException($"Failed to retrieve quoteid's , Status Code: {response.StatusCode}, Content: {response.Content}");
            }
            return await response.Content.ReadFromJsonAsync<Dictionary<int, Guid>>();
        }

        public async Task<string> GetQuoteCoverHolderInfo(int quoteReference)
        {
            var url = $"{_httpClient.BaseAddress + _getCoverholderEndpoint + quoteReference}" + "/coverholder";

            var response = await _httpClient.GetFromJsonAsync<string>(url);
            if (string.IsNullOrEmpty(response))
            {
                throw new RequestEnrichmentException($"Coverholder information for quote {quoteReference} not found.");
            }
            return response;
        }

        public async Task<Dictionary<string, string>> GetQuoteEmailMergeFields(UnderwritingDistributionEmail underwritingDistributionEmail)
        {
            var url = $"{_httpClient.BaseAddress}{_getMergeFieldsEndpoint}";

            var response = await _httpClient.PostAsJsonAsync(url, underwritingDistributionEmail);
            if (!response.IsSuccessStatusCode)
            {
                throw new RequestEnrichmentException($"Failed to retrieve merge fields for quote {underwritingDistributionEmail.QuoteId}, Status Code: {response.StatusCode}, Content: {response.Content}");
            }

            return await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        }

        public async Task<List<EncryptDocumentsServiceResponse>> GetEncryptedDocuments(EncryptDocumentRequest encryptDocumentRequest)
        {
            var url = $"{_httpClient.BaseAddress}{_getEncriptionEndpoint}";
            var response = await _httpClient.PostAsJsonAsync(url, encryptDocumentRequest);
            if (!response.IsSuccessStatusCode)
            {
                throw new EncryptDocumentException($"Failed to encrypt documents, Status Code: {response.StatusCode}, Content: {response.Content}");
            }
            return await response.Content.ReadFromJsonAsync<List<EncryptDocumentsServiceResponse>>();
        }

        public async Task<List<string>> GetApprovedStatesByCountryId(int countryId)
        {
            var url = $"{_httpClient.BaseAddress}" + _getApprovedStates + countryId;
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                throw new RequestEnrichmentException($"Failed to retrieve approved states, Status Code: {response.StatusCode}, Content: {response.Content}");
            }
            return await response.Content.ReadFromJsonAsync<List<string>>();
        }

    }
}
