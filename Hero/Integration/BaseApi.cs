using Hero.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Hero.Integration
{
    public class BaseApi
    {
        protected readonly IConfigurationRoot _configuration;

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly static IEnumerable<string> _correlationIdHeaders = new List<string>
        {
            { "Request-Id" },
            { "Request-Content" },
        };

        protected BaseApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        protected async Task<T> GetAsyncTyped<T>(string url)
        {
            using (var client = new HttpClient())
            {
                AddUserSessionValuesAsCfcHeaders(client);
                var response = await client.GetAsync(url);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new System.Exception(responseBody);

                return JsonConvert.DeserializeObject<T>(responseBody);
            }
        }

        protected async Task<(bool Found, T Value)> TryGetAsync<T>(string url)
        {
            using (var client = new HttpClient())
            {
                AddUserSessionValuesAsCfcHeaders(client);
                client.Timeout = TimeSpan.FromSeconds(180);
                var response = await client.GetAsync(url);
                var status = (int)response.StatusCode;

                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    // Normal "no match" thats not an error
                    return (false, default);
                }

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(responseBody);
                }

                if (string.IsNullOrWhiteSpace(responseBody))
                {
                    // Treat empty paload as "no match"
                    return (false, default);
                }

                T value = JsonConvert.DeserializeObject<T>(responseBody);

                return (true, value);
            }
        }

        protected async Task<Y> PostAsyncTyped<T, Y>(string url, T model) 
        {
            using (var client = new HttpClient())
            {
                AddUserSessionValuesAsCfcHeaders(client);
                client.Timeout = TimeSpan.FromSeconds(180);
                var response = await client.PostAsync(url, model?.AsJson()).ConfigureAwait(false);
                var responseBody = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

                if (!response.IsSuccessStatusCode)
                {
                    throw new System.Exception(responseBody);
                }

                return JsonConvert.DeserializeObject<Y>(responseBody);
            }
        }

        protected async Task PostAsyncTyped<T>(string url, T model)
        {
            using (var client = new HttpClient())
            {
                AddUserSessionValuesAsCfcHeaders(client);
                var response = await client.PostAsync(url, model?.AsJson());
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new System.Exception(responseBody);
            }
        }

        protected async Task<Y> UpdateAsyncTyped<T, Y>(string url, T model)
        {
            return await PostAsyncTyped<T, Y>(url, model);
        }

        protected async Task<HttpResponseMessage> DeleteAsync(string url)
        {
            using (var client = new HttpClient())
            {
                AddUserSessionValuesAsCfcHeaders(client);
                var response = await client.DeleteAsync(url);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    throw new System.Exception(responseBody);

                return response;
            }
        }

        protected void AddUserSessionValuesAsCfcHeaders(HttpClient client)
        {
            if (_httpContextAccessor.HttpContext.Session.TryGetValue("User", out byte[] userBytes))
            {
                client.DefaultRequestHeaders.Add("x-cfc-user", Encoding.UTF8.GetString(userBytes));
            }

            if (_httpContextAccessor.HttpContext.Session.TryGetValue("Team", out byte[] teamBytes))
            {
                client.DefaultRequestHeaders.Add("x-cfc-team", Encoding.UTF8.GetString(teamBytes));
            }

            if (_httpContextAccessor.HttpContext.Session.TryGetValue("AccessLevel", out byte[] accessLevelBytes))
            {
                client.DefaultRequestHeaders.Add("x-cfc-accessLevel", Encoding.UTF8.GetString(accessLevelBytes));
            }

            if (_httpContextAccessor.HttpContext.Session.TryGetValue("Email", out byte[] emailBytes))
            {
                client.DefaultRequestHeaders.Add("x-cfc-email", Encoding.UTF8.GetString(emailBytes));
            }

            foreach(var correlationIdHeader in _correlationIdHeaders)
            {
                if (_httpContextAccessor.HttpContext.Request.Headers.TryGetValue(correlationIdHeader, out var values))
                {
                    client.DefaultRequestHeaders.Add(correlationIdHeader, values.ToArray());
                }
            }
        }
    }
}
