using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using System.Threading.Tasks;
using WebApiDto.Dto.ClaimsFinance;

namespace Hero.Controllers
{
    /// <inheritdoc />
    /// <summary>
    /// Responsible for dealing with requests from the ecf reconciliation pages
    /// </summary>
    [Route("[controller]/[action]")]
    public class EcfReconciliationController : Controller
    {
        private readonly IEcfReconciliationApi _ecfReconciliationApi;

        public EcfReconciliationController(IEcfReconciliationApi ecfReconciliationApi)
        {
            _ecfReconciliationApi = ecfReconciliationApi;
        }

        [HttpGet]
        public async Task<IActionResult> EcfUcrLookups()
        {
            try
            {
                var ucrLookups = await _ecfReconciliationApi.GetEcfUcrLookups();
                return Ok(ucrLookups);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> EcfReconciliations([FromBody] WebApiDto.Dto.ClaimsFinance.EcfReconciliation ecfReconciliationItem)
        {
            try
            {
                var ecfReconciliations = await _ecfReconciliationApi.AddOrUpdateEcfReconciliationAsync(ecfReconciliationItem);
                return Ok(ecfReconciliations);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpDelete("{ecfReconciliationItemId}")]
        public async Task<IActionResult> EcfReconciliations(int ecfReconciliationItemId)
        {
            try
            {
                var response = await _ecfReconciliationApi.DeleteEcfReconciliationAsync(ecfReconciliationItemId);
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> EcfReconciliationSummaries(
             string ucr = "", int? currencyId = null, int? financialLedgerId = null, int? binderId = null, int? sectionId = null, string riskCode = null, bool unreconciledOnly = false)
        {
            try
            {
                var ecfReconciliationSummaries =
                  await _ecfReconciliationApi.GetEcfReconciliationSummaries(ucr, currencyId, financialLedgerId, binderId, sectionId, riskCode, unreconciledOnly);

                return Ok(ecfReconciliationSummaries);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> EcfReconciliations(string ucr)
        {
            try
            {
                var response = await _ecfReconciliationApi.GetEcfReconciliations(ucr);

                return Ok(response);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> ReconcileEcfFinancialTransactions([FromBody] FinancialTransactionEcfReconciliationRequest[] ecfReconciliationRequest)
        {
            try
            {
                var ecfReconciliations = await _ecfReconciliationApi.ReconcileEcfFinancialTransactions(ecfReconciliationRequest);
                return Ok(ecfReconciliations);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> ReconcileEcfClaimFinancialItems([FromBody] ClaimFinancialItemEcfReconciliationRequest[] ecfReconciliationRequest)
        {
            try
            {
                var ecfClaimFinancialItems = await _ecfReconciliationApi.ReconcileEcfClaimFinancialItems(ecfReconciliationRequest);

                return Ok(ecfClaimFinancialItems);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> EcfReconciliationFinancialTransactions(int ecfReconciliationId, int? financialLedgerId = null, int? binderId = null, int? sectionId = null, string riskCode = "", string tags = "")
        {
            try
            {
                var ecfFinancialTransactions = await _ecfReconciliationApi.GetEcfReconciliationFinancialTransactions(ecfReconciliationId, financialLedgerId, binderId, sectionId, riskCode, tags);
               
                return Ok(ecfFinancialTransactions);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpGet]
        public async Task<IActionResult> EcfReconciliationClaimFinancialItems(int ecfReconciliationId, int? binderId = null, int? sectionId = null, string riskCode = "")
        {
            try
            {
                var ecfClaimFinancialItems = await _ecfReconciliationApi.GetEcfReconciliationClaimFinancialItems(ecfReconciliationId, binderId, sectionId, riskCode);
               

                return Ok(ecfClaimFinancialItems);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }
    }
}
