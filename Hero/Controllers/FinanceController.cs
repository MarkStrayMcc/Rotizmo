using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Hero.Controllers
{
    /// <inheritdoc />
    /// <summary>
    /// Responsible for dealing with requests from the financial transactions page
    /// </summary>
    [Route("[controller]/[action]")]
    public class FinanceController : Controller
    {
        private readonly IFinancialLedgerApi _financialLedgerApi;
        private readonly IClaimFinancialItemApi _claimFinancialItemApi;
        private readonly ILossFundApi _lossFundApi;
        private readonly IEcfReconciliationApi _ecfReconciliationApi;

        public FinanceController(IFinancialLedgerApi financialLedgerApi, IClaimFinancialItemApi claimFinancialItemApi, ILossFundApi lossFundApi, IEcfReconciliationApi ecfReconciliationApi)
        {
            _financialLedgerApi = financialLedgerApi;
            _claimFinancialItemApi = claimFinancialItemApi;
            _lossFundApi = lossFundApi;
            _ecfReconciliationApi = ecfReconciliationApi;
        }

        [HttpGet]
        public async Task<IActionResult> FinancialTransactions([FromQuery] int? bankAccountCurrencyId,
            [FromQuery] string ledgerReference,
            [FromQuery] string bankAccountName
        )
        {
            try
            {
                var financialTransactions = await _financialLedgerApi.GetFinancialTransactionsAsync(bankAccountCurrencyId, ledgerReference, bankAccountName);
                return Ok(financialTransactions);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> FinancialTransactions([FromBody] WebApiDto.Dto.FinancialTransactionDetail financialTransactionDetail)
        {
            try
            {
                var financialTransactions = await _financialLedgerApi.AddFinancialTransactionAsync(financialTransactionDetail);
                return Ok(financialTransactions);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> PendingPaymentRequests()
        {
            try
            {
                var paymentRequests = await _claimFinancialItemApi.GetPendingPaymentRequests();

                return Ok(paymentRequests);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> PaidPaymentRequests()
        {
            try
            {
                var paymentRequests = await _claimFinancialItemApi.GetPaidPaymentRequests();

                return Ok(paymentRequests);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> PostClaimFinancialItemSanctionCheck(int claimFinancialItemId)
        {
            try
            {
                var sanctionsMatch = await _claimFinancialItemApi.PostClaimFinancialItemSanctionCheck(claimFinancialItemId);

                return Ok(sanctionsMatch);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> PostClaimFinancialItemStatusChange([FromBody] WebApiDto.Dto.ClaimsFinance.ClaimFinancialItemStatusChangeRequestDetail statusChangeRequest)
        {
            try
            {
                if (HttpContext.Session.TryGetValue("Email", out var userEmail))
                {
                    statusChangeRequest.ClaimFinancialItemStatusHistoryDetail.AddedByCfcContactEmail = Encoding.UTF8.GetString(userEmail);
                }

                var updatedStatus = await _claimFinancialItemApi.PostClaimFinancialItemStatusChange(statusChangeRequest);

                return Ok(updatedStatus);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> PostClaimFinancialItemStatusChanges([FromBody] WebApiDto.Dto.ClaimsFinance.ClaimFinancialItemStatusChangeRequestDetail[] statusChangeRequests)
        {
            try
            {
                foreach (var statusChangeRequest in statusChangeRequests)
                {
                    if (HttpContext.Session.TryGetValue("Email", out var userEmail))
                    {
                        statusChangeRequest.ClaimFinancialItemStatusHistoryDetail.AddedByCfcContactEmail = Encoding.UTF8.GetString(userEmail);
                    }
                }

                var failedSaveCount = await _claimFinancialItemApi.PostClaimFinancialItemStatusChanges(statusChangeRequests);

                return Ok(failedSaveCount);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> FinancialLedgers()
        {
            try
            {
                var financialLedgerInformation = await _financialLedgerApi.GetFinancialLedgerInfo();
                return Ok(financialLedgerInformation);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }


        [HttpGet]
        public async Task<IActionResult> FinancialLedgerLookups()
        {
            try
            {
                var financialLedgerLookups = await _financialLedgerApi.GetFinancialLedgerLookups();
                return Ok(financialLedgerLookups);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost("{financialTransactionId}")]
        public async Task<IActionResult> ReverseFinancialTransaction(int financialTransactionId)
        {
            try
            {
                var reversedTransaction = await _financialLedgerApi.ReverseFinancialTransactionAsync(financialTransactionId);
                return Ok(reversedTransaction);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> LossFundSummaries()
        {
            try
            {
                var lossFundSummaries = await _lossFundApi.GetLossFunds();
                return Ok(lossFundSummaries);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }
    }
}
