using Hero.Integration.HeroEmails.Interfaces;
using Hero.Models;
using Hero.Models.Exceptions;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails
{
    public class PolicyDocumentService : IPolicyDocumentService
    {
        private readonly HttpClient _httpClient;

        private const string Endpoint = "api/v1/policies";
        private const string RequestOriginName = "HERO Emailing Service With UWD";
        private readonly IConfiguration _configuration;

        public PolicyDocumentService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<ICollection<FileData>> GetPolicyRelatedDocumentsAsync(string policyNumber)
        {
            var requestUri = $"{Endpoint}/{policyNumber}/documents";

            using HttpRequestMessage request = new(HttpMethod.Get, requestUri);
            request.Headers.Add("Environment", _configuration.GetSection("FeatureFlag")["Environment"]);
            request.Headers.Add("CipOrigin", RequestOriginName);

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new DocumentException($"Failed to retrieve documents for policy {policyNumber}, Status Code: {response.StatusCode}, Content: {response.Content}");
            }

            var responseContent = await response.Content.ReadAsStreamAsync();
            JsonSerializerOptions options = new() { PropertyNameCaseInsensitive = true };

            var documents = await JsonSerializer.DeserializeAsync<ICollection<FileData>>(responseContent, options)
                ?? throw new DocumentException($"Documents for policy {policyNumber} not found");

            foreach (var document in documents)
            {
                if (string.IsNullOrEmpty(document.Extension))
                {
                    document.Extension = Path.GetExtension(document.Name);
                }
            }

            return documents;
        }
    }
}

