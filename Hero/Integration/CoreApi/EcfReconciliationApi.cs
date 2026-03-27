using Hero.Integration.CoreApi.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto.ClaimsFinance;

namespace Hero.Integration.CoreApi
{
    public class EcfReconciliationApi : BaseApi, IEcfReconciliationApi
    {
        private readonly string _ecfReconciliationUrl;
        /// <inheritdoc />
        public EcfReconciliationApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _ecfReconciliationUrl = _configuration["CoreApi:EcfReconciliations"];
        }
        public async Task<EcfReconciliation> AddOrUpdateEcfReconciliationAsync(EcfReconciliation ecfReconciliationItem)
        {
            return await PostAsyncTyped<EcfReconciliation, EcfReconciliation>(_ecfReconciliationUrl, ecfReconciliationItem);
        }
        public async Task<HttpResponseMessage> DeleteEcfReconciliationAsync(int ecfReconciliationItemId)
        {
            var requestUrl = $"{_ecfReconciliationUrl}/{ecfReconciliationItemId}";
            return await DeleteAsync(requestUrl);
        }

        public async Task<List<EcfReconciliationSummary>> GetEcfReconciliationSummaries(
            string ucr = "", int? currencyId = null, int? financialLedgerId = null, int? binderId = null, int? sectionId = null, string riskCode = null, bool unreconciledOnly = false)
        {
            var queryParamNameValueCollection = new NameValueCollection
            {
                { "unreconciledOnly", unreconciledOnly ? "true" : "false" }
            };
            if (!String.IsNullOrWhiteSpace(ucr)) queryParamNameValueCollection.Add("ucr", ucr);
            if (!String.IsNullOrWhiteSpace(riskCode)) queryParamNameValueCollection.Add("riskCode", riskCode);
            if (currencyId != null) queryParamNameValueCollection.Add("currencyId", currencyId.ToString());
            if (financialLedgerId != null) queryParamNameValueCollection.Add("financialLedgerId", financialLedgerId.ToString());
            if (binderId != null) queryParamNameValueCollection.Add("binderId", binderId.ToString());
            if (sectionId != null) queryParamNameValueCollection.Add("sectionId", sectionId.ToString());
            queryParamNameValueCollection.Add("unreconciledOnly", unreconciledOnly ? "true" : "false");

            var financialTransactionsFullUrl = $"{_ecfReconciliationUrl}/summaries" + ToQueryString(queryParamNameValueCollection);

            return await GetAsyncTyped<List<EcfReconciliationSummary>>(financialTransactionsFullUrl);
        }
        public async Task<List<EcfReconciliationFinancialTransaction>> ReconcileEcfFinancialTransactions(FinancialTransactionEcfReconciliationRequest[] ecfReconciliationRequest)
        {
            return await PostAsyncTyped<FinancialTransactionEcfReconciliationRequest[], List<EcfReconciliationFinancialTransaction>>(_ecfReconciliationUrl + "/financialTransactions/reconciliationRequests", ecfReconciliationRequest);
        }
        public async Task<List<EcfReconciliationClaimFinancialItem>> ReconcileEcfClaimFinancialItems(ClaimFinancialItemEcfReconciliationRequest[] ecfReconciliationRequest)
        {
            return await PostAsyncTyped<ClaimFinancialItemEcfReconciliationRequest[], List<EcfReconciliationClaimFinancialItem>>(_ecfReconciliationUrl + "/claimFinancialItems/reconciliationRequests", ecfReconciliationRequest);
        }
        public async Task<List<EcfReconciliationFinancialTransaction>> GetEcfReconciliationFinancialTransactions(int ecfReconciliationId, int? financialLedgerId = null, int? binderId = null, int? sectionId = null, string riskCode = "", string tags = "")
        {
            var queryParamNameValueCollection = new NameValueCollection();

            if (financialLedgerId != null) queryParamNameValueCollection.Add("financialLedgerId", financialLedgerId.ToString());
            if (binderId != null) queryParamNameValueCollection.Add("binderId", binderId.ToString());
            if (sectionId != null) queryParamNameValueCollection.Add("sectionId", sectionId.ToString());
            if (!String.IsNullOrWhiteSpace(riskCode)) queryParamNameValueCollection.Add("riskCode", riskCode);
            if (!String.IsNullOrWhiteSpace(tags)) queryParamNameValueCollection.Add("tags", tags);

            var financialTransactionsFullUrl = $"{_ecfReconciliationUrl}/{ecfReconciliationId}/financialTransactions" + ToQueryString(queryParamNameValueCollection);

            return await GetAsyncTyped<List<EcfReconciliationFinancialTransaction>>(financialTransactionsFullUrl);
        }
        public async Task<List<EcfReconciliationClaimFinancialItem>> GetEcfReconciliationClaimFinancialItems(int ecfReconciliationId, int? binderId = null, int? sectionId = null, string riskCode = "")
        {
            var queryParamNameValueCollection = new NameValueCollection();

            if (binderId != null) queryParamNameValueCollection.Add("binderId", binderId.ToString());
            if (sectionId != null) queryParamNameValueCollection.Add("sectionId", sectionId.ToString());
            if (!String.IsNullOrWhiteSpace(riskCode)) queryParamNameValueCollection.Add("riskCode", riskCode);

            var financialTransactionsFullUrl = $"{_ecfReconciliationUrl}/{ecfReconciliationId}/claimFinancialItems" + ToQueryString(queryParamNameValueCollection);

            return await GetAsyncTyped<List<EcfReconciliationClaimFinancialItem>>(financialTransactionsFullUrl);
        }
        public async Task<List<string>> GetEcfUcrLookups()
        {
            return await GetAsyncTyped<List<string>>(this._ecfReconciliationUrl + "/ucrLookups");
        }
        public async Task<List<EcfReconciliation>> GetEcfReconciliations(string ucr)
        {
            var queryParamNameValueCollection = new NameValueCollection
            {
                { "ucr", ucr }
            };

            var ecfReconciliationsUrl = $"{_ecfReconciliationUrl}" + ToQueryString(queryParamNameValueCollection);

            return await GetAsyncTyped<List<EcfReconciliation>>(ecfReconciliationsUrl);
        }
        private string ToQueryString(NameValueCollection nvc)
        {
            var queryParamList = new List<string>();
            foreach (var key in nvc.AllKeys)
            {
                try
                {
                    queryParamList.AddRange((nvc.GetValues(key) ?? throw new NullReferenceException()).Select(val => $"{key}={val}"));
                }
                catch (NullReferenceException)
                {
                }
            }
            var queryParamsArray = queryParamList.ToArray();
            return "?" + string.Join("&", queryParamsArray);
        }
    }
}
