using Hero.Integration.HeroEmails.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Controllers
{
    public class UnderwritingDistributionEmailController : Controller
    {
        private readonly IHeroEmailingService _heroEmailingService;

        public UnderwritingDistributionEmailController(IHeroEmailingService heroEmailingService)
        {
            _heroEmailingService = heroEmailingService;
        }

        [HttpPost("underwriting-distribution-email/send-quote-email")]
        public async Task<IActionResult> SendQuteEmailWithCoverHolderInfo([FromBody] UnderwritingDistributionEmail underwritingDistributionEmail)
        {
            try
            {
                var isSend = await _heroEmailingService.SendQuoteEmailWithCoverHolder(underwritingDistributionEmail);

                if (!isSend)
                {
                    return BadRequest("Failed to send quote email");
                }
                return Ok(isSend);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPost("underwriting-distribution-email/send-policy-email")]
        public async Task<IActionResult> SendPolicyEmailWithCoverHolderInfo([FromBody] UnderwritingDistributionEmail underwritingDistributionEmail)
        {
            try
            {
                var isSend = await _heroEmailingService.SendPolicyEmailWithCoverHolder(underwritingDistributionEmail);

                if (!isSend)
                {
                    return BadRequest("Failed to send policy email");
                }
                return Ok(isSend);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}