using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using FinancialLedgerInfo = WebApiDto.Dto.FinancialLedger.FinancialLedgerInfo;
using FinancialTransactionDetail = WebApiDto.Dto.FinancialTransactionDetail;

namespace Hero.Integration.CoreApi
{
    public class FinancialLedgerApi : BaseApi, IFinancialLedgerApi
    {
        private readonly string _financialTransactionsUrl;
        private readonly string _financialLedgersUrl;

        public FinancialLedgerApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _financialLedgersUrl = _configuration["CoreApi:FinancialLedgers"];
            _financialTransactionsUrl = _configuration["CoreApi:FinancialTransactions"];
        }

        public async Task<FinancialTransactionsResult> GetFinancialTransactionsAsync(int? bankAccountCurrencyId,
            string ledgerReference = null, string bankAccountName = null)
        {
            var queryParams = BuildQueryParameters(bankAccountCurrencyId, ledgerReference, bankAccountName);
            var financialTransactionsFullUrl = QueryHelpers.AddQueryString(_financialTransactionsUrl, queryParams);
            return await GetAsyncTyped<FinancialTransactionsResult>(financialTransactionsFullUrl);
        }

        public async Task<FinancialTransactionDetail> AddFinancialTransactionAsync(FinancialTransactionDetail financialTransactionDetail)
        {
            var financialTransactionsFullUrl = $"{_financialTransactionsUrl}" + "/detail";
            return await PostAsyncTyped<FinancialTransactionDetail, FinancialTransactionDetail>(financialTransactionsFullUrl, financialTransactionDetail);
        }

        public async Task<List<FinancialLedgerInfo>> GetFinancialLedgerInfo()
        {
            return await GetAsyncTyped<List<FinancialLedgerInfo>>(_financialLedgersUrl);
        }

        public async Task<List<FinancialLedgerLookup>> GetFinancialLedgerLookups()
        {
            var financialLedgerLookupsUrl = $"{_financialLedgersUrl}" + "/lookups";

            return await GetAsyncTyped<List<FinancialLedgerLookup>>(financialLedgerLookupsUrl);
        }

        public async Task<FinancialTransactionDetail> ReverseFinancialTransactionAsync(int financialTransactionId)
        {
            var reverseFinancialTransactionsFullUrl = $"{_financialTransactionsUrl}/{financialTransactionId}/reverse";
            return await PostAsyncTyped<int, FinancialTransactionDetail>(reverseFinancialTransactionsFullUrl, financialTransactionId);
        }

        private static Dictionary<string, string> BuildQueryParameters(int? bankAccountCurrencyId,
                                                                       string ledgerReference, string bankAccountName)
        {
            var queryParams = new Dictionary<string, string>();
            if (bankAccountCurrencyId.HasValue)
            {
                queryParams.Add("bankAccountCurrencyId", bankAccountCurrencyId.ToString());
            }

            if (!string.IsNullOrEmpty(ledgerReference))
            {
                queryParams.Add("ledgerReference", ledgerReference);
            }

            if (!string.IsNullOrEmpty(bankAccountName))
            {
                queryParams.Add("bankAccountName", bankAccountName);
            }

            return queryParams;
        }
    }
}