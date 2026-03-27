using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;
using WebApiDto.Dto.ClaimsFinance;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IClaimFinancialItemApi
    {

        Task<List<WebApiDto.Dto.PaymentRequest>> GetPendingPaymentRequests();
        Task<List<WebApiDto.Dto.PaymentRequest>> GetPaidPaymentRequests();
        Task<ClaimFinancialItemStatusChangeRequestDetail> PostClaimFinancialItemStatusChange(ClaimFinancialItemStatusChangeRequestDetail statusChangeRequest);
        Task<int> PostClaimFinancialItemStatusChanges(ClaimFinancialItemStatusChangeRequestDetail[] statusChangeRequests);
        Task<ClaimFinancialItemSanctionCheck> PostClaimFinancialItemSanctionCheck(int claimFinancialItemId);
    }
}
