using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Hero.Infrastructure
{
    public class CfcHeadersDelegatingHandler : DelegatingHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly static IEnumerable<string> _passthroughHeaders = new List<string>
        {
            { "Request-Id" },
            { "Request-Content" },
        };

        public CfcHeadersDelegatingHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            AddUserSessionValueAsCfcHeader(request, "User", "x-cfc-user");
            AddUserSessionValueAsCfcHeader(request, "Team", "x-cfc-team");
            AddUserSessionValueAsCfcHeader(request, "AccessLevel", "x-cfc-accessLevel");
            AddUserSessionValueAsCfcHeader(request, "Email", "x-cfc-email");

            foreach (var passthroughHeader in _passthroughHeaders)
            {
                if (_httpContextAccessor.HttpContext.Request.Headers.TryGetValue(passthroughHeader, out var values))
                {
                    request.Headers.Add(passthroughHeader, values.ToArray());
                }
            }

            var response = await base.SendAsync(request, cancellationToken);

            return response;
        }

        private void AddUserSessionValueAsCfcHeader(HttpRequestMessage request, string sessionKey, string headerKey)
        {
            if (_httpContextAccessor.HttpContext.Session.TryGetValue(sessionKey, out byte[] bytes))
            {
                var value = Encoding.UTF8.GetString(bytes);
                request.Headers.Add(headerKey, value);
            }
        }
    }
}
