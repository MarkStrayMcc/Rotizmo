using Hero.Integration.CoreApi.Interfaces;
using Hero.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Web.Http;
using EmailType = Hero.Models.EmailType;

namespace Hero.Controllers
{
    public class EmailController : Controller
    {
        private readonly IEmailApi _emailApi;

        public EmailController(IEmailApi emailApi)
        {
            _emailApi = emailApi;
        }

        [Microsoft.AspNetCore.Mvc.HttpPost("email")]
        public async Task<IActionResult> SendEmail([Microsoft.AspNetCore.Mvc.FromBody]Email email, [FromUri] bool isHeroOrigin)
        {
            try
            {
                await _emailApi.SendEmail(email, isHeroOrigin);
                return Ok();
            }
            catch
            {
                return StatusCode(500, "An error occured while attempting to send email");
            }            
        }

        [Microsoft.AspNetCore.Mvc.HttpGet("enquiry/{enquiryId}/emailtemplate")]
        public async Task<IActionResult> GetEmailTemplateForEnquiry(int enquiryId)
        {
            return Ok(await _emailApi.GetEmailTemplateForEnquiry(enquiryId));
        }

        [Microsoft.AspNetCore.Mvc.HttpGet("/emailtemplate/{templateType}")]
        public async Task<IActionResult> GetEmailTemplateForPolicy(int templateType)
        {
            var emailType = (EmailType)templateType;
            return Ok(await _emailApi.GetEmailTemplate(emailType));
        }
    }
}
