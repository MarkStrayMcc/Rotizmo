using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Hero.Infrastructure
{
    public class CfcAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IIdentityHelper _identityHelper;
        private readonly IConfiguration _configuration;

        public CfcAuthenticationMiddleware(RequestDelegate next, IIdentityHelper identityHelper, IConfiguration configuration)
        {
            _configuration = configuration;
            _next = next;
            _identityHelper = identityHelper;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.User.Identity.IsAuthenticated)
            {
                string redirectUrl = this.GetNerdRedirectUrl(context.Request);
                context.Response.Redirect(redirectUrl);

                return;
            }

            string userInitials;
            if (context.Session.TryGetValue("User", out byte[] userInitialsBytes))
            {
                userInitials = Encoding.UTF8.GetString(userInitialsBytes);
            }
            else
            {
                var userDictionary = _identityHelper.GetUserDictionary(context.User.Identity.Name);
                SetUserSessionVariables(context, userDictionary);

                userInitials = userDictionary["User"];
            }

            SetUserCookie(context, userInitials);

            // Call the next delegate/middleware in the pipeline
            await _next(context);
        }

        private static void SetUserSessionVariables(HttpContext context, Dictionary<string, string> userDictionary)
        {
            context.Session.Set("User", Encoding.UTF8.GetBytes(userDictionary["User"]));
            context.Session.Set("Team", Encoding.UTF8.GetBytes(userDictionary["Team"]));
            context.Session.Set("AccessLevel", Encoding.UTF8.GetBytes(userDictionary["AccessLevel"]));
            context.Session.Set("Email", Encoding.UTF8.GetBytes(userDictionary["Email"]));
        }

        private static void SetUserCookie(HttpContext context, string initials)
        {
            context.Response.Cookies.Append("UserInitials", initials);
        }

        private string GetNerdRedirectUrl(HttpRequest request)
        {
            var nerdLegacyUrl = _configuration.GetSection("Authentication").GetValue<string>("NerdLegacyUrl");
            var returnUrl = $"{request.Scheme}://{request.Host.Value}{request.Path.Value}{request.QueryString.Value}";
            var redirectUrl = $"{nerdLegacyUrl}/redirect.aspx?url={HttpUtility.UrlEncode(returnUrl)}";

            return redirectUrl;
        }
    }
}
