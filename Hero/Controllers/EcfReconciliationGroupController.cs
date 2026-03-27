using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Hero.Models;

namespace Hero.Controllers
{
    /// <inheritdoc />
    /// <summary>
    /// Responsible for dealing with ecf reconciliation group related requests
    /// </summary>
    [Route("[controller]/[action]")]
    public class EcfReconciliationGroupController : Controller
    {
        private readonly IEcfReconciliationGroupApi _ecfReconciliationGroupApi;

        public EcfReconciliationGroupController(IEcfReconciliationGroupApi ecfReconciliationGroupApi)
        {
            _ecfReconciliationGroupApi = ecfReconciliationGroupApi;
        }

        [HttpPost]
        public async Task<IActionResult> Reconcile([FromBody] EcfReconciliationGroupRequest reconciliationGroupRequest)
        {
            try
            {
                var ecfReconciliations = await _ecfReconciliationGroupApi.SaveEcfReconciliationGroupAsync(reconciliationGroupRequest);
                return Ok(ecfReconciliations);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Unreconcile([FromBody] List<int> ecfReconciliationGroupItemIds)
        {
            try
            {
                var response = await _ecfReconciliationGroupApi.DeleteEcfReconciliationGroupsAsync(ecfReconciliationGroupItemIds);
                return Ok(response);
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }
    }
}