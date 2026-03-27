using Hero.Integration.CoreApi.Interfaces;
using Hero.Integration.FeeCalculatorApi;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net;
using System.Threading.Tasks;
using QuoteFeeRequest = WebApiDto.Dto.Connect.QuoteFeeRequest;

namespace Hero.Controllers
{
    public class FeeController : Controller
    {
        private readonly IFeeApi _feeApi;
        private readonly IFeeCalculatorApi _feeCalculatorApi;

        public FeeController(IFeeApi feeApi, IFeeCalculatorApi feeCalculatorApi)
        {
            _feeApi = feeApi;
            _feeCalculatorApi = feeCalculatorApi;
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> GetMaximumFee([FromBody]QuoteFeeRequest quoteFeeRequest)
        {
            try
            {
                return Ok(await _feeApi.GetMaximumFee(quoteFeeRequest));
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> GetDefaultFee([FromBody]QuoteFeeRequest quoteFeeRequest)
        {
            try
            {
                return Ok(await _feeApi.GetDefaultFee(quoteFeeRequest));
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost("[controller]/[action]")]
        public async Task<IActionResult> GetFeeSplits([FromBody] FeeRequest feeRequest)
        {
            try
            {
                return Ok(await _feeCalculatorApi.GetFeeSplits(feeRequest));
            }
            catch (Exception e)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, e);
            }
        }

    }
}
