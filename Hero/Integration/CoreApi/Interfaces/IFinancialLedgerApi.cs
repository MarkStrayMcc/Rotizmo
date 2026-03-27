using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IFinancialLedgerApi
    {
        Task<FinancialTransactionsResult> GetFinancialTransactionsAsync(int? bankAccountCurrencyId, string ledgerReference=null, string bankAccountName=null);
        Task<WebApiDto.Dto.FinancialTransactionDetail> AddFinancialTransactionAsync(WebApiDto.Dto.FinancialTransactionDetail financialTransactionDetail);
        Task<List<WebApiDto.Dto.FinancialLedger.FinancialLedgerInfo>> GetFinancialLedgerInfo();
        Task<WebApiDto.Dto.FinancialTransactionDetail> ReverseFinancialTransactionAsync(int financialTransactionId);
        Task<List<FinancialLedgerLookup>> GetFinancialLedgerLookups();
    }
}