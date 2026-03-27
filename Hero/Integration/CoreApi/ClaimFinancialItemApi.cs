using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using WebApiDto.Dto;
using WebApiDto.Dto.ClaimsFinance;


namespace Hero.Integration.CoreApi
{
    public class ClaimFinancialItemApi : BaseApi, IClaimFinancialItemApi
    {
        private readonly string _pendingPaymentRequestsUrl;
        private readonly string _paidPaymentRequestsUrl;
        private readonly string _statusChangeUrl;
        private readonly string _bulkStatusChangeUrl;
        private readonly string _sanctionCheckUrl;

        public ClaimFinancialItemApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
           _pendingPaymentRequestsUrl = configuration["CoreApi:ClaimFinancialItems:PendingPaymentRequests"];
           _paidPaymentRequestsUrl = configuration["CoreApi:ClaimFinancialItems:PaidPaymentRequests"];
           _statusChangeUrl = configuration["CoreApi:ClaimFinancialItems:StatusChange"];
           _bulkStatusChangeUrl = configuration["CoreApi:ClaimFinancialItems:StatusChanges"];
           _sanctionCheckUrl = configuration["CoreApi:ClaimFinancialItems:SanctionCheck"];
        }

        public async Task<List<PaymentRequest>> GetPendingPaymentRequests()
        {
            return await GetAsyncTyped<List<PaymentRequest>>(_pendingPaymentRequestsUrl);
        }

        public async Task<List<PaymentRequest>> GetPaidPaymentRequests()
        {
            var paidPaymentRequestsUrl = $"{_paidPaymentRequestsUrl}";

            return await GetAsyncTyped<List<PaymentRequest>>(paidPaymentRequestsUrl);
        }

        public async Task<ClaimFinancialItemStatusChangeRequestDetail> PostClaimFinancialItemStatusChange(ClaimFinancialItemStatusChangeRequestDetail statusChangeRequest)
        {
            return await PostAsyncTyped<ClaimFinancialItemStatusChangeRequestDetail, ClaimFinancialItemStatusChangeRequestDetail>(_statusChangeUrl, statusChangeRequest);
        }

        public async Task<int> PostClaimFinancialItemStatusChanges(ClaimFinancialItemStatusChangeRequestDetail[] statusChangeRequests)
        {
            return await PostAsyncTyped<ClaimFinancialItemStatusChangeRequestDetail[], int>(_bulkStatusChangeUrl, statusChangeRequests);
        }

        public async Task<ClaimFinancialItemSanctionCheck> PostClaimFinancialItemSanctionCheck(int claimFinancialItemId)
        {
            return await PostAsyncTyped<int, ClaimFinancialItemSanctionCheck>(_sanctionCheckUrl.Replace("{claimFinancialItemId}", $"{claimFinancialItemId}"), claimFinancialItemId);
        }
    }
}