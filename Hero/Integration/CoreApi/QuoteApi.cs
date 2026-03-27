using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using System;
using System.Threading.Tasks;
using Hero.Models;
using WebApiDto.Dto;
using WebApiDto.Enum;
using PricingGroup = Hero.Models.PricingGroup;
using Quote = Hero.Models.Quote;
using QuoteBindRequest = Hero.Models.QuoteBindRequest;
using QuoteBindResponse = Hero.Models.QuoteBindResponse;
using QuoteDocumentRequest = Hero.Models.QuoteDocumentRequest;
using SaveQuoteResponse = Hero.Models.SaveQuoteResponse;
using QuotePublishRequest = Hero.Models.QuotePublishRequest;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace Hero.Integration.CoreApi
{
    public class QuoteApi : BaseApi, IQuoteApi
    {
        protected string SaveQuoteUrl { get; }
        protected string GetQuoteUrl { get; }
        protected string RequestQuoteDocumentUrl { get; }
        protected string RequestPolicyDocumentUrl { get; }
        protected string BindQuoteUrl { get; }
        protected string ConfirmQuoteSentUrl { get; }
        protected string PublishQuoteUrl { get; }
        protected string IsPublishableQuoteUrl { get; }
        protected string GetPricingGroupsUrl { get; }
        protected string CreateDraftQuoteForEnquiryUrl { get; }
        
        public QuoteApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            SaveQuoteUrl = _configuration["CoreApi:SaveQuote"];
            GetQuoteUrl = _configuration["CoreApi:Quote"];
            RequestQuoteDocumentUrl = _configuration["CoreApi:RequestQuoteDocument"];
            RequestPolicyDocumentUrl = _configuration["CoreApi:RequestPolicyDocument"];
            BindQuoteUrl = _configuration["CoreApi:BindQuote"];
            ConfirmQuoteSentUrl = _configuration["CoreApi:ConfirmQuoteSent"];
            PublishQuoteUrl = _configuration["CoreApi:QuotePublish"];
            IsPublishableQuoteUrl = _configuration["CoreApi:IsPublishableQuote"];
            GetPricingGroupsUrl = _configuration["CoreApi:GetPricingGroups"];
            CreateDraftQuoteForEnquiryUrl = _configuration["CoreApi:CreateDraftQuoteForEnquiry"];
        }

        public async Task<bool> IsPublishableQuote(int quoteReference)
        {
            var url = IsPublishableQuoteUrl.Replace("{quoteId}", quoteReference.ToString());
            return await GetAsyncTyped<bool>(url);
        }

        public async Task<SaveQuoteResponse> SaveQuoteAsync(Guid draftQuoteId)
        {
            return await GetAsyncTyped<SaveQuoteResponse>($"{SaveQuoteUrl}/{draftQuoteId}");
        }

        public async Task<Quote> GetQuoteAsync(int quoteReference)
        {
            return await GetAsyncTyped<Quote>($"{GetQuoteUrl}/{quoteReference}");
        }

        public async Task<DocumentResult> RequestQuoteDocumentAsync(int quoteId, string format)
        {
            var request = new QuoteDocumentRequest
            {
                QuoteId = quoteId,
                FileFormat = Enum.TryParse(format, true, out FileFormat fileFormat) ? fileFormat : FileFormat.Pdf
            };

            return await PostAsyncTyped<QuoteDocumentRequest, DocumentResult>(RequestQuoteDocumentUrl, request);
        }

        public async Task<DocumentResult> RequestPolicyDocumentAsync(string policyNumber, string format)
        {
            var request = new PolicyDocumentRequest
            {
                PolicyNumber = policyNumber,
                FileFormat = Enum.TryParse(format, true, out FileFormat fileFormat) ? fileFormat : FileFormat.Pdf
            };

            return await PostAsyncTyped<PolicyDocumentRequest, DocumentResult>(RequestPolicyDocumentUrl, request);
        }

        public async Task<QuoteBindResponse> BindQuote(QuoteBindRequest request)
        {
            return await PostAsyncTyped<QuoteBindRequest, QuoteBindResponse>(BindQuoteUrl.Replace("{quoteReference}", request.QuoteId.ToString()), request);
        }

        public async Task ConfirmQuoteSent(int quoteId, string underwriter)
        {
            var url = $"{ConfirmQuoteSentUrl}/{quoteId}/{underwriter}";
            await PostAsyncTyped(url, true);
        }

        public async Task<bool> PublishQuote(QuotePublishRequest request)
        {
            return await PostAsyncTyped<QuotePublishRequest, bool>(PublishQuoteUrl, request);
        }

        public async Task<List<PricingGroup>> GetPricingGroups(PricingGroupsRequest request)
        {
            return await PostAsyncTyped<PricingGroupsRequest, List<PricingGroup>>(GetPricingGroupsUrl, request);
        }

        public async Task<Quote> CreateDraftQuoteForEnquiry(int enquiryId)
        {
            return await GetAsyncTyped<Quote>($"{CreateDraftQuoteForEnquiryUrl}/{enquiryId}");
        }
    }
}