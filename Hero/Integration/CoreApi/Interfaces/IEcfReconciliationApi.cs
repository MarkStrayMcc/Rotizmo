using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using WebApiDto.Dto.ClaimsFinance;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IEcfReconciliationApi
    {
        Task<EcfReconciliation> AddOrUpdateEcfReconciliationAsync(EcfReconciliation ecfReconciliationItem);
        Task<HttpResponseMessage> DeleteEcfReconciliationAsync(int ecfReconciliationItemId);
        Task<List<EcfReconciliationSummary>> GetEcfReconciliationSummaries(
            string ucr = "", int? currencyId = null, int? financialLedgerId = null, int? binderId = null, int? sectionId = null, string riskCode = null, bool unreconciledOnly = false);
        Task<List<EcfReconciliationFinancialTransaction>> ReconcileEcfFinancialTransactions(FinancialTransactionEcfReconciliationRequest[] ecfReconciliationRequest);
        Task<List<EcfReconciliationClaimFinancialItem>> ReconcileEcfClaimFinancialItems(ClaimFinancialItemEcfReconciliationRequest[] ecfReconciliationRequest);
        Task<List<EcfReconciliationFinancialTransaction>> GetEcfReconciliationFinancialTransactions(int ecfReconciliationId, int? financialLedgerId = null, int? binderId = null, int? sectionId = null, string riskCode = "", string tags = "");
        Task<List<EcfReconciliationClaimFinancialItem>> GetEcfReconciliationClaimFinancialItems(int ecfReconciliationId, int? binderId = null, int? sectionId = null, string riskCode = "");
        Task<List<string>> GetEcfUcrLookups();
        Task<List<EcfReconciliation>> GetEcfReconciliations(string ucr);
    }
}