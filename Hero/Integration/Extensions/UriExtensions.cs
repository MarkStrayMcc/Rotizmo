using System;
using System.Web;

namespace Hero.Integration.Extensions
{
    public static class UriExtensions
    {
        public static string AddParameter(this string url, string paramName, string paramValue)
        {
            var uriBuilder = new UriBuilder(url);

            if (!string.IsNullOrEmpty(paramValue))
            {
                var query = HttpUtility.ParseQueryString(uriBuilder.Query);
                query[paramName] = paramValue;
                uriBuilder.Query = query.ToString();
            }

            return uriBuilder.Uri.ToString();
        }
    }
}
